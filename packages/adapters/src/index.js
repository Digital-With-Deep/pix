import { initialState, applyOp, localOps } from "./core.js";
import { translateAiSdk } from "./ai-sdk.js";
import { translateAgUi, trackAgUi } from "./ag-ui.js";
import { translateAdk } from "./adk.js";

export { readEventStream } from "./sse.js";

const TRANSLATORS = { "ai-sdk": translateAiSdk, "ag-ui": translateAgUi, adk: translateAdk };

/** Start an empty thread for one protocol. */
export function createThread(options = {}) {
  const adapter = options.adapter || "ai-sdk";
  if (!TRANSLATORS[adapter]) throw new Error(`@pix-ui/adapters: unknown adapter "${adapter}". Use "ai-sdk", "ag-ui" or "adk".`);
  return { ...initialState({ ...options, adapter }), agui: {} };
}

/** Pure reducer: returns a new state with one agent event (or one `pix:` event) applied. Unknown events are ignored. */
export function applyEvent(state, event) {
  if (!event || typeof event !== "object") return state;
  const local = typeof event.type === "string" && event.type.startsWith("pix:") ? localOps(event) : null;
  const ops = local || TRANSLATORS[state.options.adapter](event, state);
  let next = state;
  for (const op of ops) next = applyOp(next, op);
  if (!local && state.options.adapter === "ag-ui") {
    const agui = trackAgUi(event, next.agui || {});
    if (agui !== next.agui) next = { ...next, agui };
  }
  return next;
}

/** Apply events in order. */
export function applyEvents(state, events) {
  let next = state;
  for (const e of events) next = applyEvent(next, e);
  return next;
}

/** Add the person's own turn. */
export function addUserMessage(state, text, id) {
  return applyEvent(state, { type: "pix:user-message", text, id });
}

/** Record a reviewer's decision on an approval: updates the ApprovalCard and its ToolCall. */
export function resolveApproval(state, approvalId, decision = {}) {
  return applyEvent(state, { ...decision, type: "pix:approval-decision", approvalId, approved: decision.approved === true });
}

/** Approvals still waiting on a person. */
export function pendingApprovals(state) {
  return state.messages.filter((m) => m.kind === "approval" && m.props.status === "pending");
}

/**
 * Map thread messages to Conversation messages. Text passes through as a string (streaming Markdown);
 * tool and approval messages are handed to `renderPart`, which returns your UI (for example a ToolCall or ApprovalCard).
 */
export function toConversationMessages(messages, renderPart) {
  return messages.map((m) => {
    const base = { id: m.id, role: m.role };
    if (m.author) base.author = m.author;
    if (m.kind === "text") return { ...base, content: m.content, streaming: m.streaming };
    return { ...base, content: renderPart(m) };
  });
}
