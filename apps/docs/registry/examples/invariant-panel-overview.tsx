import { InvariantPanel } from "@pix-ui/react";

export default function Example() {
  return (
    <InvariantPanel
      scope="run #0042 · O-WHT-01"
      invariants={[
        {
          name: "scope_declared",
          state: "pass",
          catches: "The agent claims to have checked something outside its declared scope.",
        },
        {
          name: "citation_grounded",
          state: "pass",
          catches: "A claim is made without a traceable citation to source evidence.",
        },
        {
          name: "arithmetic_delegated",
          state: "fail",
          catches: "The agent performs arithmetic itself instead of delegating to the calculator tool.",
          detail: "Step 7 computed a variance total inline instead of calling the calculator tool.",
        },
        {
          name: "tool_call_schema_valid",
          state: "pass",
          catches: "A tool call is made with arguments that don't match its declared schema.",
        },
        {
          name: "replay_consistency",
          state: "pass",
          catches: "Re-running the same inputs produces a different verdict.",
          observed: "3 of 3",
        },
      ]}
    />
  );
}
