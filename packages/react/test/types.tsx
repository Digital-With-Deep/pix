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
