import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const pixFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

function RateBarsBase({ rows = [], caption, hint, threshold = 90, style }) {
  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: pixFont, ...style }}>
      {(caption || hint) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
          {caption && <span style={{ font: `600 10px ${pixFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #71717a)" }}>{caption}</span>}
          {hint && <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 11, color: "var(--fg-muted, #a1a1aa)" }}>{hint}</span>}
        </div>
      )}
      <div>
        {rows.map((r, i) => {
          const bad = r.tone ? r.tone === "danger" : r.value < threshold;
          const ink = bad ? "var(--red-600, #dc2626)" : "var(--fg1, #18181b)";
          return (
            <div key={r.name} style={{ padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid var(--divider, #f4f4f5)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                <span style={{ flex: "0 1 220px", minWidth: 0, fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 13, color: "var(--fg1, #18181b)" }}>{r.name}</span>
                <span style={{ flex: "1 1 200px", minWidth: 80, height: 6, background: "var(--zinc-100, #f4f4f5)", borderRadius: 3, overflow: "hidden" }}>
                  <span style={{ display: "block", width: `${Math.max(0, Math.min(100, r.value))}%`, height: "100%", background: bad ? "var(--red-600, #dc2626)" : "var(--emerald-500, #10b981)" }} />
                </span>
                <span style={{ flex: "0 0 48px", textAlign: "right", font: `700 13px ${pixFont}`, fontVariantNumeric: "tabular-nums", color: ink }}>{r.value}%</span>
              </div>
              {r.note && <div style={{ font: `400 12px ${pixFont}`, color: "var(--fg3, #71717a)", marginTop: 8, maxWidth: "78ch" }}>{r.note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function RateBars(props) {
  if (props.loading) return <Skeleton.List rows={5} glyph={false} twoLine={false} style={props.style} />;
  return <RateBarsBase {...props} />;
}
