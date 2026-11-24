import { PatternDetail, type PatternFinding } from "@pix-ui/react";

const pattern: PatternFinding = {
  id: "pat_0138",
  name: "Agent quotes a 60-day return window; policy is 30 days",
  summary: "Answers about returns cite a 60-day window. The policy document in the knowledge base says 30 days.",
  severity: "medium",
  status: "investigating",
  categories: ["Unsupported claim"],
  rule: "Refund agent failures",
  firstSeen: "2026-11-03T15:40:00Z",
  lastSeen: "2026-11-24T07:31:00Z",
  impact: { traces: 1260, users: 940, share: 0.187, estimated: true, from: "2026-11-10", to: "2026-11-24" },
  suggestedFix:
    "No retrieved document contains a 60-day window, so the source is not yet known. Check whether the system prompt or an older cached policy page still states 60 days before changing retrieval.",
  cause: "hypothesis",
  evidence: [
    {
      traceId: "tr-71b0de",
      kind: "problem",
      at: "2026-11-24T07:31:00Z",
      excerpt: "user: how long do I have to send it back?\nassistant: You have 60 days from delivery to return any item.",
      highlight: "You have 60 days from delivery to return any item.",
      reason: "The only retrieved chunk, returns-policy.md, states 30 days.",
    },
  ],
};

export default function Example() {
  return <PatternDetail pattern={pattern} readOnly style={{ width: "100%" }} />;
}
