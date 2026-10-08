import { StageFlow } from "@pix-ui/react";

export default function Example() {
  return (
    <StageFlow
      caption="Control lifecycle"
      hint="14 agents · FY2027 Q1"
      stages={[
        { label: "Intake", value: 240, note: "Filed this quarter", progress: 1 },
        { label: "Triaged", value: 210, note: "Routed to a reviewer", progress: 0.88 },
        { label: "Under review", value: 92, note: "Awaiting sign-off", progress: 0.38 },
        { label: "Resolved", value: 58, note: "Closed with evidence", progress: 0.24 },
      ]}
    />
  );
}
