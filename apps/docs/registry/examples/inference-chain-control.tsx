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
      findings={["12 invoices approved on a vendor-name match without a PO number check"]}
      assertions={["accuracy_valuation", "completeness"]}
      exceptions="310 exceptions / yr"
      materiality="Below the planning materiality threshold"
      compensating="Monthly supervisory review of all AP-14 exceptions over $10,000"
      deficiency="control_deficiency"
    />
  );
}
