import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const bcFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

function BarChartBase({ series = [], data = [], caption, hint, summary, height = 130, style }) {
  const max = Math.max(1, ...data.flatMap(d => d.values || []));
  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: bcFont, ...style }}>
      {(caption || hint) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
          {caption && <span style={{ font: `600 10px ${bcFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #71717a)" }}>{caption}</span>}
          {hint && <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 11, color: "var(--fg-muted, #a1a1aa)" }}>{hint}</span>}
        </div>
      )}
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
          {series.map(s => (
            <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `500 11px ${bcFont}`, color: "var(--fg2, #52525b)" }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color }} />{s.label}
            </span>
          ))}
          {summary && <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 11, color: "var(--fg3, #71717a)" }}>{summary}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, marginTop: 14, borderBottom: "1px solid var(--border, #e4e4e7)" }}>
          {data.map(d => (
            <div key={d.label} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, height: "100%" }}>
              {(d.values || []).map((v, i) => (
                <div key={i} title={`${d.label} · ${series[i] ? series[i].label : ""} ${v}`}
                  style={{ flex: 1, minWidth: 0, maxWidth: 18, height: `${(v / max) * 100}%`, background: series[i] ? series[i].color : "var(--zinc-300, #d4d4d8)" }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {data.map(d => (
            <div key={d.label} style={{ flex: 1, minWidth: 0, textAlign: "center", font: `400 11px ${bcFont}`, color: "var(--fg3, #71717a)" }}>{d.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function BarChart(props) {
  if (props.loading) return <Skeleton.Chart bars={(props.data || []).length || 12} height={props.height || 130} style={props.style} />;
  return <BarChartBase {...props} />;
}
