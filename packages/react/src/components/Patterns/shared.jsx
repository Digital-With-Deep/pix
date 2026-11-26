// Shared pieces of the pattern components (PatternList, PatternDetail, PatternRuleEditor,
// PatternAlertSettings). Internal: not exported from the package index.
import * as React from "react";

export const ptSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
export const ptMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

export const PT_SEVERITY_ORDER = ["high", "medium", "low", "info"];
// Severity uses the deficiency scale, never the claim or truth colours.
export const PT_SEVERITY = {
  high: { label: "High", ink: "var(--deficiency-3, #b91c1c)", bg: "var(--deficiency-3-bg, #fef2f2)", rank: 0 },
  medium: { label: "Medium", ink: "var(--deficiency-2, #c2410c)", bg: "var(--deficiency-2-bg, #fff7ed)", rank: 1 },
  low: { label: "Low", ink: "var(--deficiency-1, #b45309)", bg: "var(--deficiency-1-bg, #fffbeb)", rank: 2 },
  info: { label: "Info", ink: "var(--fg2, #57534e)", bg: "var(--bg-muted, #f5f5f4)", rank: 3 },
};
export const PT_STATUS_ORDER = ["open", "investigating", "closed", "duplicate"];
// Closed is neutral on purpose: closing a pattern is a judgment, not a verified fix.
export const PT_STATUS = {
  open: { label: "Open", ink: "var(--fg1, #1c1917)", bg: "var(--bg-muted, #f5f5f4)" },
  investigating: { label: "Investigating", ink: "var(--control, #6d28d9)", bg: "var(--control-bg, #f5f3ff)" },
  closed: { label: "Closed", ink: "var(--fg2, #57534e)", bg: "transparent" },
  duplicate: { label: "Duplicate", ink: "var(--fg2, #57534e)", bg: "transparent" },
};
export const PT_UNITS = ["traces", "users", "sessions"];

export const PT_ICONS = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14m7-7H5",
  link: "M13.8 10.2a4 4 0 010 5.6l-2.8 2.8a4 4 0 01-5.6-5.6l1.4-1.4m3-3l1.4-1.4a4 4 0 015.6 5.6l-1.4 1.4",
  copy: "M9 9h10v10H9zM5 15V5h10",
  play: "M7 5l11 7-11 7z",
  check: "M5 13l4 4L19 7",
  scope: "M12 3v3m0 12v3M3 12h3m12 0h3M12 8a4 4 0 100 8 4 4 0 000-8z",
  file: "M7 3h7l4 4v14H7zM14 3v4h4",
  up: "M7 10v10H4V10zm0 0l4-7a2 2 0 012 2v4h5a2 2 0 012 2.3l-1 6A2 2 0 0117 20H7",
  down: "M17 14V4h3v10zm0 0l-4 7a2 2 0 01-2-2v-4H6a2 2 0 01-2-2.3l1-6A2 2 0 017 4h10",
  bell: "M6 17V11a6 6 0 0112 0v6l2 2H4zm4 4h4",
};

const PT_CSS = ".pix-pt button:focus-visible,.pix-pt select:focus-visible,.pix-pt input:focus-visible,.pix-pt textarea:focus-visible,.pix-pt a:focus-visible{outline:2px solid var(--accent, #10b981);outline-offset:2px}"
  + ".pix-pt-row:hover{background:var(--bg-subtle, #fafaf9)}"
  + "@media (prefers-reduced-motion:no-preference){.pix-pt-pulse{animation:pix-pt-pulse 1.4s ease-in-out infinite}}"
  + "@keyframes pix-pt-pulse{0%,100%{opacity:1}50%{opacity:.35}}";
export function ptEnsureStyle() {
  if (typeof document === "undefined" || document.getElementById("__pix_patterns")) return;
  const s = document.createElement("style"); s.id = "__pix_patterns"; s.textContent = PT_CSS; document.head.appendChild(s);
}

export const ptCap = { font: `600 10px ${ptSans}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg2, #57534e)" };
export const ptBtn = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 28, padding: "4px 10px", border: "1px solid var(--border-strong, #d6d3d1)", borderRadius: 3, background: "var(--surface, #fff)", font: `500 12px ${ptSans}`, color: "var(--fg1, #1c1917)", cursor: "pointer", whiteSpace: "nowrap" };
export const ptBtnPrimary = { ...ptBtn, border: "1px solid var(--fg1, #1c1917)", background: "var(--fg1, #1c1917)", color: "var(--surface, #fff)" };
export const ptInput = { boxSizing: "border-box", width: "100%", minHeight: 30, padding: "5px 9px", border: "1px solid var(--border-strong, #d6d3d1)", borderRadius: 3, background: "var(--surface, #fff)", font: `400 13px ${ptSans}`, color: "var(--fg1, #1c1917)" };
export const ptBox = { background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 4, fontFamily: ptSans, color: "var(--fg1, #1c1917)" };

export function PtIcon({ name, size = 13, width = 2 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, display: "block" }, "aria-hidden": true },
    React.createElement("path", { d: PT_ICONS[name] }));
}

export function PtSeverity({ value }) {
  const t = PT_SEVERITY[value];
  if (!t) return <span style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>Unrated</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "1px 6px", borderRadius: 2, background: t.bg, color: t.ink, font: `600 10px ${ptMono}`, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor" }} />{t.label}
    </span>
  );
}
export function PtStatus({ value }) {
  const t = PT_STATUS[value] || PT_STATUS.open;
  const outline = t.bg === "transparent";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: outline ? "0 6px" : "1px 6px", borderRadius: 2, background: t.bg, border: outline ? "1px solid var(--border-strong, #d6d3d1)" : "none", color: t.ink, font: `500 11px ${ptSans}`, whiteSpace: "nowrap" }}>
      {value === "investigating" && <span className="pix-pt-pulse" style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor" }} />}
      {t.label}
    </span>
  );
}
export function PtFlag({ children }) {
  return <span style={{ padding: "0 5px", borderRadius: 2, border: "1px solid var(--border-strong, #d6d3d1)", font: `500 10px/16px ${ptSans}`, color: "var(--fg2, #57534e)", whiteSpace: "nowrap" }}>{children}</span>;
}

export function ptMs(v) { if (v == null || v === "") return NaN; return typeof v === "number" ? v : v instanceof Date ? v.getTime() : Date.parse(v); }
const PT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Nov 14" (UTC). */
export function ptDay(ms) { if (isNaN(ms)) return "—"; const d = new Date(ms); return PT_MONTHS[d.getUTCMonth()] + " " + d.getUTCDate(); }
/** "Nov 14, 09:21 UTC". */
export function ptStamp(ms) {
  if (isNaN(ms)) return "—";
  const d = new Date(ms), z = (n) => String(n).padStart(2, "0");
  return ptDay(ms) + ", " + z(d.getUTCHours()) + ":" + z(d.getUTCMinutes()) + " UTC";
}
/** "just now", "12m ago", "3h ago", "5d ago", then a date. */
export function ptAgo(ms, now) {
  if (isNaN(ms) || isNaN(now)) return "—";
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 30 * 86400) return Math.floor(s / 86400) + "d ago";
  return ptDay(ms);
}
/** 1234 → "1,234"; 12345 → "12.3k". */
export function ptNum(n) {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/** 0.0612 → "6.1%". */
export function ptPct(share) {
  if (share == null || isNaN(share)) return "—";
  const p = share * 100;
  return (p > 0 && p < 0.1 ? "<0.1" : p >= 10 ? String(Math.round(p)) : p.toFixed(1).replace(/\.0$/, "")) + "%";
}
/** The count a pattern reports for a unit, falling back to traces. */
export function ptImpactCount(pattern, unit) {
  const i = (pattern && pattern.impact) || {};
  return i[unit] != null ? { n: i[unit], unit } : i.traces != null ? { n: i.traces, unit: "traces" } : null;
}
export function ptCopy(text) {
  try { if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) { /* clipboard unavailable */ }
}
/** Only http(s), mailto and relative links are ever rendered as links. */
export function ptSafeHref(href) { return typeof href === "string" && /^(https?:\/\/|mailto:|\/|#|\.)/i.test(href.trim()) ? href : undefined; }
