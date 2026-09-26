import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const cFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const cMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

const DEFICIENCY = {
  none: { label: "No deficiency", ink: "var(--truth, #047857)", bg: "var(--truth-bg, #ecfdf5)" },
  control_deficiency: { label: "Control deficiency", ink: "var(--deficiency-1, #b45309)", bg: "var(--deficiency-1-bg, #fffbeb)" },
  significant_deficiency: { label: "Significant deficiency", ink: "var(--deficiency-2, #c2410c)", bg: "var(--deficiency-2-bg, #fff7ed)" },
  material_weakness: { label: "Material weakness", ink: "var(--deficiency-3, #b91c1c)", bg: "var(--deficiency-3-bg, #fef2f2)" },
};

function Rung({ label, value, meta, depth, last }) {
  return (
    <li style={{ display: "flex", gap: 10, paddingLeft: depth * 18 }}>
      <span style={{ font: `400 12px ${cMono}`, color: "var(--zinc-300, #d6d3d1)", flexShrink: 0, width: 14 }}>
        {depth === 0 ? "" : last ? "└" : "├"}
      </span>
      <span style={{ minWidth: 0, paddingBottom: 8 }}>
        {label && <span style={{ font: `600 9px ${cFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted, #a8a29e)", display: "block", marginBottom: 2 }}>{label}</span>}
        <span style={{ font: `500 13px ${cMono}`, color: "var(--fg1, #1c1917)", display: "block", wordBreak: "break-word" }}>{value}</span>
        {meta && <span style={{ font: `400 11px ${cFont}`, color: "var(--fg3, #78716c)", display: "block", marginTop: 2 }}>{meta}</span>}
      </span>
    </li>
  );
}

/**
 * The inference chain: agent → control → objective → assertions, then the
 * findings that bear on it and the deficiency they add up to.
 */
function InferenceChainBase({
  title = "Inference chain", chain = [], findings = [], assertions = [],
  exceptions, materiality, compensating, deficiency = "none", deficiencyNote, style,
}) {
  const d = DEFICIENCY[deficiency] || DEFICIENCY.none;

  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 4, overflow: "hidden", ...style }}>
      <div style={{ padding: "11px 14px", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
        <span style={{ font: `600 10px ${cFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #78716c)" }}>{title}</span>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: "14px 14px 6px" }}>
        {chain.map((r, i) => (
          <Rung key={`${r.value}-${i}`} label={r.label} value={r.value} meta={r.meta} depth={i} last={i === chain.length - 1} />
        ))}
      </ul>

      {findings.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {findings.map((f, i) => (
            <li key={i} style={{ display: "flex", gap: 9, padding: "9px 11px", borderRadius: 3,
              background: "var(--fault-bg, #fffbeb)", border: "1px solid var(--fault-border, #fde68a)" }}>
              <span style={{ font: `600 11px ${cMono}`, color: "var(--amber-600, #d97706)", flexShrink: 0 }}>→</span>
              <span style={{ font: `400 12px ${cFont}`, color: "var(--fault, #b45309)", lineHeight: 1.6 }}>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {(assertions.length > 0 || exceptions || materiality || compensating) && (
        <dl style={{ margin: 0, padding: "12px 14px", borderTop: "1px solid var(--divider, #f5f5f4)", display: "flex", flexDirection: "column", gap: 8 }}>
          {assertions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 8 }}>
              <dt style={{ font: `400 11px ${cFont}`, color: "var(--fg3, #78716c)", width: 132, flexShrink: 0 }}>Assertions affected</dt>
              <dd style={{ margin: 0, flex: "1 1 200px", minWidth: 0, display: "flex", flexWrap: "wrap", gap: 5 }}>
                {assertions.map(a => (
                  <span key={a} style={{ font: `500 11px ${cMono}`, padding: "2px 6px", borderRadius: 2,
                    background: "var(--zinc-100, #f5f5f4)", color: "var(--fg2, #57534e)" }}>{a}</span>
                ))}
              </dd>
            </div>
          )}
          {exceptions && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 8 }}>
              <dt style={{ font: `400 11px ${cFont}`, color: "var(--fg3, #78716c)", width: 132, flexShrink: 0 }}>Exception volume</dt>
              <dd style={{ margin: 0, flex: "1 1 200px", minWidth: 0, font: `500 12px ${cMono}`, color: "var(--fg1, #1c1917)" }}>{exceptions}</dd>
            </div>
          )}
          {materiality && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 8 }}>
              <dt style={{ font: `400 11px ${cFont}`, color: "var(--fg3, #78716c)", width: 132, flexShrink: 0 }}>Against materiality</dt>
              <dd style={{ margin: 0, flex: "1 1 200px", minWidth: 0, font: `400 12px ${cFont}`, color: "var(--fg2, #57534e)" }}>{materiality}</dd>
            </div>
          )}
          {compensating && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 8 }}>
              <dt style={{ font: `400 11px ${cFont}`, color: "var(--fg3, #78716c)", width: 132, flexShrink: 0 }}>Compensating control</dt>
              <dd style={{ margin: 0, flex: "1 1 200px", minWidth: 0, font: `400 12px ${cFont}`, color: "var(--fg2, #57534e)" }}>{compensating}</dd>
            </div>
          )}
        </dl>
      )}

      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border, #e7e5e4)", background: d.bg }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 8 }}>
          <span style={{ font: `600 10px ${cFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: d.ink }}>Deficiency</span>
          <span style={{ font: `600 13px ${cMono}`, color: d.ink }}>{deficiency}</span>
        </div>
        <p style={{ margin: "6px 0 0", font: `400 12px ${cFont}`, color: d.ink, lineHeight: 1.6, maxWidth: 620 }}>
          {deficiencyNote || d.label}
        </p>
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function InferenceChain(props) {
  if (props.loading) return <Skeleton.List rows={4} glyph twoLine style={props.style} />;
  return <InferenceChainBase {...props} />;
}
