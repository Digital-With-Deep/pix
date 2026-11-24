// Spawns the real server (src/server.js) and talks MCP to it over stdio.
// Needs dist/data.json, so run `pnpm build` first.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const serverPath = fileURLToPath(new URL("../src/server.js", import.meta.url));
const dataPath = fileURLToPath(new URL("../dist/data.json", import.meta.url));

let child;
let nextId = 1;
const pending = new Map();
const stray = [];

function request(method, params) {
  const id = nextId++;
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, ...(params ? { params } : {}) })}\n`);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no reply to ${method}`)), 5000);
    pending.set(id, (msg) => { clearTimeout(timer); resolve(msg); });
  });
}

const notify = (method, params) => child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, ...(params ? { params } : {}) })}\n`);
const call = (name, args) => request("tools/call", { name, arguments: args });
const textOf = (reply) => reply.result.content.map((c) => c.text).join("\n");

before(() => {
  assert.ok(existsSync(dataPath), "dist/data.json is missing: run `pnpm build` first");
  child = spawn(process.execPath, [serverPath], { stdio: ["pipe", "pipe", "pipe"] });
  let buf = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buf += chunk;
    let nl;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      const msg = JSON.parse(line); // every stdout line must be valid JSON
      const resolve = pending.get(msg.id);
      if (resolve) { pending.delete(msg.id); resolve(msg); } else stray.push(msg);
    }
  });
});

after(() => {
  child.stdin.end();
  child.kill();
});

test("initialize negotiates a protocol version and advertises tools", async () => {
  const reply = await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "pix-test", version: "0.0.0" },
  });
  assert.equal(reply.jsonrpc, "2.0");
  assert.equal(reply.result.protocolVersion, "2025-06-18");
  assert.deepEqual(reply.result.capabilities, { tools: {} });
  assert.equal(reply.result.serverInfo.name, "pix");
  notify("notifications/initialized");
});

test("an unknown protocol version gets the latest supported one", async () => {
  const reply = await request("initialize", { protocolVersion: "1900-01-01", capabilities: {}, clientInfo: { name: "t", version: "1" } });
  assert.match(reply.result.protocolVersion, /^\d{4}-\d{2}-\d{2}$/);
  assert.notEqual(reply.result.protocolVersion, "1900-01-01");
});

test("ping returns an empty result", async () => {
  const reply = await request("ping");
  assert.deepEqual(reply.result, {});
});

test("tools/list returns the three tools with input schemas", async () => {
  const reply = await request("tools/list");
  const names = reply.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, ["get_component", "list_components", "suggest_component"]);
  for (const t of reply.result.tools) assert.equal(t.inputSchema.type, "object");
});

test("list_components lists every component with a docs URL", async () => {
  const text = textOf(await call("list_components", {}));
  assert.match(text, /- Button: .*https:\/\/pixui\.digitalwithdeep\.com\/docs\/components\/button\//);
  assert.match(text, /- AIResponse: /);
});

test("get_component returns props, docs text and example source", async () => {
  const reply = await call("get_component", { name: "button" });
  assert.equal(reply.result.isError, undefined);
  const text = textOf(reply);
  assert.match(text, /^# Button/);
  assert.match(text, /\| `variant`\? \|/);
  assert.match(text, /## When to use/);
  assert.match(text, /import \{ Button \} from "@pix-ui\/react";/);
  assert.match(text, /npx shadcn add https:\/\/pixui\.digitalwithdeep\.com\/r\/button-variants\.json/);
  assert.doesNotMatch(text, /<Preview|<PropsTable/);
});

test("get_component reports an unknown name as a tool error", async () => {
  const reply = await call("get_component", { name: "Buton" });
  assert.equal(reply.result.isError, true);
  assert.match(textOf(reply), /No PIX component named "Buton"/);
});

test("suggest_component ranks the obvious match first", async () => {
  const text = textOf(await call("suggest_component", { description: "a toggle to turn a setting on or off", limit: 2 }));
  assert.match(text, /^Best matches/);
  assert.match(text, /\n1\. Switch /);
  assert.doesNotMatch(text, /\n3\. /);
});

test("an unknown tool is a JSON-RPC error", async () => {
  const reply = await call("nope", {});
  assert.equal(reply.error.code, -32602);
});

test("an unknown method is a JSON-RPC error", async () => {
  const reply = await request("resources/list");
  assert.equal(reply.error.code, -32601);
});

test("notifications get no reply", async () => {
  notify("notifications/cancelled", { requestId: 99 });
  await request("ping"); // anything sent after the notification has been answered by now
  assert.deepEqual(stray, []);
});
