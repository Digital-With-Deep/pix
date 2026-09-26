import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState: useTtState, useEffect: useTtEffect, useRef: useTtRef } = React;

const ttFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const ttMonoFont = "var(--font-mono, ui-monospace, monospace)";
const TT_CLOCK = "M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z";
const TT_TOOL = "M10.3 4.3a4 4 0 105.4 5.4l4 4a2 2 0 01-2.8 2.8l-4-4a4 4 0 01-5.4-5.4z";
const TT_CHECK = "M5 13l4 4L19 7";
const TT_SPARK = "M13 3l2.3 6.9L21 12l-5.7 2.1L13 21l-2.3-6.9L5 12l5.7-2.1L13 3z";
const TT_CHEVRON_DOWN = "M19 9l-7 7-7-7";
const TT_REPLAY = "M4 4v6h6M20 20v-6h-6M20 9a8 8 0 00-14.3-3M4 15a8 8 0 0014.3 3";
const TT_READ = "M12 3v10m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2";
const TT_WRITE = "M12 21V11m0 0l-4 4m4-4l4 4M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2";
const ttIo = {
  read: { glyph: TT_READ, ink: "var(--blue-700, #1d4ed8)", chipBg: "var(--blue-50, #eff6ff)", chipInk: "var(--blue-700, #1d4ed8)", verb: "read" },
  write: { glyph: TT_WRITE, ink: "var(--amber-700, #b45309)", chipBg: "var(--amber-50, #fffbeb)", chipInk: "var(--amber-700, #b45309)", verb: "write-back" },
};

const ttSystemMarks = [
  [/\bsap\b|s\/4|hana|bseg/i, "SAP", "#0a6ed1"],
  [/sharepoint/i, "SP", "#038387"],
  [/powerpoint|\.pptx?/i, "P", "#c43e1c"],
  [/\bexcel\b|\.xlsx?/i, "X", "#107c41"],
  [/\bword\b|\.docx?/i, "W", "#185abd"],
  [/outlook|exchange/i, "O", "#0f6cbd"],
  [/servicenow/i, "SN", "#0f4f43"],
  [/salesforce/i, "SF", "#00a1e0"],
  [/snowflake/i, "SF", "#29b5e8"],
  [/oracle/i, "OR", "#c74634"],
  [/workday/i, "WD", "#f38b00"],
  [/\bs3\b|bucket|aws/i, "S3", "#e25444"],
  [/sftp|file ?system|nas|share drive/i, "FS", "var(--zinc-600, #52525b)"],
];
function ttMarkFor(system) {
  const m = ttSystemMarks.find(([re]) => re.test(system || ""));
  if (m) return { label: m[1], bg: m[2] };
  const letters = String(system || "").replace(/[^a-z0-9 ]/gi, " ").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
  return { label: letters || "•", bg: "#57534e" };
}
function TtSystemMark({ system, logo }) {
  if (logo) {
    return typeof logo === "string"
      ? React.createElement("img", { src: logo, alt: "", style: { width: 15, height: 15, borderRadius: 3, objectFit: "contain", flexShrink: 0, display: "block" } })
      : logo;
  }
  const m = ttMarkFor(system);
  return React.createElement("span", {
    "aria-hidden": true,
    style: { width: 15, height: 15, borderRadius: 3, background: m.bg, color: "#fff", flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      font: `700 ${m.label.length > 2 ? 7 : 8}px ${ttFont}`, letterSpacing: "0.02em" },
  }, m.label);
}

const TT_STYLE_ID = "__pix_thinking_trace";
function ttEnsureStyles() {
  if (typeof document === "undefined" || document.getElementById(TT_STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = TT_STYLE_ID;
  s.textContent = "@keyframes ttIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}"
    + "@keyframes ttPulse{0%,100%{opacity:1}50%{opacity:.4}}"
    + "@keyframes ttRail{from{transform:scaleY(0)}to{transform:scaleY(1)}}"
    + "@keyframes ttSpin{to{transform:rotate(360deg)}}";
  document.head.appendChild(s);
}

function TtIcon({ path, size = 13 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, display: "block" } },
    React.createElement("path", { d: path }));
}

function ThinkingTraceBase({
  steps = [], title = "Thinking it through…", status = "streaming",
  workingLabel = "Working on it…", doneLabel, interval = 900, defaultOpen = true,
  revealed, onComplete, onReplay, replayLabel = "Replay", action, style,
}) {
  ttEnsureStyles();
  const controlled = typeof revealed === "number";
  const [open, setOpen] = useTtState(defaultOpen);
  const [count, setCount] = useTtState(controlled ? revealed : status === "done" ? steps.length : 1);
  const done = useTtRef(false);

  useTtEffect(() => { done.current = false; }, [steps]);

  useTtEffect(() => {
    if (controlled || status === "done") { setCount(controlled ? revealed : steps.length); return; }
    if (count >= steps.length) {
      if (!done.current && onComplete) { done.current = true; onComplete(); }
      return;
    }
    const t = setTimeout(() => setCount(c => c + 1), interval);
    return () => clearTimeout(t);
  }, [count, steps.length, status, interval, controlled, revealed]);

  const shown = steps.slice(0, Math.max(0, Math.min(steps.length, controlled ? revealed : count)));
  const streaming = status !== "done";

  return (
    <div style={{ fontFamily: ttFont, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
        <button onClick={() => setOpen(o => !o)} aria-expanded={open}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 6px 3px 0", border: 0, background: "transparent", cursor: "pointer",
            font: `500 12px ${ttFont}`, color: "var(--fg2, #52525b)" }}>
          <span style={{ whiteSpace: "nowrap", animation: streaming ? "ttPulse 1.6s ease-in-out infinite" : "none" }}>{streaming ? title : (doneLabel || "Thought it through")}</span>
          <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 220ms cubic-bezier(.4,0,.2,1)" }}>
            <TtIcon path={TT_CHEVRON_DOWN} size={12} />
          </span>
        </button>
        {!streaming && onReplay && (
          <button onClick={onReplay} title={replayLabel} aria-label={replayLabel}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, padding: 0, border: 0, borderRadius: 3,
              background: "transparent", color: "var(--fg3, #71717a)", cursor: "pointer", animation: "ttIn 260ms cubic-bezier(.4,0,.2,1)" }}>
            <TtIcon path={TT_REPLAY} size={13} />
          </button>
        )}
        {!streaming && action}
      </div>

      {open && (
        <ol style={{ listStyle: "none", margin: "6px 0 0", padding: 0, position: "relative" }}>
          {shown.map((s, i) => {
            const last = i === shown.length - 1;
            const active = streaming && last;
            const kind = s.kind || (s.tool ? "tool" : "thought");
            const io = ttIo[kind];
            const isTool = kind === "tool" || !!io;
            const glyph = io ? io.glyph : kind === "tool" ? TT_TOOL : active ? TT_CLOCK : s.state === "done" || !streaming ? TT_CHECK : TT_CLOCK;
            const ink = io ? io.ink : kind === "tool" ? "var(--fg1, #18181b)" : active ? "var(--emerald-600, #059669)" : "var(--fg-muted, #a1a1aa)";
            return (
              <li key={(s.label || "") + i} style={{ display: "flex", gap: 10, padding: "5px 0", animation: "ttIn 260ms cubic-bezier(.4,0,.2,1)" }}>
                <span style={{ position: "relative", width: 18, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                  <span style={{ color: ink, marginTop: 2, animation: active ? "ttPulse 1.5s ease-in-out infinite" : "none" }}>
                    <TtIcon path={glyph} size={13} />
                  </span>
                  {!last && (
                    <span style={{ position: "absolute", top: 20, bottom: -7, left: "50%", width: 1, marginLeft: -0.5,
                      background: "var(--zinc-200, #e4e4e7)", transformOrigin: "top", animation: "ttRail 300ms cubic-bezier(.4,0,.2,1)" }} />
                  )}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 6, font: isTool ? `600 12px ${ttMonoFont}` : `400 12.5px ${ttFont}`,
                    color: isTool ? "var(--fg1, #18181b)" : "var(--fg2, #52525b)", lineHeight: 1.5 }}>
                    {io && (
                      <span style={{ font: `600 10px ${ttFont}`, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 5px", borderRadius: 3,
                        background: io.chipBg, color: io.chipInk, whiteSpace: "nowrap" }}>{s.verb || io.verb}</span>
                    )}
                    <span>{s.label}</span>
                    {s.system && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                        <TtSystemMark system={s.system} logo={s.logo} />
                        <span style={{ font: `500 11px ${ttFont}`, color: "var(--fg3, #71717a)" }}>{(io ? (kind === "read" ? "from " : "to ") : "") + s.system}</span>
                      </span>
                    )}
                  </span>
                  {(s.lines || []).map(l => (
                    <span key={l} style={{ display: "block", marginTop: 4, paddingLeft: 10, borderLeft: "1px solid var(--zinc-200, #e4e4e7)",
                      font: `400 12px ${ttFont}`, color: "var(--fg3, #71717a)", lineHeight: 1.5 }}>{l}</span>
                  ))}
                  {isTool && s.detail && (
                    <span style={{ display: "block", marginTop: 3, font: `400 11px ${ttMonoFont}`, color: "var(--fg-muted, #a1a1aa)" }}>{s.detail}</span>
                  )}
                </span>
                {s.duration && <span style={{ flexShrink: 0, font: `400 11px ${ttMonoFont}`, color: "var(--fg-muted, #a1a1aa)", marginTop: 2 }}>{s.duration}</span>}
              </li>
            );
          })}
        </ol>
      )}

      {streaming && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
          <span style={{ width: 18, display: "flex", justifyContent: "center", color: "var(--emerald-600, #059669)", animation: "ttSpin 2.4s linear infinite" }}>
            <TtIcon path={TT_SPARK} size={14} />
          </span>
          <span style={{ whiteSpace: "nowrap", font: `600 12.5px ${ttFont}`, color: "var(--fg1, #18181b)", animation: "ttPulse 1.6s ease-in-out infinite" }}>{workingLabel}</span>
        </div>
      )}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function ThinkingTrace(props) {
  if (props.loading) return <Skeleton.List rows={4} glyph twoLine style={props.style} />;
  return <ThinkingTraceBase {...props} />;
}
