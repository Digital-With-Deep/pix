import { PlanView } from "@pix-ui/react";

export default function Example() {
  return (
    <PlanView
      title="Close the March vendor statements"
      status="failed"
      elapsed="38s"
      steps={[
        { id: "fetch", label: "Pull 14 open vendor statements", status: "done" },
        { id: "match", label: "Match each line to the ledger", detail: "The ledger refused the read: access expired.", status: "failed" },
        { id: "draft", label: "Draft follow-ups for mismatches", status: "pending" },
        { id: "report", label: "Write a summary for the controller", status: "pending" },
      ]}
      style={{ width: "100%", maxWidth: 560 }}
    />
  );
}
