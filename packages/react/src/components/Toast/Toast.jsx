import * as React from "react";
import { createPortal } from "react-dom";
import { pixSans, ensureBasicsStyle, useIsClient, CloseGlyph } from "../../internal/basics.jsx";

const TOAST_TONES = {
  info: { ink: "var(--blue-700, #1d4ed8)", glyph: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></> },
  truth: { ink: "var(--truth, #047857)", glyph: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></> },
  claim: { ink: "var(--claim, #b91c1c)", glyph: <><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17.5h.01" /></> },
  warn: { ink: "var(--fault, #b45309)", glyph: <><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17.5h.01" /></> },
};
const toastBtn = { display: "inline-flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", cursor: "pointer", fontFamily: pixSans };

/**
 * One notification card. Use it through `ToastProvider` and `useToast()`, which queue, time and announce toasts;
 * render it directly only for a static preview.
 */
export function Toast({ tone = "info", title, description, children, action, onDismiss, dismissLabel = "Dismiss notification", style, ...rest }) {
  React.useEffect(ensureBasicsStyle, []);
  const t = TOAST_TONES[tone] || TOAST_TONES.info;
  const body = children != null ? children : description;
  return (
    <div {...rest} style={{ display: "flex", alignItems: "flex-start", gap: 10, boxSizing: "border-box", width: "100%", padding: "11px 10px 11px 12px",
      background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderLeft: `3px solid ${t.ink}`, borderRadius: 4,
      boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,.08))", fontFamily: pixSans, color: "var(--fg1, #1c1917)", textAlign: "left", ...style }}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={t.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ flexShrink: 0, marginTop: 1 }}>{t.glyph}</svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ font: `600 13px/1.4 ${pixSans}`, color: "var(--fg1, #1c1917)" }}>{title}</div>}
        {body && <div style={{ marginTop: title ? 2 : 0, font: `400 13px/1.5 ${pixSans}`, color: title ? "var(--fg2, #57534e)" : "var(--fg1, #1c1917)" }}>{body}</div>}
        {action && action.label && (
          <button type="button" className="pix-o-focus" onClick={(e) => { if (action.onClick) action.onClick(e); if (onDismiss) onDismiss(); }}
            style={{ ...toastBtn, marginTop: 8, padding: "4px 10px", borderRadius: 3, border: "1px solid var(--border-strong, #d6d3d1)", background: "var(--surface, #fff)",
              font: `600 12px/1.3 ${pixSans}`, color: "var(--fg1, #1c1917)" }}>{action.label}</button>
        )}
      </div>
      {onDismiss && (
        <button type="button" className="pix-o-focus" aria-label={dismissLabel} onClick={onDismiss}
          style={{ ...toastBtn, flexShrink: 0, width: 24, height: 24, margin: "-2px 0 0", padding: 0, borderRadius: 3, color: "var(--fg2, #57534e)" }}>
          <CloseGlyph size={14} />
        </button>
      )}
    </div>
  );
}

const ToastContext = React.createContext(null);
let toastSeq = 0;
let warnedNoProvider = false;

function ToastItem({ toast, duration, paused, remove }) {
  const ms = toast.duration != null ? toast.duration : toast.action ? 0 : duration;
  const left = React.useRef(ms), started = React.useRef(0);
  const dismiss = React.useRef(null);
  dismiss.current = () => { if (toast.onDismiss) toast.onDismiss(); remove(toast.id); };
  // A toast replaced in place (same id) starts a fresh timer.
  React.useEffect(() => { left.current = ms; }, [toast, ms]);
  React.useEffect(() => {
    if (!(ms > 0) || !isFinite(ms) || paused) return;
    started.current = Date.now();
    const timer = setTimeout(() => dismiss.current(), Math.max(0, left.current));
    return () => { clearTimeout(timer); left.current -= Date.now() - started.current; };
  }, [paused, ms, toast]);
  return (
    <li className="pix-o-rise" style={{ listStyle: "none", pointerEvents: "auto" }}>
      <Toast tone={toast.tone} title={toast.title} description={toast.description} action={toast.action} dismissLabel={toast.dismissLabel}
        onDismiss={() => dismiss.current()} />
    </li>
  );
}

const TOAST_PLACE = {
  "bottom-right": { bottom: 0, right: 0, alignItems: "flex-end" },
  "bottom-left": { bottom: 0, left: 0, alignItems: "flex-start" },
  "top-right": { top: 0, right: 0, alignItems: "flex-end" },
  "top-left": { top: 0, left: 0, alignItems: "flex-start" },
  bottom: { bottom: 0, left: "50%", transform: "translateX(-50%)", alignItems: "center" },
  top: { top: 0, left: "50%", transform: "translateX(-50%)", alignItems: "center" },
};

/**
 * Holds the toast queue and renders it into a polite live region (portal to `document.body`, client only).
 * At most `max` toasts show at once; the rest wait their turn. Timers pause while the pointer or focus is on any toast.
 */
export function ToastProvider({ children, placement = "bottom-right", max = 3, duration = 5000, label = "Notifications", style }) {
  const client = useIsClient();
  const [toasts, setToasts] = React.useState([]);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const api = React.useMemo(() => ({
    toast(input) {
      const opts = typeof input === "string" ? { title: input } : input || {};
      const id = opts.id != null ? String(opts.id) : "pix-toast-" + ++toastSeq;
      setToasts((list) => {
        const at = list.findIndex((t) => t.id === id);
        if (at === -1) return [...list, { ...opts, id }];
        const next = list.slice(); next[at] = { ...opts, id }; return next;
      });
      return id;
    },
    dismiss(id) { setToasts((list) => (id == null ? [] : list.filter((t) => t.id !== id))); },
  }), []);
  const remove = api.dismiss;
  const shown = toasts.slice(0, Math.max(1, max));
  const paused = hovered || focused;

  const region = (
    <div role="region" aria-label={label}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
      style={{ position: "fixed", zIndex: 1100, display: "flex", flexDirection: "column", padding: 16, boxSizing: "border-box", width: "min(392px, 100vw)", pointerEvents: "none",
        ...(TOAST_PLACE[placement] || TOAST_PLACE["bottom-right"]), ...style }}>
      <ol aria-live="polite" aria-relevant="additions text" style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", margin: 0, padding: 0 }}>
        {shown.map((t) => <ToastItem key={t.id} toast={t} duration={duration} paused={paused} remove={remove} />)}
      </ol>
    </div>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {client && typeof document !== "undefined" ? createPortal(region, document.body) : null}
    </ToastContext.Provider>
  );
}

/** `toast(options | title)` queues a toast and returns its id; `dismiss(id?)` removes one, or all with no id. Call inside a `ToastProvider`. */
export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (ctx) return ctx;
  if (!warnedNoProvider && typeof console !== "undefined") { warnedNoProvider = true; console.warn("PIX: useToast() was called outside a <ToastProvider>; toasts will not show."); }
  return NO_PROVIDER;
}
const NO_PROVIDER = { toast: () => "", dismiss: () => {} };
