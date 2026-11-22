#!/usr/bin/env node
// `npx @pix-ui/mcp` — starts the PIX MCP server on stdio.
import { createServer, serveStdio, loadData, pkg } from "./index.js";

let data;
try {
  data = loadData();
} catch (err) {
  // stdout is reserved for protocol messages, so diagnostics go to stderr.
  console.error(`@pix-ui/mcp: could not read dist/data.json (${err.message}). Run \`pnpm build\` first.`);
  process.exit(1);
}

serveStdio(createServer({ data, name: "pix", version: pkg.version }));
console.error(`@pix-ui/mcp ${pkg.version}: serving ${data.components.length} PIX components over stdio`);
