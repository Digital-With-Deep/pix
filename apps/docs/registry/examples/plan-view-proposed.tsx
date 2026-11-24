import { PlanView } from "@pix-ui/react";

export default function Example() {
  return (
    <PlanView
      title="Close the March vendor statements"
      status="proposed"
      steps={[
        { id: "fetch", label: "Pull 14 open vendor statements", detail: "Read only, from the shared statements folder." },
        { id: "match", label: "Match each line to the ledger", detail: "Uses the ledger's own tolerance check." },
        {
          id: "draft",
          label: "Draft follow-ups for mismatches",
          substeps: [
            { id: "draft-1", label: "Group mismatches by vendor" },
            { id: "draft-2", label: "Write one email per vendor" },
          ],
        },
        { id: "report", label: "Write a summary for the controller" },
      ]}
      onProceed={() => {}}
      onEditPlan={() => {}}
      onTakeOver={() => {}}
      style={{ width: "100%", maxWidth: 560 }}
    />
  );
}
