import { ApprovalCard } from "@pix-ui/react";

export default function Example() {
  return (
    <ApprovalCard
      title="Send a credit note"
      action="billing.issue_credit"
      agent="Support agent"
      target="Invoice INV-20931"
      reason="The customer was billed twice for the October seat change."
      risk="medium"
      reversible
      changes={[
        { field: "Amount", key: "amount", before: "$0.00", after: "$1,240.00", },
        { field: "Memo", key: "memo", after: "Duplicate October seat charge", },
      ]}
      onApprove={() => {}}
      onReject={() => {}}
      onEdit={() => {}}
    />
  );
}
