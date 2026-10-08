import { NextSteps } from "@pix-ui/react";

export default function Example() {
  return (
    <NextSteps
      subtitle="3 suggestions from this week's setup review"
      items={[
        {
          kind: "DRIFT",
          kindTone: "danger",
          title: "API key hasn't rotated in 90 days",
          body: "Rotate the key before it expires to avoid an interruption.",
          action: "Rotate key",
          onAction: () => {},
        },
        {
          kind: "GAP",
          kindTone: "warning",
          title: "Slack notifications are off",
          body: "Turn them on so the team hears about failed runs in real time.",
          action: "Enable",
          onAction: () => {},
        },
      ]}
      onDismiss={() => {}}
      dismissLabel="Dismiss all"
    />
  );
}
