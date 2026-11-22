// Google ADK (Agent Development Kit) events, as JSON from `/run_sse` or as plain objects.
// https://google.github.io/adk-docs/events/
// Field names are read in both camelCase (JSON over HTTP, TypeScript) and snake_case (Python objects).
import { isRecord } from "./core.js";

const str = (v) => (typeof v === "string" && v !== "" ? v : undefined);
const pick = (o, camel, snake) => (o == null ? undefined : o[camel] !== undefined ? o[camel] : o[snake]);

export const ADK_CONFIRMATION = "adk_request_confirmation";

export function translateAdk(event, state) {
  if (!isRecord(event)) return [];
  const ops = [];
  const author = str(event.author) || "agent";
  const key = `adk:${str(pick(event, "invocationId", "invocation_id")) || "run"}:${author}`;
  const errorCode = pick(event, "errorCode", "error_code");
  const errorMessage = pick(event, "errorMessage", "error_message");
  const longRunning = new Set(pick(event, "longRunningToolIds", "long_running_tool_ids") || []);
  const partial = event.partial === true;
  const parts = (isRecord(event.content) && Array.isArray(event.content.parts)) ? event.content.parts : [];

  if (author !== "user") {
    // Thought parts (thought: true) are reasoning, not answer text.
    const text = parts.filter((p) => isRecord(p) && typeof p.text === "string" && p.thought !== true).map((p) => p.text).join("");
    if (text) {
      if (partial) ops.push({ op: "text-delta", id: key, delta: text });
      else ops.push({ op: "text-set", id: key, text, final: true });
    }
  }

  parts.forEach((p, i) => {
    if (!isRecord(p)) return;
    const call = pick(p, "functionCall", "function_call");
    const response = pick(p, "functionResponse", "function_response");
    if (isRecord(call)) {
      const id = str(call.id) || `${str(event.id) || key}:${i}`;
      const name = str(call.name);
      if (name === ADK_CONFIRMATION) {
        const args = isRecord(call.args) ? call.args : {};
        const original = pick(args, "originalFunctionCall", "original_function_call");
        const confirmation = pick(args, "toolConfirmation", "tool_confirmation");
        const origId = isRecord(original) ? str(original.id) : undefined;
        ops.push({
          op: "approval",
          approvalId: id,
          toolCallId: origId,
          toolName: isRecord(original) ? str(original.name) : undefined,
          input: isRecord(original) ? original.args : undefined,
          message: isRecord(confirmation) ? str(confirmation.hint) : undefined,
          metadata: isRecord(confirmation) ? confirmation.payload : undefined,
        });
        return;
      }
      ops.push({ op: "tool-start", toolCallId: id, name });
      ops.push({ op: "tool-input", toolCallId: id, name, input: call.args === undefined ? {} : call.args });
      if (longRunning.has(id) && state.options.longRunningAsApproval !== false) {
        ops.push({ op: "approval", approvalId: id, toolCallId: id });
      }
    } else if (isRecord(response)) {
      const id = str(response.id);
      const name = str(response.name);
      const body = response.response;
      if (name === ADK_CONFIRMATION) {
        if (id) ops.push({ op: "approval-decision", approvalId: id, approved: isRecord(body) && body.confirmed === true });
        return;
      }
      if (!id) return;
      if (isRecord(body) && typeof body.error === "string" && Object.keys(body).length === 1) ops.push({ op: "tool-error", toolCallId: id, name, error: body.error });
      else ops.push({ op: "tool-output", toolCallId: id, name, output: body });
    }
  });

  if (errorCode !== undefined || errorMessage !== undefined) {
    ops.push({ op: "run-error", message: str(errorMessage) || `The agent stopped with ${String(errorCode)}.` });
  } else if (pick(event, "turnComplete", "turn_complete") === true) {
    ops.push({ op: "run-finish" });
  }
  return ops;
}
