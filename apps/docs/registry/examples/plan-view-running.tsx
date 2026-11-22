import * as React from "react";
import { PlanView, type PlanStep } from "@pix-ui/react";

const LABELS = [
  "Pull 14 open vendor statements",
  "Match each line to the ledger",
  "Draft follow-ups for mismatches",
  "Write a summary for the controller",
];

export default function Example() {
  const [at, setAt] = React.useState(1);

  React.useEffect(() => {
    const t = setInterval(() => setAt((n) => (n >= LABELS.length ? 0 : n + 1)), 1800);
    return () => clearInterval(t);
  }, []);

  const steps: PlanStep[] = LABELS.map((label, i) => ({
    id: String(i),
    label,
    status: i < at ? "done" : i === at ? "running" : "pending",
  }));
  const finished = at >= LABELS.length;

  return (
    <PlanView
      title="Close the March vendor statements"
      status={finished ? "done" : "running"}
      elapsed={`${12 + at * 9}s`}
      steps={steps}
      style={{ width: "100%", maxWidth: 560 }}
    />
  );
}
