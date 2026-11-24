import * as React from "react";
import { PatternDetail, type PatternFinding, type PatternActivity } from "@pix-ui/react";

const days = ["Nov 11", "Nov 12", "Nov 13", "Nov 14", "Nov 15", "Nov 16", "Nov 17", "Nov 18", "Nov 19", "Nov 20", "Nov 21", "Nov 22", "Nov 23", "Nov 24"];
const matched = [8, 11, 9, 14, 22, 31, 28, 36, 41, 39, 44, 52, 47, 30];

const initial: PatternFinding = {
  id: "pat_0141",
  name: "Refund tool retried after a timeout, issuing two refunds",
  summary:
    "When issue_refund takes longer than 10 seconds the agent treats the call as failed and calls it again. The first call usually completes, so the customer is refunded twice. It affects refunds over $200, which go through the slower manual-review path.",
  severity: "high",
  status: "open",
  categories: ["Tool failure", "Duplicate action"],
  rule: "Refund agent failures",
  firstSeen: "2026-11-11T08:12:00Z",
  lastSeen: "2026-11-24T09:02:00Z",
  severityRaised: true,
  impact: { traces: 412, users: 87, sessions: 96, share: 0.061, from: "2026-11-11", to: "2026-11-24" },
  suggestedFix:
    "Pass an idempotency key to issue_refund and have the retry reuse it, or check get_refund_status before retrying. The retry wrapper in tools/refunds.py retries on any timeout without either.",
  cause: "confirmed",
  impactSeries: days.map((label, i) => ({
    label,
    matched: { traces: matched[i], users: Math.round(matched[i] * 0.21), sessions: Math.round(matched[i] * 0.23) },
    total: { traces: 480 + i * 6, users: 310 + i * 3, sessions: 350 + i * 4 },
  })),
  models: [
    { model: "atlas-large-2", matchShare: 0.82, trafficShare: 0.44 },
    { model: "atlas-small-2", matchShare: 0.18, trafficShare: 0.56 },
  ],
  evidence: [
    {
      id: "ev1",
      traceId: "tr-9f31c2",
      kind: "problem",
      title: "Two refunds of 248.00 on one order",
      at: "2026-11-24T09:02:00Z",
      excerpt:
        'tool issue_refund(order="ORD-77120", amount=248.00) -> timeout after 10.0s\nassistant: The refund did not go through. Let me try again.\ntool issue_refund(order="ORD-77120", amount=248.00) -> ok refund_id="RF-5521"',
      highlight: "The refund did not go through. Let me try again.",
      reason:
        "The agent concludes the first call failed from the timeout alone. The ledger shows RF-5520 posted 14 seconds later for the same order.",
    },
    {
      id: "ev2",
      traceId: "tr-a04e77",
      kind: "contrast",
      title: "Same timeout, status checked first",
      at: "2026-11-22T16:45:00Z",
      excerpt:
        'tool issue_refund(order="ORD-76902", amount=310.00) -> timeout after 10.0s\ntool get_refund_status(order="ORD-76902") -> pending refund_id="RF-5388"\nassistant: Your refund is being processed.',
      highlight: 'tool get_refund_status(order="ORD-76902") -> pending refund_id="RF-5388"',
      reason: "On the smaller model the agent checks status before retrying and issues one refund.",
    },
  ],
  code: [
    {
      file: "tools/refunds.py",
      lines: "118-131",
      revision: "4c1e9ab",
      note: "The retry wrapper retries issue_refund on any timeout and sends no idempotency key.",
      href: "https://example.com/repo/blob/4c1e9ab/tools/refunds.py#L118-L131",
    },
  ],
  activity: [
    { id: "a2", actor: "discovery", text: "raised severity from Medium to High", reason: "Affected users doubled in seven days.", at: "2026-11-21T06:00:00Z" },
    { id: "a1", actor: "discovery", text: "created this pattern", at: "2026-11-11T08:20:00Z" },
  ],
};

export default function Example() {
  const [pattern, setPattern] = React.useState(initial);
  const log = (text: string, reason?: string): PatternActivity => ({ id: "a" + Date.now(), actor: "you", text, reason, at: "2026-11-24T09:30:00Z" });
  const update = (patch: Partial<PatternFinding>, entry?: PatternActivity) =>
    setPattern((p) => ({ ...p, ...patch, activity: entry ? [entry, ...(p.activity || [])] : p.activity }));

  return (
    <PatternDetail
      pattern={pattern}
      href="https://example.com/patterns/pat_0141"
      traceCommand="traces get {{trace}} --format json"
      categoryOptions={["Tool failure", "Duplicate action", "Unsupported claim", "User friction", "Cost", "Latency"]}
      onInvestigate={() => update({ status: "investigating" }, log("started an investigation"))}
      onStatusChange={(status, reason) => update({ status }, log("set status to " + status, reason))}
      onSeverityChange={(severity, reason) => update({ severity, severityRaised: false }, log("corrected severity to " + severity, reason))}
      onCategoriesChange={(categories) => update({ categories })}
      onRate={(rating, comment) => update({ rating, status: rating === "not_useful" ? "closed" : pattern.status }, log("rated this pattern " + (rating === "useful" ? "useful" : "not useful"), comment))}
      onOpenTrace={() => {}}
      onOpenPeriod={() => {}}
      style={{ width: "100%" }}
    />
  );
}
