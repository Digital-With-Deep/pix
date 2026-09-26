import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const cmFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const CM_STATE = {
  tested: { bg: "var(--emerald-100, #d1fae5)", fg: "var(--emerald-800, #065f46)", glyph: "\u2713", label: "Tested this period" },
  stale: { bg: "var(--amber-100, #fef3c7)", fg: "var(--amber-800, #92400e)", glyph: "!", label: "Stale \u2014 drift since test" },
  none: { bg: "var(--red-100, #fee2e2)", fg: "var(--red-700, #b91c1c)", glyph: "\u00d7", label: "No evidence" },
  na: { bg: "var(--zinc-100, #f4f4f5)", fg: "transparent", glyph: "\u00b7", label: "Not applicable" },
};

function CoverageMatrixBase({ assertions = [], rows = [], legend = true, legendOrder = ["tested", "stale", "none", "na"], style }) {
  const th = { padding: "8px 10px", font: `600 10px ${cmFont}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)", whiteSpace: "nowrap" };
  return (
    <div style={{ fontFamily: cmFont, ...style }}>
      {legend && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
          {legendOrder.map(k => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `400 11px ${cmFont}`, color: "var(--fg2, #52525b)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: CM_STATE[k].bg, border: `1px solid ${k === "na" ? "var(--border, #e4e4e7)" : CM_STATE[k].fg}` }} />
              {CM_STATE[k].label}
            </span>
          ))}
        </div>
      )}
      <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>Objective</th>
              {assertions.map(a => <th key={a} style={{ ...th, textAlign: "center", width: 74 }}>{a}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label}>
                <td style={{ padding: "9px 10px", borderTop: "1px solid var(--divider, #f4f4f5)", font: `400 13px ${cmFont}`, color: "var(--fg2, #52525b)" }}>
                  <span style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 12, color: "var(--fg1, #18181b)", fontWeight: 600 }}>{r.label}</span>
                  {r.description && <span style={{ marginLeft: 10 }}>{r.description}</span>}
                </td>
                {(r.cells || []).map((c, i) => {
                  const s = CM_STATE[c] || CM_STATE.na;
                  return (
                    <td key={i} style={{ borderTop: "1px solid var(--divider, #f4f4f5)", padding: "9px 10px", textAlign: "center" }}>
                      <span title={`${assertions[i] || ""} · ${s.label}`}
                        style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 3, background: s.bg, color: s.fg, alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{s.glyph}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function CoverageMatrix(props) {
  if (props.loading) return <Skeleton.Table columns={((props.assertions || []).length || 7) + 1} rows={(props.rows || []).length || 5} caption={false} style={props.style} />;
  return <CoverageMatrixBase {...props} />;
}
