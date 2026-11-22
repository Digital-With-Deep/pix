import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState, useEffect, useId } = React;

const tSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const tMono = "var(--font-mono, ui-monospace, Menlo, monospace)";
const STATUS = {
  queued: { label: "Queued", fg: "var(--fg3, #71717a)", dot: "var(--zinc-300, #d4d4d8)" },
  running: { label: "Running", fg: "var(--blue-800, #1e40af)", dot: "var(--blue-500, #3b82f6)" },
  done: { label: "Done", fg: "var(--truth, #047857)", dot: "var(--emerald-500, #10b981)" },
  failed: { label: "Failed", fg: "var(--claim, #b91c1c)", dot: "var(--claim, #b91c1c)" },
  approval: { label: "Needs approval", fg: "var(--amber-800, #92400e)", dot: "var(--fault, #d97706)" },
};
const P = {
  wrench: "M11.42 15.17L17.25 21A2.65 2.65 0 0021 17.25l-5.88-5.88M11.42 15.17l2.5-3.03c.31-.38.74-.63 1.2-.8M11.42 15.17l-4.65 5.65a2.55 2.55 0 11-3.59-3.59l5.65-4.65m5.69-.62c.55-.21 1.17-.24 1.73-.08 1.48.4 3.08-.02 4.13-1.07a4.5 4.5 0 00.98-4.86l-2.83 2.83-2.47-.41-.41-2.47 2.83-2.83a4.5 4.5 0 00-4.86.98 4.5 4.5 0 00-1.07 4.13c.16.56.13 1.18-.08 1.73",
  chev: "M8.25 4.5l7.5 7.5-7.5 7.5",
  redo: "M4 4v5h.6m15.4 2A8 8 0 004.6 9m0 0H9",
};
function Ico({ d, size = 13, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, ...style }}><path d={d} /></svg>;
}
const ANIM = "__pix_toolcall_anim";
function ensureAnim() {
  if (typeof document === "undefined" || document.getElementById(ANIM)) return;
  const s = document.createElement("style");
  s.id = ANIM;
  s.textContent = "@keyframes pixToolPulse{0%,100%{opacity:1}50%{opacity:.35}}@media (prefers-reduced-motion: reduce){[data-pix-pulse]{animation:none!important}}";
  document.head.appendChild(s);
}
function pretty(v) {
  if (v === undefined) return "";
  if (typeof v === "string") {
    try { return JSON.stringify(JSON.parse(v), null, 2); } catch { return v; }
  }
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

function Block({ label, value, tone }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ font: `600 10px ${tSans}`, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg3, #71717a)" }}>{label}</div>
      <pre style={{ margin: 0, padding: "8px 10px", maxHeight: 220, overflow: "auto", borderRadius: 3,
        background: tone === "error" ? "var(--claim-bg, #fef2f2)" : "var(--zinc-50, #fafafa)",
        border: `1px solid ${tone === "error" ? "var(--red-200, #fecaca)" : "var(--divider, #f4f4f5)"}`,
        font: `400 11.5px/1.55 ${tMono}`, color: tone === "error" ? "var(--claim, #b91c1c)" : "var(--fg1, #18181b)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{value}</pre>
    </div>
  );
}

function ToolCallBase({ name, status = "done", input, output, error, duration, description, defaultOpen, open: openProp, onOpenChange, onRetry, children, style }) {
  const uid = useId();
  const autoOpen = status === "running" || status === "failed" || status === "approval";
  const [openState, setOpen] = useState(defaultOpen !== undefined ? defaultOpen : autoOpen);
  useEffect(() => { if (defaultOpen === undefined && openProp === undefined) setOpen(autoOpen); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  ensureAnim();
  const open = openProp !== undefined ? openProp : openState;
  const toggle = () => { const n = !open; if (openProp === undefined) setOpen(n); onOpenChange && onOpenChange(n); };
  const s = STATUS[status] || STATUS.done;
  const inText = pretty(input);
  const outText = pretty(output);
  const bodyId = `${uid}-body`;

  return (
    <div style={{ border: `1px solid ${status === "failed" ? "var(--red-200, #fecaca)" : "var(--border, #e4e4e7)"}`, borderRadius: 4, background: "var(--surface, #fff)", fontFamily: tSans, ...style }}>
      <button type="button" aria-expanded={open} aria-controls={bodyId} onClick={toggle}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: 0, background: "transparent", cursor: "pointer", textAlign: "left", color: "var(--fg1, #18181b)" }}>
        <Ico d={P.chev} size={12} style={{ color: "var(--fg3, #71717a)", transform: open ? "rotate(90deg)" : "none", transition: "transform 120ms" }} />
        <span style={{ display: "flex", color: "var(--fg2, #52525b)" }}><Ico d={P.wrench} /></span>
        <span style={{ font: `600 12px ${tMono}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name || "tool"}</span>
        {description && <span style={{ font: `400 12px ${tSans}`, color: "var(--fg3, #71717a)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{description}</span>}
        <span style={{ flex: 1 }} />
        {duration && <span style={{ font: `400 11px ${tMono}`, color: "var(--fg3, #71717a)" }}>{duration}</span>}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: `500 11px ${tSans}`, color: s.fg }}>
          <span data-pix-pulse="" style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, animation: status === "running" ? "pixToolPulse 1.2s ease-in-out infinite" : "none" }} />
          {s.label}
        </span>
      </button>
      {open && (
        <div id={bodyId} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "2px 10px 10px 30px" }}>
          {inText !== "" && <Block label="Input" value={inText} />}
          {status === "failed" && (error || outText) && <Block label="Error" value={error || outText} tone="error" />}
          {status !== "failed" && outText !== "" && <Block label="Output" value={outText} />}
          {status === "running" && outText === "" && <div role="status" style={{ font: `400 12px ${tSans}`, color: "var(--fg3, #71717a)" }}>Waiting for the tool to return…</div>}
          {children}
          {status === "failed" && onRetry && (
            <div>
              <button type="button" onClick={onRetry} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3, background: "var(--surface, #fff)", font: `500 11px ${tSans}`, color: "var(--fg2, #52525b)", cursor: "pointer" }}>
                <Ico d={P.redo} size={11} />Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** One tool call an agent made: the tool, its status, the input it sent and what came back. Collapsed when done, open while running or failed. With `loading`, renders a skeleton in its own footprint. */
export function ToolCall(props) {
  if (props.loading) return <Skeleton variant="block" height={38} style={props.style} />;
  return <ToolCallBase {...props} />;
}
