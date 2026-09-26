import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const fFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const fMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const F_SAME = "M5 12h14";
const F_MOVED = "M13 7l5 5-5 5M6 12h12";
const F_WARN = "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z";

function FIcon({ path, size = 12 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
    React.createElement("path", { d: path }));
}

const cellPad = "10px 14px";

/**
 * Component-wise fingerprint comparison. Never renders a single opaque hash:
 * when the fingerprint moves, the auditor must be told which component moved.
 */
function FingerprintDiffBase({
  title = "Decision logic fingerprint", components = [], confidence = "high",
  confidenceNote, benchmarking, verdictNote, periodLabels = ["Prior", "Current"], style,
}) {
  const moved = components.filter(c => c.from !== c.to);
  const available = benchmarking !== undefined ? benchmarking : moved.length === 0 && confidence === "high";
  const vInk = available ? "var(--truth, #047857)" : "var(--claim, #b91c1c)";
  const vBg = available ? "var(--truth-bg, #ecfdf5)" : "var(--claim-bg, #fef2f2)";

  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 4, overflow: "hidden", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, padding: "11px 14px", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
        <span style={{ font: `600 10px ${fFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #78716c)" }}>{title}</span>
        <span style={{ flex: 1 }} />
        <span style={{ font: `400 11px ${fMono}`, color: moved.length ? "var(--fault, #b45309)" : "var(--fg-muted, #a8a29e)" }}>
          {moved.length ? `${moved.length} of ${components.length} moved` : `${components.length} components unchanged`}
        </span>
      </div>

      {confidence === "low" && (
        <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "var(--confidence-low-bg, #fffbeb)", borderBottom: "1px solid var(--fault-border, #fde68a)" }}>
          <span style={{ color: "var(--amber-600, #d97706)", display: "flex", marginTop: 1 }}><FIcon path={F_WARN} size={13} /></span>
          <span style={{ font: `400 12px ${fFont}`, color: "var(--fault, #b45309)", lineHeight: 1.6 }}>
            <b style={{ font: `600 12px ${fMono}` }}>fingerprint_confidence: low</b>
            {" — "}{confidenceNote || "The provider version behind this endpoint cannot be pinned, so a silent model update would not be visible here. Stated as a scope limitation."}
          </span>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--zinc-50, #fafaf9)" }}>
            <th style={{ textAlign: "left", padding: "7px 14px", font: `600 9px ${fFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #78716c)" }}>Component</th>
            <th style={{ textAlign: "left", padding: "7px 14px", font: `600 9px ${fFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #78716c)" }}>{periodLabels[0]}</th>
            <th style={{ width: 28 }}></th>
            <th style={{ textAlign: "left", padding: "7px 14px", font: `600 9px ${fFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #78716c)" }}>{periodLabels[1]}</th>
          </tr>
        </thead>
        <tbody>
          {components.map(c => {
            const changed = c.from !== c.to;
            return (
              <tr key={c.name} style={{ background: changed ? "var(--fault-bg, #fffbeb)" : "transparent" }}>
                <td style={{ padding: cellPad, borderTop: "1px solid var(--divider, #f5f5f4)", font: `500 12px ${fMono}`,
                  color: changed ? "var(--fault, #b45309)" : "var(--fg1, #1c1917)", whiteSpace: "nowrap" }}>{c.name}</td>
                <td style={{ padding: cellPad, borderTop: "1px solid var(--divider, #f5f5f4)", font: `400 12px ${fMono}`,
                  color: "var(--fg3, #78716c)", wordBreak: "break-all" }}>{c.from}</td>
                <td style={{ padding: "10px 0", borderTop: "1px solid var(--divider, #f5f5f4)", textAlign: "center",
                  color: changed ? "var(--amber-600, #d97706)" : "var(--zinc-300, #d6d3d1)" }}>
                  <FIcon path={changed ? F_MOVED : F_SAME} size={13} />
                </td>
                <td style={{ padding: cellPad, borderTop: "1px solid var(--divider, #f5f5f4)", font: `${changed ? 600 : 400} 12px ${fMono}`,
                  color: changed ? "var(--fault, #b45309)" : "var(--fg3, #78716c)", wordBreak: "break-all" }}>{c.to}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border, #e7e5e4)", background: vBg }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
          <span style={{ font: `600 10px ${fMono}`, textTransform: "uppercase", letterSpacing: "0.08em", color: vInk }}>
            {available ? "Benchmarking strategy available" : "Full test required"}
          </span>
          <span style={{ font: `400 11px ${fMono}`, color: vInk, opacity: 0.75 }}>AS 2201 .58–.60</span>
        </div>
        <p style={{ margin: "6px 0 0", font: `400 12px ${fFont}`, color: vInk, lineHeight: 1.6, maxWidth: 640 }}>
          {verdictNote || (available
            ? "No component of the decision logic moved and ITGCs are effective, so prior-period testing may be relied upon."
            : "The decision logic changed, so prior-period testing cannot be relied upon for this control.")}
        </p>
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function FingerprintDiff(props) {
  if (props.loading) return <Skeleton.Table columns={3} rows={(props.components || []).length || 6} style={props.style} />;
  return <FingerprintDiffBase {...props} />;
}
