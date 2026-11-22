// Type-level checks for the hand-written contract (run by `pnpm typecheck`, never executed).
import {
  createThread, applyEvent, applyEvents, addUserMessage, resolveApproval, pendingApprovals, toConversationMessages, readEventStream,
  type ThreadState, type ThreadMessage, type ToolCallData, type ApprovalData, type AgentEvent,
} from "../src/index";

const s0: ThreadState = createThread({ adapter: "ag-ui", assistantName: "Ledger assistant", approvalTools: ["payments.release"], describeApproval: (r) => ({ title: r.toolName, risk: "high" }) });
const s1 = applyEvent(s0, { type: "RUN_STARTED", threadId: "t", runId: "r" });
const s2 = applyEvents(s1, [{ type: "pix:user-message", text: "Hi" }, { type: "TEXT_MESSAGE_CONTENT", messageId: "m", delta: "x" }]);
const s3 = resolveApproval(addUserMessage(s2, "Go"), "a", { approved: true, edits: { amount: "1" } });
const pending: string[] = pendingApprovals(s3).map((m) => m.approvalId);

for (const m of s3.messages as ThreadMessage[]) {
  if (m.kind === "text") { const c: string = m.content; const st: boolean = m.streaming; void c; void st; }
  else if (m.kind === "tool") { const p: ToolCallData = m.props; void p; }
  else { const p: ApprovalData = m.props; void p; }
}

const conv = toConversationMessages(s3.messages, (m) => ({ node: m.kind }));
const first: string | { node: "tool" | "approval" } = conv[0].content;

async function pump(res: Response) {
  let s = s0;
  for await (const e of readEventStream(res)) s = applyEvent(s, e);
  return s;
}
// A reducer usable with React.useReducer(applyEvent, ...).
const reducer: (state: ThreadState, event: AgentEvent) => ThreadState = applyEvent;

// @ts-expect-error unknown adapter name
createThread({ adapter: "other" });

void pending; void first; void pump; void reducer;
