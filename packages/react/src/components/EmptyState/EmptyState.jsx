import * as React from "react";
const esSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const ES_ICONS = {
  plus: "M12 5v14M5 12h14", search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", lock: "M16 11V7a4 4 0 00-8 0v4M5 11h14v10H5z",
  inbox: "M4 13h4l2 3h4l2-3h4M4 13V6a2 2 0 012-2h12a2 2 0 012 2v7M4 13v5a2 2 0 002 2h12a2 2 0 002-2v-5",
  plug: "M9 3v4m6-4v4M7 7h10v4a5 5 0 01-10 0V7zm5 9v5", warn: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  check: "M5 13l4 4L19 7", file: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z",
};
const ES_TONE = {
  neutral: { bg: "var(--zinc-100, #f4f4f5)", fg: "var(--fg3, #71717a)" },
  accent: { bg: "var(--accent-bg, #ecfdf5)", fg: "var(--accent-fg, #047857)" },
  fault: { bg: "var(--fault-bg, #fffbeb)", fg: "var(--fault, #b45309)" },
  claim: { bg: "var(--claim-bg, #fef2f2)", fg: "var(--claim, #b91c1c)" },
};

/**
 * What a region shows when there is nothing in it yet — and says why, and what to do next.
 * Four situations, four different messages: first use, no results for a filter, no access, not available in this release.
 */
export function EmptyState({ icon = "inbox", tone = "neutral", title, body, actions, meta, compact = false, bordered = true, style }) {
  const t = ES_TONE[tone] || ES_TONE.neutral;
  const glyph = typeof icon === "string" ? (ES_ICONS[icon] ? <svg viewBox="0 0 24 24" width={compact ? 16 : 20} height={compact ? 16 : 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ES_ICONS[icon]} /></svg> : null) : icon;
  return (
    <div role="region" aria-label={typeof title === "string" ? title : "Empty"} style={{ display: "flex", flexDirection: compact ? "row" : "column", alignItems: compact ? "flex-start" : "center", textAlign: compact ? "left" : "center",
      gap: compact ? 12 : 10, padding: compact ? "16px 18px" : "40px 24px", fontFamily: esSans, background: "var(--surface, #fff)", borderRadius: 4,
      border: bordered ? "1px dashed var(--border-strong, #d4d4d8)" : "none", ...style }}>
      {glyph && <span aria-hidden="true" style={{ width: compact ? 32 : 44, height: compact ? 32 : 44, flexShrink: 0, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", background: t.bg, color: t.fg }}>{glyph}</span>}
      <span style={{ minWidth: 0, maxWidth: 480 }}>
        <span style={{ display: "block", font: `600 ${compact ? 13 : 15}px/1.35 ${esSans}`, color: "var(--fg1, #18181b)" }}>{title}</span>
        {body && <span style={{ display: "block", marginTop: 4, font: `400 ${compact ? 12 : 13}px/1.55 ${esSans}`, color: "var(--fg2, #52525b)" }}>{body}</span>}
        {meta && <span style={{ display: "block", marginTop: 6, font: `400 11px/1.5 var(--font-mono, ui-monospace, monospace)`, color: "var(--fg3, #71717a)" }}>{meta}</span>}
        {actions && <span style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, justifyContent: compact ? "flex-start" : "center" }}>{actions}</span>}
      </span>
    </div>
  );
}
