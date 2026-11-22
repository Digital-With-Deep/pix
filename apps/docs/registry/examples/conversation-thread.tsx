import { Conversation, ToolCall, ApprovalCard, PromptInput } from "@pix-ui/react";

export default function Example() {
  return (
    <Conversation
      height={520}
      footer={<PromptInput placeholder="Ask about this vendor" onSubmit={() => {}} />}
      messages={[
        { id: "1", role: "user", author: "Priya", time: "09:02", content: "Why did the Northwind payment bounce?" },
        { id: "2", role: "assistant", author: "Payables agent", time: "09:02",
          content: <ToolCall name="search_payments" status="done" duration="380 ms" input={{ vendor: 40112, status: "returned" }} output={{ returned: 1, reason: "R03 no account" }} /> },
        { id: "3", role: "assistant", author: "Payables agent", time: "09:03",
          content: "The bank returned it with code **R03**, which means the account no longer exists.\n\nNorthwind sent new details on Nov 18. I can update them, but that needs your approval." },
        { id: "4", role: "assistant", author: "Payables agent", time: "09:03",
          content: <ApprovalCard title="Update vendor bank details" action="vendor.update_payment" risk="high" reversible={false}
            changes={[{ field: "Account ending", before: "4417", after: "9032" }]} onApprove={() => {}} onReject={() => {}} /> },
      ]}
    />
  );
}
