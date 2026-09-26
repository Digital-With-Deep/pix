import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const iFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const iMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const I_PASS = "M5 13l4 4L19 7";
const I_FAIL = "M6 18L18 6M6 6l12 12";
const I_NA = "M5 12h14";

function IIcon({ path, size = 12 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
    React.createElement("path", { d: path }));
}

const STATE = {
  pass: { label: "Pass", ink: "var(--truth, #047857)", bg: "var(--truth-bg, #ecfdf5)", icon: I_PASS },
  fail: { label: "Fail", ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)", icon: I_FAIL },
  not_applicable: { label: "N/A", ink: "var(--fg-muted, #a8a29e)", bg: "var(--zinc-100, #f5f5f4)", icon: I_NA },
};

/** The five process invariants, reported individually. Never averaged. */
function InvariantPanelBase({
  title = "Process invariants", invariants = [], scope, compact = false, note = true, style,
}) {
  const failed = invariants.filter(i => i.state === "fail").length;
  const applicable = invariants.filter(i => i.state !== "not_applicable").length;

  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 4, overflow: "hidden", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, padding: "11px 14px", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
        <span style={{ font: `600 10px ${iFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #78716c)" }}>{title}</span>
        {scope && <span style={{ font: `400 11px ${iMono}`, color: "var(--fg-muted, #a8a29e)" }}>{scope}</span>}
        <span style={{ flex: 1 }} />
        <span style={{ font: `400 11px ${iMono}`, color: failed ? "var(--claim, #b91c1c)" : "var(--truth, #047857)" }}>
          {failed ? `${failed} of ${invariants.length} failed` : `${applicable} of ${applicable} holding`}
        </span>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {invariants.map((inv, i) => {
          const s = STATE[inv.state] || STATE.not_applicable;
          if (compact) {
            return (
              <li key={inv.name} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px",
                borderTop: i === 0 ? 0 : "1px solid var(--divider, #f5f5f4)" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, flexShrink: 0, background: s.ink }} />
                <span style={{ font: `500 12px ${iMono}`, color: "var(--fg1, #1c1917)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.name}</span>
                {(inv.step || inv.observed) && (
                  <span style={{ font: `400 11px ${iMono}`, color: "var(--fg-muted, #a8a29e)", flexShrink: 0 }}>{inv.step || inv.observed}</span>
                )}
                <span style={{ flex: 1 }} />
                <span style={{ font: `600 10px ${iMono}`, textTransform: "uppercase", letterSpacing: "0.06em", color: s.ink, flexShrink: 0 }}>{s.label}</span>
              </li>
            );
          }
          return (
            <li key={inv.name} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "12px 14px",
              borderTop: i === 0 ? 0 : "1px solid var(--divider, #f5f5f4)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, flexShrink: 0,
                marginTop: 1, borderRadius: 3, background: s.bg, color: s.ink }}>
                <IIcon path={s.icon} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", font: `600 12px ${iMono}`, color: "var(--fg1, #1c1917)" }}>{inv.name}</span>
                {inv.catches && <span style={{ display: "block", font: `400 12px ${iFont}`, color: "var(--fg3, #78716c)", lineHeight: 1.55, marginTop: 3 }}>{inv.catches}</span>}
                {inv.state === "fail" && inv.detail && (
                  <span style={{ display: "block", font: `400 12px ${iFont}`, color: "var(--claim, #b91c1c)", lineHeight: 1.6, marginTop: 6,
                    borderLeft: "2px solid var(--red-200, #fecaca)", paddingLeft: 9 }}>{inv.detail}</span>
                )}
              </span>
              <span style={{ font: `600 10px ${iMono}`, textTransform: "uppercase", letterSpacing: "0.06em", color: s.ink, flexShrink: 0, marginTop: 3 }}>
                {inv.observed || s.label}
              </span>
            </li>
          );
        })}
      </ul>

      {note && (
        <div style={{ padding: "9px 14px", borderTop: "1px solid var(--divider, #f5f5f4)", background: "var(--zinc-50, #fafaf9)" }}>
          <span style={{ font: `400 11px ${iFont}`, color: "var(--fg3, #78716c)" }}>
            Reported per invariant. These are not averaged into a score — the components are what gets tested.
          </span>
        </div>
      )}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function InvariantPanel(props) {
  if (props.loading) return <Skeleton.List rows={(props.invariants || []).length || 5} glyph twoLine style={props.style} />;
  return <InvariantPanelBase {...props} />;
}
