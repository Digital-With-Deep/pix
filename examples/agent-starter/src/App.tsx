import { useReducer, useState } from "react";
import { Button, Conversation, PromptInput } from "@pix-ui/react";
import { applyEvent, createThread, pendingApprovals, toConversationMessages, type AgentEvent } from "@pix-ui/adapters";
import { renderPart, type Decision } from "./renderPart";
import { resumeAfterApproval, runScenario } from "./mockAgent";

const SUGGESTION = "Why is invoice INV-20417 blocked?";

function init() {
  return createThread({
    adapter: "ai-sdk",
    assistantName: "Ledger assistant",
    agent: "ledger-assistant",
    // Turn the raw tool call into a card a reviewer can decide from.
    describeApproval: ({ toolName, input }) => {
      if (toolName !== "payments.release") return undefined;
      const { invoiceId, amount } = (input ?? {}) as { invoiceId?: string; amount?: number };
      return {
        title: "Release a blocked invoice for payment",
        action: toolName,
        target: invoiceId,
        reason: "The price variance is 3.5%, inside the 5% tolerance agreed with the vendor.",
        risk: "high",
        reversible: false,
        changes: [
          { field: "Invoice status", before: "Blocked", after: "Released", editable: false },
          { field: "Payment amount", key: "amount", before: null, after: amount?.toFixed(2) },
        ],
        evidence: ["PO-88123", "Receipt GR-5521"],
      };
    },
  });
}

export function App() {
  const [thread, dispatch] = useReducer(applyEvent, undefined, init);
  const [draft, setDraft] = useState("");
  const waiting = pendingApprovals(thread).length > 0;
  const busy = thread.status === "running";

  async function pump(events: AsyncIterable<AgentEvent>) {
    try {
      for await (const event of events) dispatch(event);
    } catch (e) {
      dispatch({ type: "pix:run-error", message: e instanceof Error ? e.message : "The agent stopped." });
    }
  }

  function send(text: string) {
    if (!text.trim() || busy || waiting) return;
    dispatch({ type: "pix:user-message", text });
    setDraft("");
    void pump(runScenario());
  }

  function decide(approvalId: string, decision: Decision) {
    const decidedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    dispatch({ type: "pix:approval-decision", approvalId, ...decision, decidedBy: "You", decidedAt });
    void pump(resumeAfterApproval(approvalId, decision.approved, decision.edits));
  }

  const messages = toConversationMessages(thread.messages, (m) => renderPart(m, decide));

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px", height: "100vh", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, font: "600 18px var(--font-sans, system-ui)", color: "var(--fg1, #18181b)" }}>Accounts payable assistant</h1>
        <p style={{ margin: "4px 0 0", font: "400 13px var(--font-sans, system-ui)", color: "var(--fg3, #71717a)" }}>
          A mock agent streamed through <code>@pix-ui/adapters</code>. Nothing leaves your browser.
        </p>
      </header>
      <Conversation
        messages={messages}
        style={{ flex: 1, border: "1px solid var(--border, #e4e4e7)", borderRadius: 6, background: "var(--surface, #fff)" }}
        empty={
          <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <span style={{ font: "400 13px var(--font-sans, system-ui)", color: "var(--fg3, #71717a)" }}>Ask about a blocked invoice to start.</span>
            <Button variant="secondary" onClick={() => send(SUGGESTION)}>{SUGGESTION}</Button>
          </div>
        }
        footer={
          <PromptInput
            value={draft}
            onChange={setDraft}
            onSubmit={({ text }) => send(text)}
            placeholder="Ask about an invoice, a payment or a vendor"
            showModelSelector={false}
            showPlusMenu={false}
            allowFiles={false}
            rows={2}
            disabled={busy || waiting}
            error={thread.error}
            hint={waiting ? "Approve or reject the payment above to continue." : busy ? "The assistant is responding." : undefined}
          />
        }
      />
    </main>
  );
}
