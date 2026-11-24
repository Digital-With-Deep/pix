import { PlanView } from "@pix-ui/react";

export default function Example() {
  return (
    <PlanView
      title="Close the March vendor statements"
      status="done"
      elapsed="1m 04s"
      steps={[
        { id: "fetch", label: "Pull 14 open vendor statements", status: "done" },
        { id: "match", label: "Match each line to the ledger", status: "done" },
        { id: "draft", label: "Draft follow-ups for mismatches", detail: "No mismatches found.", status: "skipped" },
        { id: "report", label: "Write a summary for the controller", status: "done" },
      ]}
      style={{ width: "100%", maxWidth: 560 }}
    />
  );
}
