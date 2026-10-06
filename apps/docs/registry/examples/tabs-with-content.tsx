import * as React from "react";
import { Tabs } from "@pix-ui/react";

const panels: Record<string, { heading: string; body: string }> = {
  overview: {
    heading: "Case summary",
    body: "Three accounts are under review for the June reconciliation cycle.",
  },
  findings: {
    heading: "Open findings",
    body: "Two line items lack a matching invoice and are flagged for follow-up.",
  },
  evidence: {
    heading: "Evidence log",
    body: "Bank statement, vendor invoice, and approval email attached below.",
  },
};

export default function Example() {
  const [value, setValue] = React.useState("overview");
  const panel = panels[value];

  return (
    <div style={{ width: "100%" }}>
      <Tabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "findings", label: "Findings", count: 2 },
          { value: "evidence", label: "Evidence" },
        ]}
        value={value}
        onChange={setValue}
      />
      <div
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--surface-alt)",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--fg1)", marginBottom: 4 }}>
          {panel.heading}
        </div>
        <div style={{ fontSize: 13, color: "var(--fg2)" }}>{panel.body}</div>
      </div>
    </div>
  );
}
