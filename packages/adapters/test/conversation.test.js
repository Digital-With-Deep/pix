import { test } from "node:test";
import assert from "node:assert/strict";
import { createThread, applyEvents, toConversationMessages, addUserMessage, applyEvent } from "../src/index.js";
import { fixture } from "./helpers.js";

test("toConversationMessages passes text through and renders parts", () => {
  let s = addUserMessage(createThread({ assistantName: "Ledger assistant" }), "Why is it blocked?", "u1");
  s = applyEvents(s, fixture("ai-sdk"));
  const out = toConversationMessages(s.messages, (m) => `<${m.kind} ${m.props.status}>`);
  assert.deepEqual(out[0], { id: "u1", role: "user", content: "Why is it blocked?", streaming: false });
  assert.deepEqual(out[1].author, "Ledger assistant");
  assert.equal(out[2].content, "<tool done>");
  assert.equal(out.at(-1).content, "<approval pending>");
  assert.equal(new Set(out.map((m) => m.id)).size, out.length, "ids are unique");
});

test("pix: local run events", () => {
  let s = applyEvent(createThread({ adapter: "adk" }), { type: "pix:run-started", runId: "r9" });
  assert.deepEqual([s.status, s.runId], ["running", "r9"]);
  s = applyEvent(s, { type: "pix:run-finished" });
  assert.equal(s.status, "done");
  s = applyEvent(s, { type: "pix:run-error", message: "Network lost." });
  assert.deepEqual([s.status, s.error], ["error", "Network lost."]);
  s = applyEvent(s, { type: "pix:user-message", text: "Try again" });
  assert.deepEqual([s.status, s.error], ["idle", undefined], "a new user turn clears the error");
});
