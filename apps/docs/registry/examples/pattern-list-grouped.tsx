import { PatternList, type Pattern } from "@pix-ui/react";

const patterns: Pattern[] = [
  { id: "pat_0141", name: "Refund tool retried after a timeout", severity: "high", status: "open", categories: ["Tool failure"], lastSeen: "2026-11-24T09:02:00Z", impact: { traces: 412, users: 87, share: 0.061 }, trend: [8, 14, 22, 31, 36, 44, 52] },
  { id: "pat_0138", name: "Agent quotes a 60-day return window", severity: "medium", status: "investigating", categories: ["Unsupported claim"], lastSeen: "2026-11-24T07:31:00Z", impact: { traces: 1260, users: 940, share: 0.187, estimated: true }, trend: [80, 92, 88, 95, 90, 99, 86] },
  { id: "pat_0127", name: "Users rephrase the same question", severity: "medium", status: "open", categories: ["User friction"], lastSeen: "2026-11-23T22:14:00Z", impact: { traces: 318, share: 0.047 }, trend: [20, 18, 25, 22, 19, 27, 24] },
  { id: "pat_0088", name: "Address validation rejects apartment numbers", severity: "medium", status: "closed", categories: ["Tool failure"], lastSeen: "2026-11-09T12:00:00Z", impact: { traces: 0 } },
  { id: "pat_0071", name: "Greeting repeats the customer's full name", status: "duplicate", categories: ["Tone"], lastSeen: "2026-11-02T08:00:00Z" },
];

export default function Example() {
  return (
    <PatternList
      title="Patterns by status"
      patterns={patterns}
      impactUnit="users"
      defaultGroupBy="status"
      sort="impact"
      now="2026-11-24T09:30:00Z"
      style={{ width: "100%" }}
    />
  );
}
