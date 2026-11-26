import * as React from "react";
import { PatternRuleEditor, type PatternRule, type PatternRun } from "@pix-ui/react";

const saved: PatternRule = {
  id: "rule_refunds",
  name: "Refund agent failures",
  scope: 'metadata.agent = "refund-assistant" AND metadata.env = "prod"',
  watchFor: ["Tool failures", "Duplicate actions", "Answers that contradict policy"],
  instructions: "Find or update patterns. Ignore traces from the load-test tenant.",
  lookBack: "7d",
};

const lastRun: PatternRun = {
  state: "done",
  checkedAt: "2026-11-24T09:18:00Z",
  finishedAt: "2026-11-24T06:00:00Z",
  tracesRead: 1840,
  searches: 23,
  created: 1,
  updated: 4,
  closed: 1,
  gaps: ["37 traces were too large to read in full; only their first 200 spans were checked."],
};

export default function Example() {
  const [rule, setRule] = React.useState(saved);
  const [run, setRun] = React.useState(lastRun);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  // Stand-in for starting a run: it finishes after two seconds.
  const runNow = () => {
    setRun({ state: "running", checkedAt: "2026-11-24T09:30:00Z" });
    timer.current = setTimeout(() => setRun({ ...lastRun, checkedAt: "2026-11-24T09:30:00Z", finishedAt: "2026-11-24T09:30:00Z", created: 0, updated: 5, closed: 0 }), 2000);
  };

  return (
    <PatternRuleEditor
      rule={rule}
      onSave={setRule}
      onRunNow={runNow}
      onDelete={() => {}}
      run={run}
      now="2026-11-24T09:30:00Z"
      scopeMatches={6412}
      watchSuggestions={["User complaints", "Unusually high cost", "Unusually high latency"]}
      alerts="#agent-alerts and 1 webhook"
      onConfigureAlerts={() => {}}
      style={{ width: "100%", maxWidth: 720 }}
    />
  );
}
