import { ApprovalCard } from "@pix-ui/react";

export default function Example() {
  return (
    <ApprovalCard
      title="Update vendor bank details"
      action="vendor.update_payment"
      agent="Payables agent"
      target="Vendor 40112 · Northwind Supply"
      reason="The vendor sent a signed change form on Nov 18. The new account matches the form."
      risk="high"
      reversible={false}
      changes={[
        { field: "Bank name", before: "First Harbor Bank", after: "Coastal Trust" },
        { field: "Account ending", key: "iban_last4", before: "4417", after: "9032" },
        { field: "Effective from", before: "—", after: "2026-12-01" },
      ]}
      evidence={[{ label: "Change form, page 2", href: "#" }, "Call log 11-18"]}
      onApprove={() => {}}
      onReject={() => {}}
      requireRejectReason
    />
  );
}
