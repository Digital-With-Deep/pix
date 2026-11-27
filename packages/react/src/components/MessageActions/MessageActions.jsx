import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { Tooltip } from "../Tooltip/Tooltip.jsx";
import { pixSans, ensureBasicsStyle, srOnly, usePixId, useControllable, refocus } from "../../internal/basics.jsx";

const M_COPY = "M8 8V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M6 8h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z";
const M_CHECK = "M5 13l4 4L19 7";
const M_ALERT = "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z";
const M_REDO = "M4 4v5h.6m15.4 2A8 8 0 004.6 9m0 0H9";
const M_UP = "M7 20V10m0 0l3.5-6.5A1.5 1.5 0 0113 5v4h4.6a2 2 0 011.96 2.4l-1.2 6A2 2 0 0116.4 19H7m0 1H4a1 1 0 01-1-1v-8a1 1 0 011-1h3";
const M_DOWN = "M7 4v10m0 0l3.5 6.5A1.5 1.5 0 0013 19v-4h4.6a2 2 0 001.96-2.4l-1.2-6A2 2 0 0016.4 4H7m0 0H4a1 1 0 00-1 1v8a1 1 0 001 1h3";
const M_BRANCH = "M6 3v12m0 0a3 3 0 103 3 3 3 0 00-3-3zm12-6a3 3 0 10-3-3 3 3 0 003 3zm0 0a9 9 0 01-9 9";

const DEFAULT_LABELS = {
  copy: "Copy", copied: "Copied", copyFailed: "Couldn't copy", regenerate: "Regenerate",
  helpful: "Helpful", notHelpful: "Not helpful", branch: "Branch from here",
  reasonTitle: "What went wrong?", reasonPlaceholder: "Tell us more (optional)", submit: "Send feedback", cancel: "Cancel",
  thanks: "Thanks for the feedback",
};
const DEFAULT_REASONS = ["Not accurate", "Not helpful", "Didn't follow instructions", "Too long"];

const MA_CSS = ".pix-ma-btn:not(:disabled):not([aria-pressed=\"true\"]):hover{background:var(--bg-muted,#f4f4f5)!important;color:var(--fg1,#18181b)!important}"
  + ".pix-ma-chip:not([aria-pressed=\"true\"]):hover{background:var(--bg-muted,#f4f4f5)!important}";
function ensureMessageActionsStyle() {
  ensureBasicsStyle();
  if (typeof document === "undefined" || document.getElementById("pix-message-actions-css")) return;
  const s = document.createElement("style");
  s.id = "pix-message-actions-css";
  s.textContent = MA_CSS;
  document.head.appendChild(s);
}

function MIcon({ path, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
}

/** Writes `text` to the clipboard: the async Clipboard API first, then a hidden textarea and `execCommand("copy")`. */
async function copyToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall through to the legacy path */ }
  }
  if (typeof document === "undefined" || !document.body) return false;
  const active = document.activeElement;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.setAttribute("aria-hidden", "true");
  Object.assign(ta.style, { position: "fixed", top: "0", left: "-9999px", opacity: "0" });
  document.body.appendChild(ta);
  let ok = false;
  try { ta.select(); ok = document.execCommand("copy"); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  refocus(active);
  return ok;
}

function ActionButton({ label, tooltip, path, onClick, pressed, tone, disabled, placement, buttonRef, expanded, controls }) {
  const on = pressed === true;
  const ink = tone === "up" ? "var(--truth, #047857)" : tone === "down" ? "var(--claim, #b91c1c)" : "var(--fg1, #18181b)";
  const bg = tone === "up" ? "var(--truth-bg, #ecfdf5)" : tone === "down" ? "var(--claim-bg, #fef2f2)" : "var(--bg-muted, #f4f4f5)";
  return (
    <Tooltip content={tooltip || label} placement={placement}>
      <button ref={buttonRef} type="button" className="pix-ma-btn pix-o-focus" aria-label={label} aria-pressed={pressed === undefined ? undefined : on}
        aria-expanded={expanded} aria-controls={controls} onClick={onClick} disabled={disabled}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, padding: 0, borderRadius: 3, border: 0,
          background: on ? bg : "transparent", color: on ? ink : "var(--fg3, #71717a)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
        <MIcon path={path} />
      </button>
    </Tooltip>
  );
}

function MessageActionsBase({
  text, onCopy, onRegenerate, feedback, defaultFeedback = null, onFeedback, onFeedbackReason, feedbackReasons = DEFAULT_REASONS,
  onBranch, labels: labelsProp, label = "Message actions", disabled = false, tooltipPlacement = "top", children, style,
}) {
  ensureMessageActionsStyle();
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [vote, setVote] = useControllable(feedback, defaultFeedback, onFeedback);
  const [copyState, setCopyState] = React.useState("idle");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [reason, setReason] = React.useState(null);
  const [comment, setComment] = React.useState("");
  const [thanked, setThanked] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const timer = React.useRef(null);
  const downRef = React.useRef(null);
  const pickerRef = React.useRef(null);
  const mounted = React.useRef(true);
  const pickerId = usePixId("pix-ma-reason-");
  const titleId = usePixId("pix-ma-title-");
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(timer.current); }; }, []);

  // Move focus into the reason picker when it opens.
  React.useEffect(() => {
    if (!pickerOpen || !pickerRef.current) return;
    const first = pickerRef.current.querySelector("button, textarea");
    if (first) first.focus();
  }, [pickerOpen]);

  const canCopy = text !== undefined && text !== null;
  const copy = async () => {
    const value = String(typeof text === "function" ? text() : text);
    const ok = await copyToClipboard(value);
    if (!mounted.current) return;
    if (ok && onCopy) onCopy(value);
    setCopyState(ok ? "copied" : "failed");
    setAnnouncement(ok ? labels.copied : labels.copyFailed);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (mounted.current) setCopyState("idle"); }, 2000);
  };

  const closePicker = (focusBack) => {
    setPickerOpen(false);
    setReason(null);
    setComment("");
    if (focusBack) refocus(downRef.current);
  };
  const choose = (dir) => {
    const next = vote === dir ? null : dir;
    setVote(next);
    setThanked(false);
    if (next === "down" && onFeedbackReason) setPickerOpen(true);
    else if (pickerOpen) closePicker(false);
    setAnnouncement(next === "up" ? `Marked ${labels.helpful.toLowerCase()}` : next === "down" ? `Marked ${labels.notHelpful.toLowerCase()}` : "Feedback cleared");
  };
  const submitReason = () => {
    if (!reason && !comment.trim()) return;
    if (onFeedbackReason) onFeedbackReason({ vote: "down", reason, comment: comment.trim() });
    closePicker(true);
    setThanked(true);
    setAnnouncement(labels.thanks);
  };

  const copyLabel = copyState === "copied" ? labels.copied : copyState === "failed" ? labels.copyFailed : labels.copy;
  const hasFeedback = !!onFeedback || !!onFeedbackReason || feedback !== undefined;
  const reasons = Array.isArray(feedbackReasons) ? feedbackReasons : DEFAULT_REASONS;
  const chip = (on) => ({
    padding: "4px 9px", borderRadius: 999, cursor: "pointer", font: `500 11px ${pixSans}`,
    border: `1px solid ${on ? "var(--fg1, #18181b)" : "var(--border, #e4e4e7)"}`,
    background: on ? "var(--zinc-900, #18181b)" : "var(--surface, #fff)", color: on ? "var(--fg-inverse, #fff)" : "var(--fg2, #52525b)",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: pixSans, ...style }}>
      <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
        {canCopy && (
          <ActionButton label={labels.copy} tooltip={copyLabel} path={copyState === "copied" ? M_CHECK : copyState === "failed" ? M_ALERT : M_COPY}
            onClick={copy} disabled={disabled} placement={tooltipPlacement} />
        )}
        {onRegenerate && <ActionButton label={labels.regenerate} path={M_REDO} onClick={onRegenerate} disabled={disabled} placement={tooltipPlacement} />}
        {hasFeedback && (
          <React.Fragment>
            <ActionButton label={labels.helpful} path={M_UP} tone="up" pressed={vote === "up"} onClick={() => choose("up")} disabled={disabled} placement={tooltipPlacement} />
            <ActionButton label={labels.notHelpful} path={M_DOWN} tone="down" pressed={vote === "down"} onClick={() => choose("down")} disabled={disabled} placement={tooltipPlacement}
              buttonRef={downRef} expanded={onFeedbackReason ? pickerOpen : undefined} controls={onFeedbackReason && pickerOpen ? pickerId : undefined} />
          </React.Fragment>
        )}
        {onBranch && <ActionButton label={labels.branch} path={M_BRANCH} onClick={onBranch} disabled={disabled} placement={tooltipPlacement} />}
        {children}
        {thanked && !pickerOpen && <span style={{ marginLeft: 6, font: `400 11px ${pixSans}`, color: "var(--fg3, #71717a)" }}>{labels.thanks}</span>}
      </div>

      {pickerOpen && (
        <div ref={pickerRef} id={pickerId} role="group" aria-labelledby={titleId} className="pix-o-fade"
          onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); closePicker(true); } }}
          style={{ maxWidth: 380, padding: 12, border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, background: "var(--surface, #fff)",
            boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))", display: "flex", flexDirection: "column", gap: 10 }}>
          <div id={titleId} style={{ font: `600 12px ${pixSans}`, color: "var(--fg1, #18181b)" }}>{labels.reasonTitle}</div>
          {reasons.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {reasons.map((r) => (
                <button key={r} type="button" className="pix-ma-chip pix-o-focus" aria-pressed={reason === r} onClick={() => setReason(reason === r ? null : r)} style={chip(reason === r)}>{r}</button>
              ))}
            </div>
          )}
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} aria-label={labels.reasonPlaceholder} placeholder={labels.reasonPlaceholder}
            className="pix-o-focus pix-f-control"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitReason(); } }}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "7px 9px", borderRadius: 3, border: "1px solid var(--border, #e4e4e7)",
              background: "var(--surface, #fff)", color: "var(--fg1, #18181b)", font: `400 12px/1.5 ${pixSans}` }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <button type="button" className="pix-o-focus" onClick={() => closePicker(true)}
              style={{ padding: "5px 10px", borderRadius: 3, border: "1px solid var(--border, #e4e4e7)", background: "var(--surface, #fff)", color: "var(--fg2, #52525b)", font: `500 12px ${pixSans}`, cursor: "pointer" }}>
              {labels.cancel}
            </button>
            <button type="button" className="pix-o-focus" onClick={submitReason} disabled={!reason && !comment.trim()}
              style={{ padding: "5px 10px", borderRadius: 3, border: 0, font: `600 12px ${pixSans}`,
                background: reason || comment.trim() ? "var(--zinc-900, #18181b)" : "var(--zinc-200, #e4e4e7)",
                color: reason || comment.trim() ? "var(--fg-inverse, #fff)" : "var(--fg3, #71717a)", cursor: reason || comment.trim() ? "pointer" : "not-allowed" }}>
              {labels.submit}
            </button>
          </div>
        </div>
      )}
      <span aria-live="polite" style={srOnly}>{announcement}</span>
    </div>
  );
}

/**
 * A compact row of actions for one agent message: copy (with "Copied" feedback), regenerate, thumbs up and down
 * (thumbs down can open a reason picker), and branch. Each action renders only when you pass its handler.
 * With `loading`, renders a skeleton in its own footprint.
 */
export function MessageActions(props) {
  if (props.loading) {
    return (
      <Skeleton label="Loading message actions" style={{ display: "flex", gap: 6, ...props.style }}>
        <Skeleton width={28} height={28} /><Skeleton width={28} height={28} /><Skeleton width={28} height={28} /><Skeleton width={28} height={28} />
      </Skeleton>
    );
  }
  return <MessageActionsBase {...props} />;
}
