import { ThinkingTrace } from "@pix-ui/react";

export default function Example() {
  return (
    <ThinkingTrace
      status="streaming"
      title="Thinking it through…"
      workingLabel="Working on it…"
      interval={700}
      steps={[
        { kind: "read", system: "SharePoint", label: "Pulled the Q3 reconciliation workbook", duration: "318ms" },
        { kind: "thought", label: "Checked the bank feed against the GL for the period" },
        { kind: "tool", label: "Ran the variance calculator on unmatched lines", detail: "threshold=500", duration: "64ms" },
        { kind: "write", system: "ServiceNow", label: "Logged the unmatched lines as a reconciliation exception", duration: "140ms" },
      ]}
    />
  );
}
