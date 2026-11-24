import * as React from "react";
import { PatternAlertSettings, type PatternAlertConfig, type Pattern } from "@pix-ui/react";

const preview: Pattern = {
  id: "pat_0141",
  name: "Refund tool retried after a timeout, issuing two refunds",
  summary: "When issue_refund times out, the agent calls it again without checking whether the first call landed.",
  severity: "high",
  categories: ["Tool failure", "Duplicate action"],
  firstSeen: "2026-11-11T08:12:00Z",
  lastSeen: "2026-11-24T09:02:00Z",
  impact: { traces: 412, users: 87, from: "2026-11-11", to: "2026-11-24" },
  severityRaised: true,
};

export default function Example() {
  const [config, setConfig] = React.useState<PatternAlertConfig>({
    destinations: [
      { id: "d1", type: "slack", target: "#agent-alerts" },
      { id: "d2", type: "webhook", target: "https://hooks.example.com/patterns" },
    ],
    minSeverity: "medium",
    informational: true,
    mention: {
      enabled: true,
      who: "triage-agent",
      prompt: "Please investigate this pattern: {{pattern}}. Review the evidence, identify the root cause, and suggest a fix.",
    },
  });

  return (
    <PatternAlertSettings
      value={config}
      onChange={setConfig}
      channels={["#agent-alerts", "#support-eng", "#incidents"]}
      members={["triage-agent", "priya.nair", "sam.okafor"]}
      previewPattern={preview}
      patternUrl="example.com/patterns/pat_0141"
      style={{ width: "100%", maxWidth: 720 }}
    />
  );
}
