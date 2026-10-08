import { InvariantPanel } from "@pix-ui/react";

export default function Example() {
  return (
    <InvariantPanel
      title="Process invariants"
      scope="run #0057"
      compact
      invariants={[
        { name: "scope_declared", state: "pass", step: "step 2" },
        { name: "citation_grounded", state: "pass", step: "step 4" },
        { name: "arithmetic_delegated", state: "pass", step: "step 7" },
        { name: "tool_call_schema_valid", state: "fail", step: "step 9" },
        { name: "replay_consistency", state: "not_applicable" },
      ]}
    />
  );
}
