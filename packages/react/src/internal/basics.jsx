// Internal helpers shared by the basics pack (Dialog, Popover, Tooltip, Toast, TextField, Textarea, Checkbox).
// Not exported from the package index.
import * as React from "react";

export const pixSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
export const pixMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
/** Accent ink for focus rings: 5.5:1 on light surfaces, 9:1 on dark. */
export const focusOutline = "2px solid var(--accent-fg, #047857)";
export const srOnly = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 };

const BASICS_CSS = `@keyframes pix-fade-in{from{opacity:0}to{opacity:1}}
@keyframes pix-rise-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.pix-o-fade{animation:pix-fade-in 140ms var(--ease,cubic-bezier(.4,0,.2,1))}
.pix-o-rise{animation:pix-rise-in 180ms var(--ease,cubic-bezier(.4,0,.2,1))}
.pix-o-focus:focus-visible{outline:2px solid var(--accent-fg,#047857);outline-offset:2px}
.pix-o-focus:focus:not(:focus-visible){outline:none}
.pix-f-control::placeholder{color:var(--fg3,#78716c);opacity:1}
@media (prefers-reduced-motion:reduce){.pix-o-fade,.pix-o-rise{animation:none}}`;

/** Inject the shared keyframes and focus-visible rules once. No-op on the server. */
export function ensureBasicsStyle() {
  if (typeof document === "undefined" || document.getElementById("pix-basics-css")) return;
  const s = document.createElement("style");
  s.id = "pix-basics-css";
  s.textContent = BASICS_CSS;
  document.head.appendChild(s);
}

/** Inject a component's own stylesheet once, keyed by `id`. For rules inline styles cannot express (pseudo-elements). No-op on the server. */
export function ensureStyle(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = css;
  document.head.appendChild(s);
}

/** A DOM-safe id from React.useId (strips the colons). */
export function usePixId(prefix, given) {
  const raw = React.useId();
  return given || prefix + raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

/** False during server render and the first client render; true after mount. Gate portals on it. */
export function useIsClient() {
  const [client, setClient] = React.useState(false);
  React.useEffect(() => setClient(true), []);
  return client;
}

/** Controlled-or-uncontrolled state: `value` wins when defined. */
export function useControllable(value, defaultValue, onChange) {
  const [inner, setInner] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const set = React.useCallback((next, ...extra) => {
    if (!controlled) setInner(next);
    if (onChange) onChange(next, ...extra);
  }, [controlled, onChange]);
  return [current, set];
}

const FOCUSABLE = 'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),iframe,summary,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
/** Visible, tabbable descendants of `root`, in DOM order. */
export function focusables(root) {
  if (!root || !root.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => !el.closest("[hidden]") && el.getAttribute("aria-hidden") !== "true" && el.getClientRects().length > 0);
}

/** Focus `el` if it is still in the document. */
export function refocus(el) {
  if (el && typeof el.focus === "function" && typeof document !== "undefined" && document.contains(el)) {
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
}

/** Merge a handler into a child element's existing one; the child's runs first and can preventDefault. */
export function chain(theirs, ours) {
  return (e) => { if (theirs) theirs(e); if (!e || !e.defaultPrevented) ours(e); };
}

export const CloseGlyph = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
