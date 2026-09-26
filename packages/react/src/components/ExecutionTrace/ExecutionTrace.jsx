import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState: useTraceState } = React;

const xFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const xMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const X_CHEVRON = "M9 5l7 7-7 7";
const X_WARN = "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z";
const X_NEVER = "M15 9l-6 6m0-6l6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

function XIcon({ path, size = 13 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
    React.createElement("path", { d: path }));
}

function fmtArgs(args) {
  if (args === undefined || args === null) return null;
  if (typeof args === "string") return args;
  const body = Object.keys(args).map(k => `"${k}": ${JSON.stringify(args[k])}`).join(", ");
  return `{ ${body} }`;
}

function Note({ children }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "10px 0 2px", padding: "10px 12px", background: "var(--fault-bg, #fffbeb)",
      border: "1px solid var(--fault-border, #fde68a)", borderRadius: 3 }}>
      <span style={{ color: "var(--amber-600, #d97706)", display: "flex", marginTop: 1 }}><XIcon path={X_WARN} size={13} /></span>
      <span style={{ font: `400 12px ${xFont}`, color: "var(--fault, #b45309)", lineHeight: 1.6 }}>{children}</span>
    </div>
  );
}

function Step({ step, index, defaultOpen }) {
  const [open, setOpen] = useTraceState(defaultOpen || false);
  const flagged = !!step.flagged || !!step.note;
  const args = fmtArgs(step.args);

  return (
    <li style={{ borderTop: index === 0 ? 0 : "1px solid var(--divider, #f5f5f4)" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "12px 14px", cursor: "pointer" }}>
        <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
          font: `600 11px ${xMono}`, marginTop: 1,
          background: flagged ? "var(--amber-100, #fef3c7)" : "var(--zinc-100, #f5f5f4)",
          color: flagged ? "var(--amber-700, #b45309)" : "var(--fg3, #78716c)",
          boxShadow: flagged ? "inset 0 0 0 1px var(--amber-200, #fde68a)" : "none" }}>
          {step.index ?? index + 1}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", font: `600 13px ${xMono}`, color: "var(--fg1, #1c1917)" }}>{step.name}</span>
          {args && <span style={{ display: "block", font: `400 12px ${xMono}`, color: "var(--fg3, #78716c)", marginTop: 3, wordBreak: "break-word" }}>{args}</span>}
        </span>
        <span style={{ font: `400 11px ${xMono}`, color: "var(--fg-muted, #a8a29e)", flexShrink: 0, marginTop: 3, minWidth: 42, textAlign: "right" }}>
          {step.duration || "—"}
        </span>
        <span style={{ color: "var(--zinc-300, #d6d3d1)", display: "flex", flexShrink: 0, marginTop: 4,
          transform: open ? "rotate(90deg)" : "none", transition: "transform 150ms" }}>
          <XIcon path={X_CHEVRON} size={13} />
        </span>
      </div>
      {(step.note || (open && step.result)) && (
        <div style={{ padding: "0 14px 12px 45px" }}>
          {open && step.result && (
            <pre style={{ margin: "0 0 2px", padding: "10px 12px", background: "var(--zinc-50, #fafaf9)", border: "1px solid var(--border, #e7e5e4)",
              borderRadius: 3, font: `400 11px ${xMono}`, color: "var(--fg2, #57534e)", lineHeight: 1.6, whiteSpace: "pre-wrap", overflowX: "auto" }}>{step.result}</pre>
          )}
          {step.note && <Note>{step.note}</Note>}
        </div>
      )}
    </li>
  );
}

function ExecutionTraceBase({
  title = "Execution trace", steps = [], calls, duration, tokens, cost, meta,
  missing = [], defaultOpen = false, style,
}) {
  const summary = meta || [
    calls !== undefined ? `${calls} calls` : `${steps.length} calls`,
    duration, tokens, cost,
  ].filter(Boolean).join(" · ");

  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 4, overflow: "hidden", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, padding: "11px 14px", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
        <span style={{ font: `600 10px ${xFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #78716c)" }}>{title}</span>
        <span style={{ flex: 1 }} />
        <span style={{ font: `400 11px ${xMono}`, color: "var(--fg-muted, #a8a29e)" }}>{summary}</span>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {steps.map((s, i) => <Step key={`${s.name}-${i}`} step={s} index={i} defaultOpen={defaultOpen} />)}
      </ul>

      {missing.length > 0 && (
        <div style={{ padding: "12px 14px", borderTop: "1px solid var(--divider, #f5f5f4)" }}>
          {missing.map(m => (
            <div key={m.name} style={{ display: "flex", gap: 9, padding: "12px 14px", borderRadius: 3,
              border: "1px solid var(--fault-border, #fde68a)",
              background: "repeating-linear-gradient(135deg, var(--amber-50, #fffbeb) 0px, var(--amber-50, #fffbeb) 7px, var(--amber-100, #fef3c7) 7px, var(--amber-100, #fef3c7) 14px)" }}>
              <span style={{ color: "var(--amber-600, #d97706)", display: "flex", marginTop: 1 }}><XIcon path={X_NEVER} size={14} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", font: `600 12px ${xMono}`, color: "var(--fault, #b45309)" }}>
                  {m.name} — {m.label || "never called"}
                </span>
                {m.note && <span style={{ display: "block", font: `400 12px ${xFont}`, color: "var(--fault, #b45309)", lineHeight: 1.6, marginTop: 4 }}>{m.note}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function ExecutionTrace(props) {
  if (props.loading) return <Skeleton.List rows={(props.steps || []).length || 5} glyph twoLine style={props.style} />;
  return <ExecutionTraceBase {...props} />;
}
