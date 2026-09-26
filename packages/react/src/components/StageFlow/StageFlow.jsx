import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const sfFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const sfTone = {
  neutral: { label: "var(--fg3, #71717a)", value: "var(--fg1, #18181b)", note: "var(--fg3, #71717a)", bar: "var(--emerald-500, #10b981)", bg: "transparent" },
  alert: { label: "var(--amber-700, #b45309)", value: "var(--amber-700, #b45309)", note: "var(--amber-700, #b45309)", bar: "var(--amber-600, #d97706)", bg: "var(--amber-50, #fffbeb)" },
  idle: { label: "var(--fg3, #71717a)", value: "var(--fg-muted, #a1a1aa)", note: "var(--fg3, #71717a)", bar: "var(--zinc-300, #d4d4d8)", bg: "transparent" },
};

function StageFlowBase({ stages = [], caption, hint, compact = false, style }) {
  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: sfFont, ...style }}>
      {(caption || hint) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
          {caption && <span style={{ font: `600 10px ${sfFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #71717a)" }}>{caption}</span>}
          {hint && <span style={{ marginLeft: "auto", font: `400 11px ${sfFont}`, fontFamily: "var(--font-mono, ui-monospace, monospace)", color: "var(--fg-muted, #a1a1aa)" }}>{hint}</span>}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, minmax(130px, 1fr))` }}>
        {stages.map((s, i) => {
          const t = sfTone[s.tone || (s.value === 0 ? "idle" : "neutral")] || sfTone.neutral;
          const pct = Math.max(0, Math.min(1, s.progress == null ? 0 : s.progress));
          return (
            <div key={s.label} style={{ padding: compact ? "12px 14px 14px" : "14px 16px 16px", background: t.bg, borderLeft: i === 0 ? "none" : "1px solid var(--divider, #f4f4f5)", minWidth: 0 }}>
              <div style={{ font: `600 10px ${sfFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: t.label }}>{s.label}</div>
              <div style={{ fontSize: compact ? 22 : 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: 6, color: t.value }}>{s.value}</div>
              {s.note && <div style={{ font: `400 11px ${sfFont}`, lineHeight: 1.35, marginTop: 4, color: t.note }}>{s.note}</div>}
              <div style={{ marginTop: 10, height: 3, background: "var(--zinc-100, #f4f4f5)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${Math.max(pct, 0.06) * 100}%`, height: "100%", background: t.bar }} />
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function StageFlow(props) {
  if (props.loading) return <Skeleton.Panel lines={2} style={props.style} />;
  return <StageFlowBase {...props} />;
}
