import { ExecutionTrace } from "@pix-ui/react";

export default function Example() {
  return (
    <ExecutionTrace
      title="Execution trace"
      calls={3}
      duration="212ms"
      tokens="1,480 tokens"
      cost="$0.019"
      defaultOpen
      steps={[
        { name: "fetch_invoice", args: { id: "INV-88214" }, duration: "58ms", result: '{ "total": 48210.00, "currency": "USD" }' },
        {
          name: "match_po",
          args: { invoiceId: "INV-88214" },
          duration: "96ms",
          result: '{ "match": "partial", "variance": 1200.00 }',
          note: "Matched on vendor name only — PO number on the invoice was never checked",
        },
        { name: "approve_payment", args: { id: "INV-88214" }, duration: "58ms", result: '{ "status": "approved" }', flagged: true },
      ]}
    />
  );
}
