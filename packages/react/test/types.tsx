import * as React from "react";
import { AIResponse, Button, PromptInput, ThinkingTrace, DataTable, MetricCard, Badge, Callout } from "../src/index";
export const Demo = () => (
  <div>
    <Button variant="filled" size="sm" onClick={() => {}}>Run</Button>
    <Badge tone="success" dot>Passed</Badge>
    <MetricCard label="Pass rate" value="94%" />
    <Callout tone="truth" title="Ground truth">$4,820.00</Callout>
    <AIResponse text="Answer" model="gpt" citations={[{ label: "run #1", note: "trace" }]} onFeedback={(v) => void v} />
    <PromptInput placeholder="Ask…" />
  </div>
);
void ThinkingTrace; void DataTable;
import { ActionHistory, AutonomySetting, ConfidenceBadge, InlineCitation, PlanView, SourcePanel, type Source, type AutonomyLevel } from "../src/index";
const trustSources: Source[] = [{ id: "s1", title: "Rate card", state: "verified", snippet: "Rate is 4.2%." }];
export const TrustDemo = () => {
  const [level, setLevel] = React.useState<AutonomyLevel>("confirm");
  const [active, setActive] = React.useState<string | null>(null);
  return (
    <div>
      <PlanView status="running" elapsed="12s" steps={[{ id: "a", label: "Read", status: "done", substeps: [{ id: "a1", label: "Fetch", status: "done" }] }, { id: "b", label: "Match", status: "running" }]} onProceed={() => {}} />
      <p>Rate is 4.2%<InlineCitation index={1} source={trustSources[0]} active={active === "s1"} onSelect={setActive} /></p>
      <SourcePanel sources={trustSources} activeId={active} onSelect={(id) => setActive(id)} />
      <ConfidenceBadge state="review" score={0.62} scope="checked against 3 sources" reason="Two sources disagree." size="standalone" />
      <ActionHistory now="2026-01-14T09:00:00Z" actions={[{ id: "x", at: "2026-01-14T08:58:00Z", agent: "agent-a", action: "Posted hold", target: "INV-1", status: "done", undoUntil: "2026-01-14T09:05:00Z" }]} onUndo={(id) => void id} />
      <AutonomySetting value={level} onChange={setLevel} task="invoice matching" />
    </div>
  );
};
