import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const stpSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const stpMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

function StepperBase({ steps = [], current = 0, onStepClick, style }) {
  return (
    <ol aria-label="Progress" style={{ display: "flex", listStyle: "none", margin: 0, padding: 0, ...style }}>
      {steps.map((label, i) => {
        const done = i < current, cur = i === current;
        const clickable = onStepClick && done;
        return (
          <li key={label} aria-current={cur ? "step" : undefined}
            onClick={clickable ? () => onStepClick(i) : undefined}
            style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, paddingRight: 12, cursor: clickable ? "pointer" : "default" }}>
            <span style={{ height: 3, borderRadius: 2, background: done ? "var(--emerald-500, #10b981)" : cur ? "var(--zinc-900, #18181b)" : "var(--zinc-200, #e4e4e7)" }} />
            <span style={{ font: `600 10px ${stpMono}`, color: done ? "var(--truth, #047857)" : "var(--fg-muted, #a1a1aa)" }}>{done ? "DONE" : `STEP ${i + 1}`}</span>
            <span style={{ font: `${cur ? 600 : 500} 12px/1.3 ${stpSans}`, color: cur ? "var(--fg1, #18181b)" : "var(--fg3, #71717a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function Stepper(props) {
  if (props.loading) return <Skeleton label="Loading steps" style={{ display: "flex", gap: 12, ...props.style }}>{(props.steps || [1, 2, 3, 4]).map((_, i) => <span key={i} style={{ flex: 1 }}><Skeleton height={3} /><Skeleton width={44} height={9} style={{ marginTop: 8 }} /><Skeleton width="70%" height={12} style={{ marginTop: 7 }} /></span>)}</Skeleton>;
  return <StepperBase {...props} />;
}
