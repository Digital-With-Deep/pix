import * as React from "react";
import { ActionHistory, type AgentAction } from "@pix-ui/react";

export default function Example() {
  const [actions, setActions] = React.useState<AgentAction[] | null>(null);

  // Stand-in for a fetch: the windows are built when the data arrives, so the
  // countdown starts from the reader's clock.
  React.useEffect(() => {
    const t = setTimeout(() => {
      const now = Date.now();
      const iso = (offset: number) => new Date(now + offset * 1000).toISOString();
      setActions([
        { id: "a3", at: iso(-20), agent: "triage-agent", action: "Assigned ticket", target: "TCK-5530", status: "done", undoUntil: iso(40) },
        { id: "a2", at: iso(-90), agent: "billing-agent", action: "Applied late fee to", target: "INV-20422", status: "done", undoUntil: iso(210) },
        { id: "a1", at: iso(-900), agent: "billing-agent", action: "Sent payment reminder for", target: "INV-20398", status: "done", undoUntil: iso(-300) },
      ]);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const undo = (id: string) => setActions((list) => (list || []).map((a) => (a.id === id ? { ...a, status: "undone" as const } : a)));

  return <ActionHistory loading={!actions} actions={actions || []} onUndo={undo} style={{ width: "100%" }} />;
}
