import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const nsFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const nsKindTone = {
  neutral: { bg: "var(--zinc-100, #f4f4f5)", fg: "var(--fg2, #52525b)" },
  warning: { bg: "var(--amber-100, #fef3c7)", fg: "var(--amber-800, #92400e)" },
  danger: { bg: "var(--red-100, #fee2e2)", fg: "var(--red-700, #b91c1c)" },
  info: { bg: "var(--blue-100, #dbeafe)", fg: "var(--blue-700, #1d4ed8)" },
  success: { bg: "var(--emerald-100, #d1fae5)", fg: "var(--emerald-800, #065f46)" },
};

function NextStepsBase({ title = "Suggested next steps", subtitle, items = [], onDismiss, dismissLabel = "Dismiss all", style }) {
  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: nsFont, ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <span style={{ display: "flex", flexShrink: 0, width: 20, height: 20, borderRadius: 3, background: "var(--violet-600, #7c3aed)", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /></svg>
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", font: `600 13px ${nsFont}`, color: "var(--fg1, #18181b)" }}>{title}</span>
          {subtitle && <span style={{ display: "block", font: `400 12px ${nsFont}`, color: "var(--fg3, #71717a)", marginTop: 2 }}>{subtitle}</span>}
        </span>
        {onDismiss && (
          <button onClick={onDismiss} style={{ marginLeft: "auto", border: 0, background: "transparent", padding: 0, cursor: "pointer", font: `500 12px ${nsFont}`, color: "var(--fg3, #71717a)" }}>{dismissLabel}</button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 280px), 1fr))` }}>
        {items.map((it, i) => {
          const t = nsKindTone[it.kindTone || "neutral"] || nsKindTone.neutral;
          return (
            <div key={it.title} style={{ padding: "14px 16px 16px", borderLeft: i === 0 ? "none" : "1px solid var(--divider, #f4f4f5)", minWidth: 0 }}>
              {it.kind && (
                <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 3, background: t.bg, color: t.fg, fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{it.kind}</span>
              )}
              <div style={{ font: `600 13px ${nsFont}`, color: "var(--fg1, #18181b)", marginTop: 10 }}>{it.title}</div>
              <p style={{ font: `400 12px ${nsFont}`, lineHeight: 1.5, color: "var(--fg2, #52525b)", margin: "6px 0 0" }}>{it.body}</p>
              {it.action && (
                <button onClick={it.onAction} style={{ marginTop: 10, border: 0, background: "transparent", padding: 0, cursor: "pointer", font: `600 12px ${nsFont}`, color: "var(--emerald-700, #047857)" }}>{it.action} ›</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function NextSteps(props) {
  if (props.loading) return <Skeleton.List rows={3} glyph twoLine style={props.style} />;
  return <NextStepsBase {...props} />;
}
