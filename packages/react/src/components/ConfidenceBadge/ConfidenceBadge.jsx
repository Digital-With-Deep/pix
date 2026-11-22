import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";

const cbSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const cbMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const CB_STATES = {
  confident: { label: "Confident", ink: "var(--confidence-high, #047857)", bg: "var(--accent-bg, #ecfdf5)", border: "var(--emerald-200, #a7f3d0)", icon: "M8 12.5l2.5 2.5L16 9.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  low: { label: "Low confidence", ink: "var(--confidence-low, #b45309)", bg: "var(--confidence-low-bg, #fffbeb)", border: "var(--amber-200, #fde68a)", icon: "M12 8v5m0 3.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  review: { label: "Needs review", ink: "var(--blue-700, #1d4ed8)", bg: "var(--blue-50, #eff6ff)", border: "var(--blue-100, #dbeafe)", icon: "M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12zM12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  failed: { label: "Check failed", ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)", border: "var(--red-200, #fecaca)", icon: "M15 9l-6 6m0-6l6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
};
const CB_CSS = ".pix-cb:focus-visible{outline:2px solid var(--accent, #10b981);outline-offset:2px}";
function cbEnsureStyle() {
  if (typeof document === "undefined" || document.getElementById("__pix_confidence_badge")) return;
  const s = document.createElement("style"); s.id = "__pix_confidence_badge"; s.textContent = CB_CSS; document.head.appendChild(s);
}
const cbHidden = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };

/** Formats a 0 to 1 score as a whole percentage; returns null for anything that is not a finite number. */
function cbPercent(score) {
  if (typeof score !== "number" || !isFinite(score)) return null;
  return Math.round(Math.max(0, Math.min(1, score)) * 100) + "%";
}

function CbIcon({ path, size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, display: "block" }}><path d={path} /></svg>;
}

function ConfidenceBadgeBase({ state = "confident", score, scope, reason, size = "inline", label, style }) {
  const t = CB_STATES[state] || CB_STATES.confident;
  const pct = cbPercent(score);
  const text = label || t.label;
  const [tip, setTip] = React.useState(false);
  const rid = "pix-cb-" + React.useId().replace(/[^\w-]/g, "");
  React.useEffect(cbEnsureStyle, []);
  const tipProps = reason ? {
    tabIndex: 0, "aria-describedby": rid,
    onMouseEnter: () => setTip(true), onMouseLeave: () => setTip(false), onFocus: () => setTip(true), onBlur: () => setTip(false),
    onKeyDown: (e) => { if (e.key === "Escape") setTip(false); },
  } : {};
  const tooltip = reason && (
    <span id={rid} role="tooltip" style={tip ? { position: "absolute", zIndex: 20, top: "calc(100% + 6px)", left: 0, width: "max-content", maxWidth: 280, padding: "8px 10px", borderRadius: 4,
      background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", boxShadow: "var(--shadow-lg, 0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.08))", font: `400 12px/1.5 ${cbSans}`, color: "var(--fg1, #18181b)", whiteSpace: "normal", textAlign: "left" } : cbHidden}>
      {reason}
    </span>
  );

  if (size === "standalone") {
    return (
      <div className="pix-cb" {...tipProps} style={{ position: "relative", display: "inline-flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 4, background: t.bg,
        border: `1px solid ${t.border}`, color: t.ink, fontFamily: cbSans, cursor: reason ? "help" : "default", ...style }}>
        <span style={{ marginTop: 1 }}><CbIcon path={t.icon} size={18} /></span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ font: `600 14px/1.3 ${cbSans}` }}>{text}</span>
            {pct && <span style={{ font: `600 14px/1.3 ${cbMono}` }}>{pct}</span>}
          </span>
          {scope && <span style={{ font: `400 12px/1.5 ${cbSans}`, color: "var(--fg2, #52525b)" }}>{scope}</span>}
        </span>
        {tooltip}
      </div>
    );
  }
  return (
    <span className="pix-cb" {...tipProps} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", borderRadius: 3, background: t.bg, color: t.ink,
      font: `600 11px/1.5 ${cbSans}`, whiteSpace: "nowrap", verticalAlign: "middle", cursor: reason ? "help" : "default", ...style }}>
      <CbIcon path={t.icon} size={12} />
      <span>{text}</span>
      {pct && <span style={{ fontFamily: cbMono }}>{pct}</span>}
      {scope && <span style={{ fontWeight: 400 }}><span aria-hidden="true">· </span>{scope}</span>}
      {tooltip}
    </span>
  );
}

/** States how far to trust an AI answer, in words, colour and icon. With `loading`, renders a skeleton in its own footprint. */
export function ConfidenceBadge(props) {
  if (props.loading) {
    return props.size === "standalone"
      ? <Skeleton width={200} height={58} label="Loading confidence" style={{ display: "inline-block", borderRadius: 4, ...props.style }} />
      : <Skeleton width={110} height={20} label="Loading confidence" style={{ display: "inline-block", verticalAlign: "middle", ...props.style }} />;
  }
  return <ConfidenceBadgeBase {...props} />;
}
