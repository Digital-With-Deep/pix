import { ToolCall } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ToolCall name="search_invoices" status="done" duration="420 ms"
        input={{ vendor: "Northwind Supply", status: "open" }}
        output={{ count: 3, total: "$18,420.00" }} />
      <ToolCall name="fetch_exchange_rate" status="running" description="EUR to USD for Nov 21"
        input={{ from: "EUR", to: "USD", date: "2026-11-21" }} />
      <ToolCall name="post_journal_entry" status="failed" duration="1.2 s"
        input={{ ledger: "GL-2100", amount: 1240 }}
        error="Period 2026-11 is closed for posting." onRetry={() => {}} />
      <ToolCall name="vendor.update_payment" status="approval" description="Waiting for a person to approve" />
      <ToolCall name="notify_owner" status="queued" />
    </div>
  );
}
