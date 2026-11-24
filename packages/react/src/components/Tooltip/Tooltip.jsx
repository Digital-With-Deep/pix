import * as React from "react";
import { pixSans, ensureBasicsStyle, usePixId, useControllable } from "../../internal/basics.jsx";

const TT_PLACE = {
  top: { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 6 },
  bottom: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 6 },
  left: { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: 6 },
  right: { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 6 },
};

/**
 * A short text label for a control, shown on hover after `delay` and immediately on keyboard focus.
 * The trigger gets `aria-describedby` pointing at the `role="tooltip"` element, which stays in the DOM (hidden) so screen readers
 * read it on focus. Escape dismisses it; hovering the tooltip itself keeps it open.
 */
export function Tooltip({ content, children, placement = "top", delay = 400, closeDelay = 100, open: openProp, defaultOpen = false, onOpenChange, disabled = false, maxWidth = 240, style }) {
  React.useEffect(ensureBasicsStyle, []);
  const id = usePixId("pix-tt-");
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const timer = React.useRef(null);
  const empty = content == null || content === "" || content === false;
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const schedule = (next, ms) => {
    clearTimeout(timer.current);
    if (next && (disabled || empty)) return;
    if (ms <= 0) { if (next !== open) setOpen(next); return; }
    timer.current = setTimeout(() => setOpen(next), ms);
  };

  React.useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const onKey = (e) => { if (e.key === "Escape") { clearTimeout(timer.current); setOpen(false); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const describedBy = React.isValidElement(children) ? [children.props["aria-describedby"], empty ? null : id].filter(Boolean).join(" ") || undefined : undefined;
  const trigger = React.isValidElement(children) ? React.cloneElement(children, { "aria-describedby": describedBy }) : children;
  const shown = open && !disabled && !empty;

  return (
    <span style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}
      onMouseEnter={() => schedule(true, delay)} onMouseLeave={() => schedule(false, closeDelay)}
      onFocus={(e) => { let kb = true; try { kb = e.target.matches(":focus-visible"); } catch (x) { /* older engines */ } if (kb) schedule(true, 0); }}
      onBlur={() => schedule(false, 0)}
      onKeyDown={(e) => { if (e.key === "Escape" && shown) { e.stopPropagation(); schedule(false, 0); } }}>
      {trigger}
      {!empty && (
        <span role="tooltip" id={id} className={shown ? "pix-o-fade" : undefined}
          style={{ position: "absolute", zIndex: 60, ...(TT_PLACE[placement] || TT_PLACE.top), display: shown ? "block" : "none",
            width: "max-content", maxWidth, boxSizing: "border-box", padding: "5px 8px", borderRadius: 3,
            background: "var(--zinc-900, #1c1917)", color: "var(--fg-inverse, #fff)", font: `500 12px/1.4 ${pixSans}`, textAlign: "left", whiteSpace: "normal",
            boxShadow: "var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,.08))", ...style }}>
          {content}
        </span>
      )}
    </span>
  );
}
