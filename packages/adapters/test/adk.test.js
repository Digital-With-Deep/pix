import { test } from "node:test";
import assert from "node:assert/strict";
import { createThread, applyEvent, applyEvents, resolveApproval } from "../src/index.js";
import { fixture, summary } from "./helpers.js";

test("adk: partial text accumulates, then the final event replaces it", () => {
  let s = createThread({ adapter: "adk" });
  const [e1, e2, e3] = fixture("adk");
  s = applyEvents(s, [e1, e2]);
  assert.deepEqual([s.messages[0].content, s.messages[0].streaming], ["Checking invoice `INV-20417`.", true]);
  s = applyEvent(s, e3);
  assert.equal(s.messages.length, 1);
  assert.deepEqual([s.messages[0].content, s.messages[0].streaming], ["Checking invoice `INV-20417`.", false]);
});

test("adk: function calls, responses and long-running tools (camelCase JSON)", () => {
  let s = applyEvents(createThread({ adapter: "adk" }), fixture("adk"));
  assert.deepEqual(summary(s), ["text:assistant:done", "tool:done", "tool:approval", "approval:pending"]);
  assert.deepEqual(s.messages[1].props.input, { invoice_id: "INV-20417" });
  assert.deepEqual(s.messages[2].props.output, { status: "pending" }, "the long-running tool's interim response shows while it waits");
  s = resolveApproval(s, "adk-fc-2", { approved: true });
  assert.equal(s.messages[2].props.status, "running");
});

test("adk: longRunningAsApproval false leaves long-running tools running", () => {
  const s = applyEvents(createThread({ adapter: "adk", longRunningAsApproval: false }), fixture("adk").slice(0, 6));
  assert.deepEqual(summary(s), ["text:assistant:done", "tool:done", "tool:running"]);
});

test("adk: adk_request_confirmation maps to an approval on the original call (snake_case)", () => {
  let s = applyEvents(createThread({ adapter: "adk" }), fixture("adk-confirmation").slice(0, 2));
  assert.deepEqual(summary(s), ["tool:approval", "approval:pending"]);
  const card = s.messages[1];
  assert.deepEqual([card.approvalId, card.toolCallId, card.props.title, card.props.action], ["fc-confirm", "fc-close", "Close the October 2026 period", "close_period"]);
  s = applyEvents(s, fixture("adk-confirmation").slice(2));
  assert.deepEqual(summary(s), ["tool:done", "approval:approved", "text:assistant:done"]);
  assert.equal(s.status, "done", "turnComplete ends the run");
});

test("adk: error events and thought parts", () => {
  let s = applyEvent(createThread({ adapter: "adk" }), { author: "a", content: { parts: [{ text: "planning", thought: true }] } });
  assert.equal(s.messages.length, 0);
  s = applyEvent(s, { author: "a", errorCode: "SAFETY", errorMessage: "Response blocked." });
  assert.deepEqual([s.status, s.error], ["error", "Response blocked."]);
  s = applyEvent(s, { author: "a", error_code: "MAX_TOKENS" });
  assert.equal(s.error, "The agent stopped with MAX_TOKENS.");
});

test("adk: tool error responses fail the call", () => {
  const s = applyEvents(createThread({ adapter: "adk" }), [
    { author: "a", content: { parts: [{ functionCall: { id: "f", name: "fx_rate", args: {} } }] } },
    { author: "a", content: { parts: [{ functionResponse: { id: "f", name: "fx_rate", response: { error: "Rate feed unavailable." } } }] } },
  ]);
  assert.deepEqual([s.messages[0].props.status, s.messages[0].props.error], ["failed", "Rate feed unavailable."]);
});
