import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const aFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const aMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

const A_ICONS = {
  alert: "M12 8v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z",
  warn: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  info: "M12 16v-4m0-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z",
  check: "M5 13l4 4L19 7",
};

const A_TONES = {
  /** Dark bar — the reading the reviewer should leave with. */
  inverse: { bg: "var(--zinc-900, #1c1917)", border: "var(--zinc-900, #1c1917)", title: "var(--fg-inverse, #fff)", body: "var(--zinc-300, #d6d3d1)", mark: "rgba(255,255,255,0.10)", markInk: "var(--fg-inverse, #fff)", cite: "var(--zinc-400, #a8a29e)" },
  /** Authored fault, benchmarking unavailable, stated scope limitation. */
  fault: { bg: "var(--fault-bg, #fffbeb)", border: "var(--fault-border, #fde68a)", title: "var(--amber-800, #92400e)", body: "var(--amber-800, #92400e)", mark: "var(--amber-700, #b45309)", markInk: "var(--fg-inverse, #fff)", cite: "var(--amber-700, #b45309)" },
  /** The agent's claim, a failed verdict. */
  claim: { bg: "var(--claim-bg, #fef2f2)", border: "var(--red-200, #fecaca)", title: "var(--red-700, #b91c1c)", body: "var(--red-700, #b91c1c)", mark: "var(--red-700, #b91c1c)", markInk: "var(--fg-inverse, #fff)", cite: "var(--red-700, #b91c1c)" },
  /** Ground truth, objective met. */
  truth: { bg: "var(--truth-bg, #ecfdf5)", border: "var(--emerald-200, #a7f3d0)", title: "var(--emerald-800, #065f46)", body: "var(--emerald-800, #065f46)", mark: "var(--truth, #047857)", markInk: "var(--fg-inverse, #fff)", cite: "var(--truth, #047857)" },
  neutral: { bg: "var(--surface, #fff)", border: "var(--border, #e7e5e4)", title: "var(--fg1, #1c1917)", body: "var(--fg2, #57534e)", mark: "var(--zinc-100, #f5f5f4)", markInk: "var(--fg2, #57534e)", cite: "var(--fg3, #78716c)" },
};

function AlertBase({
  tone = "neutral", title, children, body, icon, citation, actions, style,
}) {
  const t = A_TONES[tone] || A_TONES.neutral;
  const path = icon === true ? A_ICONS.alert : typeof icon === "string" ? (A_ICONS[icon] || icon) : null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16,
      background: t.bg, border: `1px solid ${t.border}`, borderRadius: "var(--radius-md, 4px)",
      padding: "18px 22px", ...style }}>
      {path && (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0,
          borderRadius: "var(--radius-sm, 2px)", background: t.mark, color: t.markInk }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={path} />
          </svg>
        </span>
      )}
      <div style={{ minWidth: 0, flex: "1 1 360px" }}>
        {title && <div style={{ font: `600 15px ${aFont}`, letterSpacing: "-0.01em", color: t.title }}>{title}</div>}
        {(children || body) && (
          <p style={{ margin: title ? "6px 0 0" : 0, font: `400 13px ${aFont}`, lineHeight: 1.6, color: t.body, maxWidth: "70ch" }}>
            {children || body}
          </p>
        )}
        {citation && (
          <p style={{ margin: "12px 0 0", font: `400 11px ${aMono}`, lineHeight: 1.6, color: t.cite }}>{citation}</p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>{actions}</div>
      )}
    </div>
  );
}

/** Button styled to sit inside an Alert of the given tone. */
export function AlertAction({ tone = "neutral", onClick, children }) {
  const inverse = tone === "inverse";
  return (
    <button onClick={onClick}
      style={{ padding: "8px 14px", borderRadius: "var(--radius-sm, 2px)", cursor: "pointer",
        border: `1px solid ${inverse ? "var(--zinc-600, #57534e)" : "var(--border, #e7e5e4)"}`,
        background: inverse ? "var(--zinc-800, #292524)" : "var(--surface, #fff)",
        color: inverse ? "var(--fg-inverse, #fff)" : "var(--fg2, #57534e)",
        font: `500 13px ${aFont}`, whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function Alert(props) {
  if (props.loading) return <Skeleton height={64} style={props.style} />;
  return <AlertBase {...props} />;
}
