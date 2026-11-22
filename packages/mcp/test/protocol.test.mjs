// Unit tests for the JSON-RPC handling and the suggestion scoring, without a child process.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, ErrorCode, loadData, suggest, tokenize } from "../src/index.js";

const data = loadData();
const server = createServer({ data, version: "9.9.9" });

test("a line that is not JSON is a parse error with a null id", () => {
  const reply = server.handleLine("{not json");
  assert.equal(reply.id, null);
  assert.equal(reply.error.code, ErrorCode.ParseError);
});

test("blank lines are ignored", () => {
  assert.equal(server.handleLine("   "), null);
});

test("a message without jsonrpc 2.0 is an invalid request", () => {
  const reply = server.handle({ id: 1, method: "ping" });
  assert.equal(reply.error.code, ErrorCode.InvalidRequest);
});

test("a batch gets a batch of replies, without replies to notifications", () => {
  const reply = server.handle([
    { jsonrpc: "2.0", id: 1, method: "ping" },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list" },
  ]);
  assert.deepEqual(reply.map((r) => r.id), [1, 2]);
});

test("serverInfo carries the version passed in", () => {
  const reply = server.handle({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } });
  assert.equal(reply.result.serverInfo.version, "9.9.9");
  assert.equal(reply.result.protocolVersion, "2024-11-05");
});

test("tools/call rejects non-object arguments", () => {
  const reply = server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_component", arguments: "Button" } });
  assert.equal(reply.error.code, ErrorCode.InvalidParams);
});

test("suggest_component validates limit", () => {
  const reply = server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "suggest_component", arguments: { description: "table", limit: 50 } } });
  assert.equal(reply.result.isError, true);
});

test("tokenize splits camelCase names and drops stopwords", () => {
  assert.deepEqual(tokenize("AIResponse with DataTable rows"), ["ai", "response", "data", "table", "row"]);
});

test("suggest finds the expected component for common descriptions", () => {
  const top = (q) => suggest(data, q, 1)[0]?.component.name;
  assert.equal(top("a table of invoices with sortable columns"), "DataTable");
  assert.equal(top("compare two runs to see what changed"), "FingerprintDiff");
  assert.equal(top("warning banner when a license expires"), "LicenseBanner");
  assert.equal(top("left navigation rail with nested groups"), "Sidebar");
  assert.deepEqual(suggest(data, "the of and", 3), []);
});

test("every component has a description, docs URL, props and docs text", () => {
  assert.ok(data.components.length >= 45);
  for (const c of data.components) {
    assert.ok(c.description, `${c.name} description`);
    assert.match(c.docsUrl, /^https:\/\/pixui\.digitalwithdeep\.com\/docs\/components\/[a-z-]+\/$/);
    assert.ok(Array.isArray(c.props) && c.props.length, `${c.name} props`);
    assert.ok(c.docs.length > 100, `${c.name} docs`);
    assert.doesNotMatch(c.docs, /<Preview|<PropsTable|^---/);
  }
});
