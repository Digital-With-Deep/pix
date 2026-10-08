import { InferenceChain } from "@pix-ui/react";

export default function Example() {
  return (
    <InferenceChain
      title="Inference chain"
      chain={[
        { label: "Agent", value: "invoice-matching-agent", meta: "type = agentic" },
        { label: "Control", value: "AP-14 three-way match", meta: "runs on every vendor invoice" },
        { label: "Objective", value: "accuracy_valuation" },
        { label: "Assertions", value: "accuracy_valuation, completeness" },
      ]}
      deficiency="none"
    />
  );
}
