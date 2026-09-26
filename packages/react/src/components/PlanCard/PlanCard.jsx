import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const pcSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const pcMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

function PlanCardBase({ name, current = false, features = [], footer, style }) {
  return (
    <div style={{ padding: 16, borderRadius: 4, background: "var(--surface, #fff)", border: `1px solid ${current ? "var(--zinc-900, #18181b)" : "var(--border, #e4e4e7)"}`,
      boxShadow: current ? "inset 0 0 0 1px var(--zinc-900, #18181b)" : "none", fontFamily: pcSans, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, font: `600 14px ${pcSans}`, color: "var(--fg1, #18181b)" }}>
        {name}
        {current && <span style={{ font: `600 11px ${pcSans}`, padding: "3px 8px", borderRadius: 3, background: "var(--emerald-50, #ecfdf5)", color: "var(--emerald-700, #047857)" }}>Current</span>}
      </div>
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 5, font: `400 12px ${pcMono}`, color: "var(--fg2, #52525b)" }}>
        {features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      {footer && <div style={{ marginTop: 12 }}>{footer}</div>}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function PlanCard(props) {
  if (props.loading) return <Skeleton.Panel lines={4} style={props.style} />;
  return <PlanCardBase {...props} />;
}
