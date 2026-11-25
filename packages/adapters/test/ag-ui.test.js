import { test } from "node:test";
import assert from "node:assert/strict";
import { createThread, applyEvent, applyEvents, resolveApproval } from "../src/index.js";
import { fixture, summary } from "./helpers.js";

test("ag-ui: recorded run maps to messages, with the interrupt as an approval", () => {
  const s = applyEvents(createThread({ adapter: "ag-ui" }), fixture("ag-ui"));
  assert.deepEqual(summary(s), ["text:assistant:done", "tool:done", "text:assistant:done", "tool:approval", "approval:pending"]);
  assert.equal(s.runId, "run_1");
  assert.equal(s.status, "done");
  assert.equal(s.messages[0].content, "Checking invoice `INV-20417`.");
  assert.deepEqual(s.messages[1].props.input, { invoiceId: "INV-20417" });
  assert.deepEqual(s.messages[1].props.output, { variance: 162.5 }, "JSON result content is parsed");
  assert.equal(s.messages[2].content, "A price variance of $162.50 is holding it.", "TEXT_MESSAGE_CHUNK reuses the first chunk's id");
  const card = s.messages[4];
  assert.equal(card.approvalId, "int_1");
  assert.equal(card.toolCallId, "tc_release");
  assert.equal(card.props.title, "Release INV-20417 for payment");
  assert.equal(card.props.action, "payments.release");
  assert.equal(card.props.expiresAt, "2026-11-30T17:00:00Z");
});

test("ag-ui: a streaming message is open until TEXT_MESSAGE_END", () => {
  let s = applyEvents(createThread({ adapter: "ag-ui" }), [
    { type: "RUN_STARTED", threadId: "t", runId: "r" },
    { type: "TEXT_MESSAGE_START", messageId: "m", role: "assistant" },
    { type: "TEXT_MESSAGE_CONTENT", messageId: "m", delta: "Reconciling" },
  ]);
  assert.equal(s.messages[0].streaming, true);
  s = applyEvent(s, { type: "TEXT_MESSAGE_END", messageId: "m" });
  assert.equal(s.messages[0].streaming, false);
});

test("ag-ui: approvalTools holds frontend tool calls for a person", () => {
  let s = applyEvents(createThread({ adapter: "ag-ui", approvalTools: ["payments.release"] }), [
    { type: "RUN_STARTED", threadId: "t", runId: "r" },
    { type: "TOOL_CALL_START", toolCallId: "a", toolCallName: "invoices.lookup" },
    { type: "TOOL_CALL_END", toolCallId: "a" },
    { type: "TOOL_CALL_CHUNK", toolCallId: "b", toolCallName: "payments.release", delta: "{\"amount\":" },
    { type: "TOOL_CALL_CHUNK", delta: "120}" },
    { type: "TOOL_CALL_END", toolCallId: "b" },
    { type: "RUN_FINISHED", threadId: "t", runId: "r" },
  ]);
  assert.deepEqual(summary(s), ["tool:running", "tool:approval", "approval:pending"]);
  assert.deepEqual(s.messages[1].props.input, { amount: 120 });
  s = resolveApproval(s, "b", { approved: true });
  s = applyEvent(s, { type: "TOOL_CALL_RESULT", messageId: "x", toolCallId: "b", content: "released" });
  assert.deepEqual([s.messages[1].props.status, s.messages[1].props.output], ["done", "released"]);
});

test("ag-ui: RUN_ERROR closes streaming text and records the error", () => {
  const s = applyEvents(createThread({ adapter: "ag-ui" }), [
    { type: "RUN_STARTED", threadId: "t", runId: "r" },
    { type: "TEXT_MESSAGE_CHUNK", messageId: "m", delta: "Partial" },
    { type: "RUN_ERROR", message: "Agent crashed.", code: "E1" },
  ]);
  assert.deepEqual([s.status, s.error, s.messages[0].streaming], ["error", "Agent crashed.", false]);
});
