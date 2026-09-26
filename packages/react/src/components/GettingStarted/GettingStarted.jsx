import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const gsSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const gsMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

function GsRow({ step, isNext, first, onOpen }) {
  const [hover, setHover] = React.useState(false);
  const border = first ? "none" : "1px solid var(--divider, #f4f4f5)";
  const box = (
    <span style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      border: `1.5px solid ${step.done ? "var(--emerald-500, #10b981)" : "var(--border-strong, #d4d4d8)"}`, background: step.done ? "var(--emerald-500, #10b981)" : "transparent", color: "#fff" }}>
      {step.done && <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>}
    </span>
  );
  const label = <span style={{ flex: 1, font: `500 13px ${gsSans}`, color: step.done ? "var(--fg3, #71717a)" : "var(--fg1, #18181b)", textDecoration: step.done ? "line-through" : "none" }}>{step.label}</span>;
  const base = { display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "10px 18px", borderTop: border, textAlign: "left" };
  if (step.done) return <li style={base}>{box}{label}<span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>done</span></li>;
  return (
    <li style={{ borderTop: border }}>
      <button type="button" onClick={() => onOpen && onOpen(step)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ ...base, borderTop: 0, border: 0, cursor: "pointer", background: isNext ? "var(--accent-bg, #ecfdf5)" : hover ? "var(--zinc-50, #fafafa)" : "transparent" }}>
        {box}{label}<span style={{ font: `500 12px ${gsSans}`, color: "var(--accent-fg, #047857)" }}>{isNext ? "Start ›" : "Open ›"}</span>
      </button>
    </li>
  );
}

function GettingStartedBase({ steps = [], title, onOpen, onDismiss, style }) {
  const done = steps.filter((s) => s.done).length, total = steps.length || 1;
  const next = steps.find((s) => !s.done);
  const r = 14, c = 2 * Math.PI * r;
  return (
    <section aria-label="Getting started" style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, fontFamily: gsSans, ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <span style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" width="36" height="36" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
            <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" stroke="var(--zinc-200, #e4e4e7)" />
            <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" strokeLinecap="round" stroke="var(--emerald-500, #10b981)" strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} style={{ transition: "stroke-dashoffset 300ms ease" }} />
          </svg>
          <b style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: `700 10px ${gsMono}`, color: "var(--fg1, #18181b)" }}>{done}/{steps.length}</b>
        </span>
        <span>
          <span style={{ display: "block", font: `600 14px ${gsSans}`, color: "var(--fg1, #18181b)" }}>{!next ? "Setup complete" : title || "Finish setting up"}</span>
          <span style={{ display: "block", font: `400 12px ${gsSans}`, color: "var(--fg3, #71717a)" }}>{next ? "Next: " + next.label.charAt(0).toLowerCase() + next.label.slice(1) : "Every step below is done."}</span>
        </span>
        {onDismiss && <button type="button" onClick={onDismiss} style={{ marginLeft: "auto", border: 0, background: "transparent", cursor: "pointer", font: `500 12px ${gsSans}`, color: "var(--fg3, #71717a)" }}>{next ? "Hide for now" : "Hide"}</button>}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
        {steps.map((s, i) => <GsRow key={s.key || s.label} step={s} first={i === 0} isNext={s === next} onOpen={onOpen} />)}
      </ul>
    </section>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function GettingStarted(props) {
  if (props.loading) return <Skeleton.List rows={(props.steps || []).length || 6} glyph twoLine={false} style={props.style} />;
  return <GettingStartedBase {...props} />;
}
