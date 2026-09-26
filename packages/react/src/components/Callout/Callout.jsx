import * as React from "react";
const coSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const CO_TONES = {
  info: { bg: "var(--blue-50, #eff6ff)", border: "var(--blue-100, #dbeafe)", fg: "var(--blue-800, #1e40af)", icon: "info" },
  note: { bg: "var(--zinc-50, #fafafa)", border: "var(--border, #e4e4e7)", fg: "var(--fg1, #18181b)", icon: "note" },
  warn: { bg: "var(--amber-50, #fffbeb)", border: "var(--amber-200, #fde68a)", fg: "var(--amber-800, #92400e)", icon: "warn" },
  truth: { bg: "var(--truth-bg, #ecfdf5)", border: "var(--emerald-200, #a7f3d0)", fg: "var(--emerald-800, #065f46)", icon: "check" },
  claim: { bg: "var(--claim-bg, #fef2f2)", border: "var(--red-200, #fecaca)", fg: "var(--red-700, #b91c1c)", icon: "warn" },
};
const CO_ICONS = {
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  note: <><path d="M4 5h16v11H8l-4 4z" /></>,
  warn: <><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17.5h.01" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></>,
};

/** An inline note that teaches or warns in place — what enabling this costs, what a field expects, what changed. Not a finding: findings use Alert. */
export function Callout({ tone = "info", icon, title, children, body, action, compact = false, style }) {
  const t = CO_TONES[tone] || CO_TONES.info;
  const glyph = icon === false ? null : CO_ICONS[typeof icon === "string" ? icon : t.icon] || CO_ICONS[t.icon];
  return (
    <div role={tone === "claim" || tone === "warn" ? "alert" : "note"} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: compact ? "8px 12px" : "12px 14px", borderRadius: 4, background: t.bg, border: `1px solid ${t.border}`, color: t.fg, fontFamily: coSans, ...style }}>
      {glyph && <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>{glyph}</svg>}
      <div style={{ flex: 1, minWidth: 0, font: `400 ${compact ? 12 : 13}px/1.55 ${coSans}` }}>
        {title && <div style={{ fontWeight: 600, marginBottom: children || body ? 2 : 0 }}>{title}</div>}
        <div style={{ opacity: title ? 0.92 : 1 }}>{children || body}</div>
      </div>
      {action && <div style={{ flexShrink: 0, alignSelf: "center" }}>{action}</div>}
    </div>
  );
}
