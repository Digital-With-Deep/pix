import { AuditLog } from "@pix-ui/react";

const events = [
  {
    id: "evt_7f2a1c",
    ts: "2026-01-14T07:12:03Z",
    message: "Approved invoice payment within policy limit",
    agent: "AP-Resolver",
    identity: "svc-ap-resolver@prod",
    kind: "decision",
    system: "SAP S/4HANA",
    resource: "invoice:INV-88213",
    action: "approve_payment",
    outcome: "ok",
    entity: "vendor:acme-corp",
    control: "SOD-04",
    run_id: "run_4471",
    trace_id: "trace_9a21",
    latency_ms: 182,
    rationale:
      "Amount $4,200 is under the $10,000 auto-approval limit and the vendor is on the approved list.",
  },
  {
    id: "evt_55aa10",
    ts: "2026-01-14T09:22:40Z",
    message: "Escalated bank detail change for manual review",
    agent: "AP-Resolver",
    identity: "svc-ap-resolver@prod",
    kind: "escalation",
    system: "SAP S/4HANA",
    resource: "vendor:globex",
    action: "escalate",
    outcome: "ok",
    entity: "vendor:globex",
    control: "SOD-04",
    run_id: "run_4482",
    trace_id: "trace_0c13",
    latency_ms: 44,
    rationale:
      "Bank detail changes made outside business hours are routed to a human reviewer regardless of amount.",
  },
  {
    id: "evt_1dcb77",
    ts: "2026-01-14T12:48:51Z",
    message: "Revoked standing access after 90-day inactivity",
    agent: "Access-Reviewer",
    identity: "svc-access-review@prod",
    kind: "decision",
    system: "Okta",
    resource: "user:r.chen",
    action: "revoke_access",
    outcome: "ok",
    entity: "user:r.chen",
    control: "AC-02",
    run_id: "run_6031",
    trace_id: "trace_55e1",
    latency_ms: 190,
    rationale:
      "No sign-in or resource access recorded in 90 days; policy requires revocation pending manager re-approval.",
  },
  {
    id: "evt_bb12d9",
    ts: "2026-01-14T14:18:33Z",
    message: "Approved invoice payment within policy limit",
    agent: "AP-Resolver",
    identity: "svc-ap-resolver@prod",
    kind: "decision",
    system: "SAP S/4HANA",
    resource: "invoice:INV-88340",
    action: "approve_payment",
    outcome: "ok",
    entity: "vendor:initech",
    control: "SOD-04",
    run_id: "run_4510",
    trace_id: "trace_3dd2",
    latency_ms: 176,
    rationale:
      "Amount $1,180 is under the $10,000 auto-approval limit and the vendor is on the approved list.",
  },
  {
    id: "evt_cf3301",
    ts: "2026-01-14T15:51:19Z",
    message: "Payment blocked — vendor flagged for sanctions screening",
    agent: "AP-Resolver",
    identity: "svc-ap-resolver@prod",
    kind: "decision",
    system: "SAP S/4HANA",
    resource: "invoice:INV-88355",
    action: "approve_payment",
    outcome: "denied",
    entity: "vendor:northwind",
    control: "SOD-04",
    run_id: "run_4522",
    trace_id: "trace_6611",
    latency_ms: 165,
    rationale:
      "Vendor matched a sanctions watchlist entry pending compliance review; payment held automatically.",
  },
];

export default function Example() {
  return (
    <AuditLog
      title="Audit log"
      events={events}
      now="2026-01-14T18:00:00Z"
      height={460}
      defaultFilters={[{ field: "kind", op: "is", values: ["decision", "escalation"] }]}
      columns={[
        {
          key: "resource",
          label: "Resource",
          width: 190,
          render: (e) => (
            <span style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>
              {String(e.resource ?? "—")}
            </span>
          ),
        },
        { key: "action", label: "Action", width: 150 },
        { key: "entity", label: "Entity", flex: true },
        { key: "control", label: "Control", width: 90 },
      ]}
    />
  );
}
