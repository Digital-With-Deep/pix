import * as React from "react";
import { PatternList, type Pattern } from "@pix-ui/react";

const patterns: Pattern[] = [
  {
    id: "pat_0141",
    name: "Refund tool retried after a timeout, issuing two refunds",
    summary: "When issue_refund times out, the agent calls it again without checking whether the first call landed. Affected customers are refunded twice.",
    severity: "high",
    status: "open",
    categories: ["Tool failure", "Duplicate action"],
    rule: "Refund agent failures",
    firstSeen: "2026-11-11T08:12:00Z",
    lastSeen: "2026-11-24T09:02:00Z",
    impact: { traces: 412, users: 87, sessions: 96, share: 0.061 },
    trend: [8, 11, 9, 14, 22, 31, 28, 36, 41, 39, 44, 52, 47, 30],
    severityRaised: true,
  },
  {
    id: "pat_0138",
    name: "Agent quotes a 60-day return window; policy is 30 days",
    summary: "Answers about returns cite a 60-day window that the policy document does not contain.",
    severity: "medium",
    status: "investigating",
    categories: ["Unsupported claim"],
    rule: "Refund agent failures",
    firstSeen: "2026-11-03T15:40:00Z",
    lastSeen: "2026-11-24T07:31:00Z",
    impact: { traces: 1260, users: 940, share: 0.187, estimated: true },
    trend: [80, 92, 88, 95, 90, 99, 86, 91, 94, 97, 89, 93, 90, 76],
  },
  {
    id: "pat_0127",
    name: "Users rephrase the same question three or more times",
    summary: "Sessions about plan changes loop: the user restates the request and the agent repeats its previous answer.",
    severity: "medium",
    status: "open",
    categories: ["User friction"],
    rule: "Default rule",
    firstSeen: "2026-10-29T11:05:00Z",
    lastSeen: "2026-11-23T22:14:00Z",
    impact: { traces: 318, sessions: 104, share: 0.047 },
    trend: [20, 18, 25, 22, 19, 27, 24, 21, 26, 23, 28, 22, 25, 18],
    reopened: true,
  },
  {
    id: "pat_0119",
    name: "Order lookups run twice per turn",
    summary: "get_order is called with identical arguments back to back, doubling latency and cost on order questions.",
    severity: "low",
    status: "open",
    categories: ["Cost", "Latency"],
    rule: "Default rule",
    firstSeen: "2026-10-18T09:00:00Z",
    lastSeen: "2026-11-24T08:47:00Z",
    impact: { traces: 2210, share: 0.33 },
    trend: [150, 160, 155, 162, 158, 149, 161, 157, 163, 159, 160, 154, 158, 120],
  },
  {
    id: "pat_0102",
    name: "Customers ask for invoices in a language the agent does not offer",
    summary: "A steady share of billing sessions request Portuguese invoices. Not a failure: an unmet need.",
    severity: "info",
    status: "open",
    categories: ["Unmet need"],
    rule: "Default rule",
    firstSeen: "2026-10-02T13:30:00Z",
    lastSeen: "2026-11-22T17:20:00Z",
    impact: { traces: 96, users: 71, share: 0.014 },
    trend: [6, 7, 5, 8, 7, 6, 9, 7, 8, 6, 7, 8, 6, 5],
  },
  {
    id: "pat_0088",
    name: "Address validation rejects apartment numbers",
    summary: "Fixed on Nov 9. No matching traces since.",
    severity: "medium",
    status: "closed",
    categories: ["Tool failure"],
    rule: "Default rule",
    firstSeen: "2026-09-21T10:00:00Z",
    lastSeen: "2026-11-09T12:00:00Z",
    impact: { traces: 0 },
    trend: [12, 14, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

export default function Example() {
  const [selected, setSelected] = React.useState("pat_0141");
  return (
    <PatternList
      patterns={patterns}
      selectedId={selected}
      onSelect={setSelected}
      now="2026-11-24T09:30:00Z"
      style={{ width: "100%" }}
    />
  );
}
