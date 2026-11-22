import { ApprovalCard } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ApprovalCard
        title="Pause the nightly sync"
        action="pipeline.pause"
        target="orders-nightly"
        risk="low"
        status="approved"
        decidedBy="Priya Natarajan"
        decidedAt="Nov 22, 09:14"
      />
      <ApprovalCard
        title="Delete 312 stale customer records"
        action="crm.bulk_delete"
        target="Segment: inactive > 3 years"
        risk="critical"
        reversible={false}
        status="rejected"
        decidedBy="Sam Okafor"
        decidedAt="Nov 22, 09:20"
        rejectReason="Legal hold applies to 40 of these. Re-run with the hold list excluded."
      />
    </div>
  );
}
