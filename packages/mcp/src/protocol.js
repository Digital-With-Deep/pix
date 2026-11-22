// A minimal MCP (Model Context Protocol) server over JSON-RPC 2.0, written by
// hand so the package has no runtime dependencies. It implements the
// initialize handshake (protocol revisions 2024-11-05 through 2025-11-25),
// ping, tools/list and tools/call. Messages are newline-delimited JSON on
// stdio; nothing but protocol messages is ever written to stdout.
import { TOOL_DEFINITIONS, callTool } from "./tools.js";

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
export const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

export const ErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
};

const INSTRUCTIONS =
  "PIX is a React design system for AI products (@pix-ui/react). Use suggest_component to find components for a UI, " +
  "get_component for props and working examples, and list_components to see everything. " +
  'Import "@pix-ui/react/styles.css" once at the app root.';

/**
 * Creates a message handler. `handle(message)` takes one parsed JSON-RPC
 * message (or a batch array) and returns the response object(s) to send, or
 * null when nothing should be sent (notifications and responses).
 */
export function createServer({ data, name = "pix", version = "0.0.0" }) {
  const respond = (id, result) => ({ jsonrpc: "2.0", id, result });
  const fail = (id, code, message, extra) => ({ jsonrpc: "2.0", id, error: { code, message, ...(extra ? { data: extra } : {}) } });

  function handleOne(msg) {
    if (msg === null || typeof msg !== "object" || Array.isArray(msg) || msg.jsonrpc !== "2.0") {
      return fail(msg?.id ?? null, ErrorCode.InvalidRequest, "Invalid request: expected a JSON-RPC 2.0 object");
    }
    const isRequest = "id" in msg && msg.id !== null && typeof msg.method === "string";
    // Responses to requests we never send, and notifications, need no reply.
    if (!isRequest) {
      if (typeof msg.method !== "string" && !("result" in msg || "error" in msg)) {
        return fail(msg.id ?? null, ErrorCode.InvalidRequest, "Invalid request: missing method");
      }
      return null;
    }
    const { id, method } = msg;
    const params = msg.params ?? {};
    try {
      switch (method) {
        case "initialize": {
          const requested = params.protocolVersion;
          const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : LATEST_PROTOCOL_VERSION;
          return respond(id, {
            protocolVersion,
            capabilities: { tools: {} },
            serverInfo: { name, title: "PIX design system", version },
            instructions: INSTRUCTIONS,
          });
        }
        case "ping":
          return respond(id, {});
        case "tools/list":
          return respond(id, { tools: TOOL_DEFINITIONS });
        case "tools/call": {
          if (typeof params.name !== "string") return fail(id, ErrorCode.InvalidParams, "tools/call needs a tool `name`");
          if (params.arguments !== undefined && (typeof params.arguments !== "object" || params.arguments === null || Array.isArray(params.arguments))) {
            return fail(id, ErrorCode.InvalidParams, "tools/call `arguments` must be an object");
          }
          const result = callTool(data, params.name, params.arguments);
          if (!result) return fail(id, ErrorCode.InvalidParams, `Unknown tool: ${params.name}`);
          return respond(id, result);
        }
        default:
          return fail(id, ErrorCode.MethodNotFound, `Method not found: ${method}`);
      }
    } catch (err) {
      return fail(id, ErrorCode.InternalError, err instanceof Error ? err.message : String(err));
    }
  }

  function handle(msg) {
    if (Array.isArray(msg)) {
      if (!msg.length) return fail(null, ErrorCode.InvalidRequest, "Invalid request: empty batch");
      const out = msg.map(handleOne).filter(Boolean);
      return out.length ? out : null;
    }
    return handleOne(msg);
  }

  /** Parses one line of input and returns the reply to write, or null. */
  function handleLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return fail(null, ErrorCode.ParseError, "Parse error: each line must be one JSON-RPC message");
    }
    return handle(msg);
  }

  return { handle, handleLine };
}

/** Wires a server to a readable and writable stream of newline-delimited JSON. */
export function serveStdio(server, input = process.stdin, output = process.stdout) {
  let buffer = "";
  input.setEncoding("utf8");
  input.on("data", (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      const reply = server.handleLine(line);
      if (reply) output.write(`${JSON.stringify(reply)}\n`);
    }
  });
  input.on("end", () => {
    const reply = server.handleLine(buffer);
    if (reply) output.write(`${JSON.stringify(reply)}\n`);
  });
}
