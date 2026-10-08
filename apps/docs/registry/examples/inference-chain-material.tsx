import { InferenceChain } from "@pix-ui/react";

export default function Example() {
  return (
    <InferenceChain
      title="Inference chain"
      chain={[
        { label: "Agent", value: "invoice-matching-agent", meta: "type = agentic" },
        { label: "Control", value: "AP-14 three-way match", meta: "runs on every vendor invoice" },
        { label: "Objective", value: "accuracy_valuation" },
        { label: "Assertions", value: "accuracy_valuation, completeness, existence" },
      ]}
      findings={[
        "1,240 invoices approved on a vendor-name match without a PO number check",
        "match_po was available to the agent on every run and never called",
      ]}
      assertions={["accuracy_valuation", "completeness", "existence"]}
      exceptions="1,240 exceptions / yr"
      materiality="Exceeds the planning materiality threshold by 3.1x"
      compensating="None identified"
      deficiency="material_weakness"
    />
  );
}
