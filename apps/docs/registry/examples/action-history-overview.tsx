import * as React from "react";
import { ActionHistory, type AgentAction } from "@pix-ui/react";

// A fixed clock keeps this example the same on every load.
const NOW = "2026-03-18T14:30:00Z";

const INITIAL: AgentAction[] = [
  { id: "act_0912", at: "2026-03-18T14:27:41Z", agent: "billing-agent", action: "Applied late fee to", target: "INV-20417", status: "done", undoUntil: "2026-03-18T14:42:41Z", detail: "1.5% of $20,826.40, per supplier terms." },
  { id: "act_0911", at: "2026-03-18T14:21:05Z", agent: "triage-agent", action: "Assigned ticket", target: "TCK-5521", status: "done", undoUntil: "2026-03-18T14:36:05Z" },
  { id: "act_0910", at: "2026-03-18T14:02:19Z", agent: "billing-agent", action: "Sent payment reminder for", target: "INV-20398", status: "done", undoUntil: "2026-03-18T14:12:19Z", detail: "Emails cannot be recalled once delivered." },
  { id: "act_0909", at: "2026-03-18T13:58:47Z", agent: "triage-agent", action: "Closed duplicate ticket", target: "TCK-5517", status: "undone" },
  { id: "act_0908", at: "2026-03-18T13:44:02Z", agent: "billing-agent", action: "Posted credit note", target: "CN-1180", status: "failed", detail: "The ledger rejected the entry: period is closed." },
  { id: "act_0907", at: "2026-03-18T13:40:30Z", agent: "triage-agent", action: "Waiting to merge accounts", target: "ACC-3302", status: "pending" },
];

export default function Example() {
  const [actions, setActions] = React.useState(INITIAL);
  const undo = (id: string) => setActions((list) => list.map((a) => (a.id === id ? { ...a, status: "undone" as const } : a)));

  return <ActionHistory actions={actions} now={NOW} onUndo={undo} style={{ width: "100%" }} />;
}
