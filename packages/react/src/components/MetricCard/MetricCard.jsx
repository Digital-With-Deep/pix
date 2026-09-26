import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const metricDeltaColors = { up: "var(--emerald-600, #059669)", down: "var(--red-600, #dc2626)", neutral: "var(--fg3, #71717a)" };

const metricValueColors = { default: "var(--fg1, #18181b)", danger: "var(--red-700, #b91c1c)", warning: "var(--amber-700, #b45309)", success: "var(--emerald-700, #047857)" };

function MetricCardBase({ label, value, delta, deltaType = "neutral", hint, valueTone = "default", progress, footer, style }) {
  const h = React.createElement;
  const arrow = deltaType === "up" ? "\u25B2" : deltaType === "down" ? "\u25BC" : "";
  return h("div", { style: { background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 16, padding: 20, fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)", ...style } },
    h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
      h("span", { style: { font: "600 11px var(--font-sans, ui-sans-serif, system-ui, sans-serif)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" } }, label),
      hint && h("span", { style: { fontSize: 11, color: "var(--fg4, #a1a1aa)" } }, hint)
    ),
    h("div", { style: { fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: metricValueColors[valueTone] || metricValueColors.default, marginTop: 8, lineHeight: 1.1 } }, value),
    progress != null && h("div", { style: { marginTop: 10, height: 3, background: "var(--zinc-100, #f4f4f5)", borderRadius: 2, overflow: "hidden" } },
      h("div", { style: { width: Math.max(0, Math.min(1, progress)) * 100 + "%", height: "100%", background: "var(--emerald-500, #10b981)" } })
    ),
    delta && h("div", { style: { fontSize: 12, fontWeight: 600, marginTop: 4, color: metricDeltaColors[deltaType] || metricDeltaColors.neutral } }, arrow ? arrow + " " + delta : delta),
    footer && h("div", { style: { marginTop: 8 } }, footer)
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function MetricCard(props) {
  if (props.loading) return <Skeleton.Metric style={props.style} />;
  return <MetricCardBase {...props} />;
}
