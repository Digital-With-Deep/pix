import * as React from "react";
const dcSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
let dcSeq = 0;

/** A collapsed row that opens in place — "Advanced", "Install and configure the SDK". Progressive disclosure: the row names what is inside; the reader decides whether to look. */
export function Disclosure({ title, meta, icon, open, defaultOpen = false, onChange, variant = "row", children, style }) {
  const [own, setOwn] = React.useState(defaultOpen);
  const isOpen = open != null ? open : own;
  const id = React.useMemo(() => "dc" + ++dcSeq, []);
  const set = (v) => { if (open == null) setOwn(v); if (onChange) onChange(v); };
  const row = variant === "row";
  return (
    <div style={{ fontFamily: dcSans, border: row ? "1px solid var(--border, #e4e4e7)" : 0, borderRadius: row ? 4 : 0, background: row ? "var(--surface, #fff)" : "transparent", overflow: "hidden", ...style }}>
      <button type="button" aria-expanded={isOpen} aria-controls={id} onClick={() => set(!isOpen)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box", padding: row ? "10px 14px" : "6px 0", border: 0, cursor: "pointer", textAlign: "left",
          background: row ? (isOpen ? "var(--surface, #fff)" : "var(--zinc-50, #fafafa)") : "transparent", color: "var(--fg1, #18181b)", font: `500 13px ${dcSans}`, borderBottom: row && isOpen ? "1px solid var(--divider, #f4f4f5)" : 0 }}>
        {icon && <span aria-hidden="true" style={{ display: "inline-flex", color: "var(--fg2, #52525b)" }}>{icon}</span>}
        <span style={{ flex: 1, minWidth: 0 }}>{title}</span>
        {meta && <span style={{ font: `400 11px var(--font-mono, ui-monospace, monospace)`, color: "var(--fg3, #71717a)" }}>{meta}</span>}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{ flexShrink: 0, color: "var(--fg-muted, #a1a1aa)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 150ms" }}><path d="M9 6l6 6-6 6" /></svg>
      </button>
      {isOpen && <div id={id} role="region" style={{ padding: row ? "14px 14px 16px" : "4px 0 8px", font: `400 13px/1.55 ${dcSans}`, color: "var(--fg2, #52525b)" }}>{children}</div>}
    </div>
  );
}
