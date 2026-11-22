// Programmatic entry: load the bundled data and build a server or call tools
// directly. The CLI (src/server.js) uses the same pieces.
import { readFileSync } from "node:fs";

export { createServer, serveStdio, SUPPORTED_PROTOCOL_VERSIONS, LATEST_PROTOCOL_VERSION, ErrorCode } from "./protocol.js";
export { TOOL_DEFINITIONS, callTool, suggest, findComponent, tokenize } from "./tools.js";

export const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

/** Reads dist/data.json, which `pnpm build` generates from the docs and the .d.ts contracts. */
export function loadData(url = new URL("../dist/data.json", import.meta.url)) {
  return JSON.parse(readFileSync(url, "utf8"));
}
