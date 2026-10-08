import { StageFlow } from "@pix-ui/react";

export default function Example() {
  return (
    <StageFlow
      caption="Control lifecycle"
      hint="14 agents · FY2027 Q1"
      stages={[
        { label: "Intake", value: 240, note: "Filed this quarter", progress: 1, tone: "neutral" },
        { label: "Triaged", value: 210, note: "Routed to a reviewer", progress: 0.88, tone: "neutral" },
        {
          label: "Under review",
          value: 92,
          note: "Stalled — median age 11 days",
          progress: 0.38,
          tone: "alert",
        },
        { label: "Escalated", value: 0, note: "Not yet reached", progress: 0, tone: "idle" },
      ]}
    />
  );
}
