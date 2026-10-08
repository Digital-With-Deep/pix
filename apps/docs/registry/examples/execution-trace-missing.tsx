import { ExecutionTrace } from "@pix-ui/react";

export default function Example() {
  return (
    <ExecutionTrace
      title="Execution trace"
      calls={2}
      duration="140ms"
      tokens="960 tokens"
      cost="$0.012"
      steps={[
        { name: "fetch_invoice", args: { id: "INV-88214" }, duration: "58ms", result: '{ "total": 48210.00, "currency": "USD" }' },
        { name: "approve_payment", args: { id: "INV-88214" }, duration: "82ms", result: '{ "status": "approved" }' },
      ]}
      missing={[
        { name: "match_po", note: "Available to the agent but never called — the invoice was approved without a PO match" },
        { name: "check_duplicate_invoice", label: "never called" },
      ]}
    />
  );
}
