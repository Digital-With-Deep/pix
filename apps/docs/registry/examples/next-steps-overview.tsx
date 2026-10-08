import { NextSteps } from "@pix-ui/react";

export default function Example() {
  return (
    <NextSteps
      items={[
        {
          kind: "GAP",
          kindTone: "warning",
          title: "No backup payment method on file",
          body: "Add a second card so billing doesn't lapse if the primary one fails.",
          action: "Add a card",
          onAction: () => {},
        },
        {
          kind: "INFO",
          kindTone: "info",
          title: "Two teammates haven't accepted their invite",
          body: "Resend the invite or swap in a different email address.",
          action: "Review invites",
          onAction: () => {},
        },
        {
          kind: "DONE",
          kindTone: "success",
          title: "Workspace limits are configured",
          body: "Usage limits match the plan you're on. Nothing to do here.",
        },
      ]}
    />
  );
}
