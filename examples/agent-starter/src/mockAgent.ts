// A mock agent that speaks the Vercel AI SDK UI message stream protocol, with no network and no keys.
// Swap it for a real stream: `for await (const event of readEventStream(await fetch("/api/chat", …))) dispatch(event)`.
// All names, amounts and ids below are fictional.
import type { AiSdkChunk } from "@pix-ui/adapters";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let run = 0;

async function* streamText(id: string, text: string): AsyncGenerator<AiSdkChunk> {
  yield { type: "text-start", id };
  for (const piece of text.match(/\S+\s*|\s+/g) ?? []) {
    await wait(28);
    yield { type: "text-delta", id, delta: piece };
  }
  yield { type: "text-end", id };
}

/** The first turn: explain the blocked invoice, look it up, then ask to release it. */
export async function* runScenario(): AsyncGenerator<AiSdkChunk> {
  const r = ++run;
  yield { type: "start", messageId: `msg_${r}` };
  await wait(300);
  yield* streamText(`t${r}a`, "Checking invoice `INV-20417` against purchase order `PO-88123`.");

  const lookup = `call_lookup_${r}`;
  yield { type: "tool-input-start", toolCallId: lookup, toolName: "invoices.lookup" };
  yield { type: "tool-input-available", toolCallId: lookup, toolName: "invoices.lookup", input: { invoiceId: "INV-20417", include: ["po", "receipts"] } };
  await wait(900);
  yield {
    type: "tool-output-available",
    toolCallId: lookup,
    output: { vendor: "Harbor Lane Paper Co.", invoiceAmount: 4812.5, poAmount: 4650, variance: 162.5, variancePct: 3.5, block: "price_variance" },
  };

  yield* streamText(
    `t${r}b`,
    [
      "The invoice is blocked by a price variance.\n\n",
      "| | Amount |\n| --- | --- |\n| Invoice | 4,812.50 |\n| Purchase order | 4,650.00 |\n| Variance | 162.50 (3.5%) |\n\n",
      "The variance is inside the 5% tolerance agreed with Harbor Lane Paper Co., so I can release it for the next payment run. ",
      "That needs your approval.",
    ].join(""),
  );

  const release = `call_release_${r}`;
  yield { type: "tool-input-start", toolCallId: release, toolName: "payments.release" };
  yield { type: "tool-input-available", toolCallId: release, toolName: "payments.release", input: { invoiceId: "INV-20417", amount: 4812.5 } };
  yield { type: "tool-approval-request", approvalId: `apr_${r}`, toolCallId: release };
  yield { type: "finish", finishReason: "tool-calls" };
}

/** The turn after a decision. A real agent receives the decision with the next request and carries on. */
export async function* resumeAfterApproval(approvalId: string, approved: boolean, edits?: Record<string, string>): AsyncGenerator<AiSdkChunk> {
  const r = approvalId.replace(/^apr_/, "");
  const release = `call_release_${r}`;
  yield { type: "start", messageId: `msg_${r}_resume` };
  if (!approved) {
    yield { type: "tool-output-denied", toolCallId: release };
    yield* streamText(`t${r}c`, "Understood. `INV-20417` stays blocked. I added a note asking the buyer to confirm the price with Harbor Lane Paper Co.");
    yield { type: "finish", finishReason: "stop" };
    return;
  }
  await wait(1100);
  const amount = edits?.amount ?? "4812.50";
  yield { type: "tool-output-available", toolCallId: release, output: { released: true, amount, paymentRun: "PR-1128", scheduledFor: "Friday" } };
  yield* streamText(`t${r}c`, `Released \`INV-20417\` for ${amount}. It goes out in payment run \`PR-1128\` on Friday.`);
  yield { type: "finish", finishReason: "stop" };
}
