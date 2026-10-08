import { StageFlow } from "@pix-ui/react";

export default function Example() {
  return (
    <StageFlow
      compact
      caption="Triage funnel"
      hint="Today"
      stages={[
        { label: "Intake", value: 38, progress: 1 },
        { label: "Triaged", value: 31, progress: 0.82 },
        { label: "Resolved", value: 19, progress: 0.5 },
      ]}
    />
  );
}
