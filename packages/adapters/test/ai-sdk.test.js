import { test } from "node:test";
import assert from "node:assert/strict";
import { createThread, applyEvent, applyEvents, resolveApproval, pendingApprovals, addUserMessage } from "../src/index.js";
import { fixture, summary } from "./helpers.js";

test("ai-sdk: recorded stream maps to text, tool and approval messages", () => {
  let s = addUserMessage(createThread({ adapter: "ai-sdk", assistantName: "Ledger assistant" }), "Why is INV-20417 blocked?");
  s = applyEvents(s, fixture("ai-sdk"));
  assert.deepEqual(summary(s), ["text:user:done", "text:assistant:done", "tool:done", "text:assistant:done", "tool:approval", "approval:pending"]);
  assert.equal(s.status, "done");
  assert.equal(s.messages[1].content, "Checking invoice `INV-20417` against its purchase order.");
  assert.equal(s.messages[1].author, "Ledger assistant");
  assert.equal(s.messages[3].content, "The invoice is blocked by a price variance of $162.50.");
  assert.notEqual(s.messages[1].id, s.messages[3].id, "a reused text id after text-end starts a new message");
  const lookup = s.messages[2];
  assert.equal(lookup.props.name, "invoices.lookup");
  assert.deepEqual(lookup.props.input, { invoiceId: "INV-20417" });
  assert.equal(lookup.props.output.variance, 162.5);
  const approval = s.messages[5];
  assert.equal(approval.approvalId, "apr_1");
  assert.equal(approval.toolCallId, "call_release");
  assert.equal(approval.props.title, "Allow payments.release to run");
  assert.deepEqual(approval.props.changes.map((c) => c.field), ["invoiceId", "amount"]);
  assert.equal(pendingApprovals(s).length, 1);
});

test("ai-sdk: text streams as one growing message", () => {
  let s = createThread();
  s = applyEvents(s, [{ type: "start" }, { type: "text-start", id: "a" }, { type: "text-delta", id: "a", delta: "Hel" }]);
  assert.equal(s.status, "running");
  assert.deepEqual(s.messages.map((m) => [m.content, m.streaming]), [["Hel", true]]);
  const before = s;
  s = applyEvent(s, { type: "text-delta", id: "a", delta: "lo" });
  assert.equal(s.messages[0].content, "Hello");
  assert.equal(before.messages[0].content, "Hel", "state is not mutated");
});

test("ai-sdk: streamed tool input shows while it arrives", () => {
  let s = createThread();
  s = applyEvents(s, [
    { type: "tool-input-start", toolCallId: "c", toolName: "fx.rate" },
    { type: "tool-input-delta", toolCallId: "c", inputTextDelta: "{\"pair\":\"EU" },
  ]);
  assert.equal(s.messages[0].props.status, "queued");
  assert.equal(s.messages[0].props.input, "{\"pair\":\"EU");
  s = applyEvent(s, { type: "tool-input-delta", toolCallId: "c", inputTextDelta: "R/USD\"}" });
  assert.deepEqual(s.messages[0].props.input, { pair: "EUR/USD" });
  s = applyEvent(s, { type: "tool-input-available", toolCallId: "c", toolName: "fx.rate", input: { pair: "EUR/USD" } });
  assert.equal(s.messages[0].props.status, "running");
});

test("ai-sdk: tool errors, denials, preliminary output and stream errors", () => {
  let s = createThread();
  s = applyEvents(s, [
    { type: "tool-input-available", toolCallId: "a", toolName: "ledger.post", input: {} },
    { type: "tool-output-error", toolCallId: "a", errorText: "Period 2026-10 is closed." },
    { type: "tool-input-error", toolCallId: "b", toolName: "ledger.post", input: "{bad", errorText: "Input is not valid JSON." },
    { type: "tool-input-available", toolCallId: "c", toolName: "report.build", input: {} },
    { type: "tool-output-available", toolCallId: "c", output: { pages: 1 }, preliminary: true },
    { type: "tool-input-available", toolCallId: "d", toolName: "payments.release", input: {} },
    { type: "tool-approval-request", approvalId: "x", toolCallId: "d" },
  ]);
  assert.deepEqual(s.messages.slice(0, 3).map((m) => [m.props.status, m.props.error]), [["failed", "Period 2026-10 is closed."], ["failed", "Input is not valid JSON."], ["running", undefined]]);
  s = resolveApproval(s, "x", { approved: false, reason: "Wrong vendor" });
  s = applyEvent(s, { type: "tool-output-denied", toolCallId: "d" });
  assert.equal(s.messages[3].props.status, "failed");
  assert.equal(s.messages[3].props.error, "Rejected: Wrong vendor");
  assert.equal(s.messages[4].props.status, "rejected");
  assert.equal(s.messages[4].props.rejectReason, "Wrong vendor");
  s = applyEvents(s, [{ type: "text-start", id: "t" }, { type: "text-delta", id: "t", delta: "Part" }, { type: "error", errorText: "Upstream timed out." }]);
  assert.equal(s.status, "error");
  assert.equal(s.error, "Upstream timed out.");
  assert.equal(s.messages.at(-1).streaming, false);
});

test("ai-sdk: approving resumes the held call, then its output completes it", () => {
  let s = applyEvents(createThread(), fixture("ai-sdk"));
  s = resolveApproval(s, "apr_1", { approved: true, decidedBy: "R. Okafor", decidedAt: "10:42" });
  const tool = s.messages.find((m) => m.id === "tool:call_release");
  assert.equal(tool.props.status, "running");
  const card = s.messages.find((m) => m.kind === "approval");
  assert.deepEqual([card.props.status, card.props.decidedBy, card.props.decidedAt], ["approved", "R. Okafor", "10:42"]);
  s = applyEvents(s, [{ type: "start" }, { type: "tool-output-available", toolCallId: "call_release", output: { released: true } }, { type: "finish" }]);
  assert.equal(s.messages.find((m) => m.id === "tool:call_release").props.status, "done");
  assert.equal(pendingApprovals(s).length, 0);
});

test("ai-sdk: tool-approval-response in the stream resolves the card", () => {
  let s = applyEvents(createThread(), fixture("ai-sdk"));
  s = applyEvent(s, { type: "tool-approval-response", approvalId: "apr_1", approved: true });
  assert.equal(s.messages.find((m) => m.kind === "approval").props.status, "approved");
});

test("ai-sdk: unknown and malformed events are ignored", () => {
  const s = createThread();
  for (const e of [null, 1, "x", {}, { type: "data-weather", data: {} }, { type: "text-delta" }, { type: "tool-output-available" }, { type: "reasoning-delta", id: "r", delta: "x" }]) {
    assert.equal(applyEvent(s, e), s);
  }
});

test("describeApproval fills card fields", () => {
  let s = createThread({
    agent: "ledger-agent",
    describeApproval: ({ toolName, input }) => ({ title: "Release a payment", target: input.invoiceId, risk: "high", reversible: false, action: toolName }),
  });
  s = applyEvents(s, fixture("ai-sdk"));
  const card = s.messages.find((m) => m.kind === "approval").props;
  assert.deepEqual([card.title, card.target, card.risk, card.reversible, card.agent, card.action, card.status], ["Release a payment", "INV-20417", "high", false, "ledger-agent", "payments.release", "pending"]);
});

test("approval edits update the card and the tool input", () => {
  let s = applyEvents(createThread(), fixture("ai-sdk"));
  s = resolveApproval(s, "apr_1", { approved: true, edits: { amount: "4650" } });
  const card = s.messages.find((m) => m.kind === "approval").props;
  assert.deepEqual(card.changes.find((c) => c.field === "amount"), { field: "amount", key: "amount", before: 4812.5, after: "4650" });
  assert.equal(s.messages.find((m) => m.id === "tool:call_release").props.input.amount, "4650");
});

test("createThread rejects an unknown adapter", () => {
  assert.throws(() => createThread({ adapter: "nope" }), /unknown adapter/);
});
