import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { ThinkingTrace } from "../ThinkingTrace/ThinkingTrace.jsx";
const { useState: useRespState } = React;

const rFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const R_SPARK = "M13 3l2.3 6.9L21 12l-5.7 2.1L13 21l-2.3-6.9L5 12l5.7-2.1L13 3z";
const R_CHEVRON = "M9 5l7 7-7 7";
const R_CHEVRON_DOWN = "M19 9l-7 7-7-7";
const R_LINK = "M13.8 10.2a4 4 0 010 5.6l-2.8 2.8a4 4 0 01-5.6-5.6l1.4-1.4m3-3l1.4-1.4a4 4 0 015.6 5.6l-1.4 1.4";
const R_STOP = "M6 6h12v12H6z";
const R_COPY = "M8 8V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M6 8h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z";
const R_REDO = "M4 4v5h.6m15.4 2A8 8 0 004.6 9m0 0H9";
const R_ALERT = "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z";
const R_THINK = "M12 3a7 7 0 00-4 12.7V19a1 1 0 001 1h6a1 1 0 001-1v-3.3A7 7 0 0012 3z";
const R_UP = "M7 20V10m0 0l3.5-6.5A1.5 1.5 0 0113 5v4h4.6a2 2 0 011.96 2.4l-1.2 6A2 2 0 0116.4 19H7m0 1H4a1 1 0 01-1-1v-8a1 1 0 011-1h3";
const R_DOWN = "M7 4v10m0 0l3.5 6.5A1.5 1.5 0 0013 19v-4h4.6a2 2 0 001.96-2.4l-1.2-6A2 2 0 0016.4 4H7m0 0H4a1 1 0 00-1 1v8a1 1 0 001 1h3";

function RIcon({ path, size = 13 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
    React.createElement("path", { d: path }));
}

const SKELETON_KEY = "__pix_resp_shimmer";
function ensureShimmer() {
  if (typeof document === "undefined" || document.getElementById(SKELETON_KEY)) return;
  const s = document.createElement("style");
  s.id = SKELETON_KEY;
  s.textContent = "@keyframes pixShimmer{0%{background-position:-200px 0}100%{background-position:calc(200px + 100%) 0}}@keyframes pixPulse{0%,100%{opacity:1}50%{opacity:.45}}@keyframes pixReveal{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}";
  document.head.appendChild(s);
}

function SkeletonLine({ width }) {
  return React.createElement("span", { style: {
    display: "block", height: 10, width, borderRadius: 2,
    background: "linear-gradient(90deg, var(--zinc-100, #f4f4f5) 0px, var(--zinc-200, #e4e4e7) 60px, var(--zinc-100, #f4f4f5) 120px)",
    backgroundSize: "200px 100%", animation: "pixShimmer 1.4s linear infinite",
  } });
}

const metaText = { font: `400 11px ${rFont}`, color: "var(--fg3, #71717a)" };

function AIResponseBase({
  status = "done", text, children, thinking, thinkingLabel = "Show thinking",
  model, duration, tokens, error, stage = "Thinking…", stages = [], citations = [],
  onStop, onRetry, onCopy, onFeedback, onReplayThinking, showActions = true, defaultThinkingOpen = false, style,
}) {
  const [vote, setVote] = useRespState(null);
  ensureShimmer();

  const shell = { background: "var(--surface, #fff)", border: `1px solid ${status === "error" ? "var(--red-200, #fecaca)" : "var(--border, #e4e4e7)"}`, borderRadius: 4, ...style };
  const head = { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--divider, #f4f4f5)" };
  const mark = tone => ({ width: 22, height: 22, borderRadius: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    background: tone === "error" ? "var(--red-50, #fef2f2)" : "var(--zinc-900, #18181b)", color: tone === "error" ? "var(--red-700, #b91c1c)" : "var(--fg-inverse, #fff)" });

  if (status === "generating") {
    return (
      <div style={shell}>
        <div style={head}>
          <span style={{ ...mark(), animation: "pixPulse 1.6s ease-in-out infinite" }}><RIcon path={R_SPARK} size={13} /></span>
          <span style={{ font: `600 12px ${rFont}`, color: "var(--fg1, #18181b)", animation: "pixPulse 1.6s ease-in-out infinite" }}>{stage}</span>
          {model && <span style={metaText}>{model}</span>}
          <span style={{ flex: 1 }} />
          {onStop && (
            <button onClick={onStop} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", border: "1px solid var(--border, #e4e4e7)",
              borderRadius: 3, background: "var(--surface, #fff)", font: `500 11px ${rFont}`, color: "var(--fg2, #52525b)", cursor: "pointer" }}>
              <RIcon path={R_STOP} size={11} />Stop
            </button>
          )}
        </div>
        {stages.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: "10px 14px 0", display: "flex", flexDirection: "column", gap: 6 }}>
            {stages.map((s, i) => {
              const label = typeof s === "string" ? s : s.label;
              const done = typeof s === "object" && s.done;
              return (
                <li key={label} style={{ display: "flex", alignItems: "center", gap: 7, font: `400 11px ${rFont}`, color: done ? "var(--fg2, #52525b)" : "var(--fg3, #71717a)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, flexShrink: 0, background: done ? "var(--emerald-500, #10b981)" : "var(--zinc-300, #d4d4d8)",
                    animation: done ? "none" : "pixPulse 1.4s ease-in-out infinite" }} />
                  {label}
                </li>
              );
            })}
          </ul>
        )}
        <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 9 }}>
          <SkeletonLine width="92%" /><SkeletonLine width="100%" /><SkeletonLine width="78%" />
          <SkeletonLine width="88%" /><SkeletonLine width="46%" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={shell}>
        <div style={{ ...head, borderBottom: 0 }}>
          <span style={mark("error")}><RIcon path={R_ALERT} size={13} /></span>
          <span style={{ font: `600 12px ${rFont}`, color: "var(--red-700, #b91c1c)" }}>Generation failed</span>
          <span style={{ flex: 1 }} />
          {onRetry && (
            <button onClick={onRetry} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", border: "1px solid var(--border, #e4e4e7)",
              borderRadius: 3, background: "var(--surface, #fff)", font: `500 11px ${rFont}`, color: "var(--fg2, #52525b)", cursor: "pointer" }}>
              <RIcon path={R_REDO} size={11} />Retry
            </button>
          )}
        </div>
        <div style={{ padding: "0 14px 14px", font: `400 12px ${rFont}`, color: "var(--fg2, #52525b)", lineHeight: 1.6 }}>
          {error || "The model returned no response. Try again or switch models."}
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={head}>
        <span style={mark()}><RIcon path={R_SPARK} size={13} /></span>
        <span style={{ font: `600 12px ${rFont}`, color: "var(--fg1, #18181b)" }}>Response</span>
        <span style={{ flex: 1 }} />
        {model && <span style={metaText}>{model}</span>}
        {duration && <span style={metaText}>· {duration}</span>}
        {tokens && <span style={metaText}>· {tokens}</span>}
      </div>

      <div style={{ padding: "14px", font: `400 13px ${rFont}`, color: "var(--fg2, #52525b)", lineHeight: 1.65, whiteSpace: children ? "normal" : "pre-wrap" }}>
        {children || text}
      </div>

      {citations.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "0 14px 12px" }}>
          <span style={{ ...metaText, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginRight: 2 }}>Sources</span>
          {citations.map((c, i) => {
            const label = typeof c === "string" ? c : c.label;
            const note = typeof c === "object" ? c.note : null;
            const href = typeof c === "object" ? c.href : null;
            const Tag = href ? "a" : "span";
            return (
              <Tag key={label} href={href || undefined} title={note || undefined}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 7px", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3,
                  background: "var(--zinc-50, #fafafa)", font: `500 11px ${rFont}`, color: "var(--fg2, #52525b)", textDecoration: "none", cursor: href ? "pointer" : "default" }}>
                <span style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 10, color: "var(--fg-muted, #a1a1aa)" }}>{i + 1}</span>
                <span style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>{label}</span>
                {href && <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex" }}><RIcon path={R_LINK} size={11} /></span>}
              </Tag>
            );
          })}
        </div>
      )}

      {thinking && (
        <div style={{ borderTop: "1px solid var(--divider, #f4f4f5)", padding: "10px 14px 12px" }}>
          <ThinkingTrace
            steps={Array.isArray(thinking) ? thinking : String(thinking).split("\n").filter(Boolean).map(l => ({ label: l }))}
            status="done" defaultOpen={defaultThinkingOpen}
            doneLabel={thinkingLabel} onReplay={onReplayThinking} />
        </div>
      )}

      {showActions && (onCopy || onRetry || onFeedback) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "0 14px 12px" }}>
          {onCopy && (
            <button onClick={onCopy} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", border: "1px solid var(--border, #e4e4e7)",
              borderRadius: 3, background: "var(--surface, #fff)", font: `500 11px ${rFont}`, color: "var(--fg2, #52525b)", cursor: "pointer" }}>
              <RIcon path={R_COPY} size={11} />Copy
            </button>
          )}
          {onRetry && (
            <button onClick={onRetry} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", border: "1px solid var(--border, #e4e4e7)",
              borderRadius: 3, background: "var(--surface, #fff)", font: `500 11px ${rFont}`, color: "var(--fg2, #52525b)", cursor: "pointer" }}>
              <RIcon path={R_REDO} size={11} />Regenerate
            </button>
          )}
          {onFeedback && (
            <React.Fragment>
              <span style={{ width: 1, height: 18, background: "var(--divider, #f5f5f4)", margin: "0 2px" }} />
              {[["up", R_UP, "Helpful"], ["down", R_DOWN, "Not helpful"]].map(([dir, path, label]) => {
                const on = vote === dir;
                const ink = dir === "up" ? "var(--truth, #047857)" : "var(--claim, #b91c1c)";
                const bg = dir === "up" ? "var(--truth-bg, #ecfdf5)" : "var(--claim-bg, #fef2f2)";
                return (
                  <button key={dir} title={label} aria-label={label} aria-pressed={on}
                    onClick={() => { const next = on ? null : dir; setVote(next); onFeedback(next); }}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, padding: 0, borderRadius: 3,
                      border: `1px solid ${on ? ink : "var(--border, #e4e4e7)"}`, background: on ? bg : "var(--surface, #fff)",
                      color: on ? ink : "var(--fg-muted, #a8a29e)", cursor: "pointer" }}>
                    <RIcon path={path} size={13} />
                  </button>
                );
              })}
              {vote && (
                <span style={{ font: `400 11px ${rFont}`, color: "var(--fg3, #78716c)" }}>
                  {vote === "up" ? "Marked helpful" : "Marked not helpful — this response is logged for review"}
                </span>
              )}
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function AIResponse(props) {
  if (props.loading) return <Skeleton.Panel lines={5} style={props.style} />;
  return <AIResponseBase {...props} />;
}
