import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { pixSans, ensureBasicsStyle, usePixId, useControllable, focusables, refocus, chain } from "../../internal/basics.jsx";

const PO_ALIGN = { start: { left: 0 }, end: { right: 0 }, center: { left: "50%", transform: "translateX(-50%)" } };

/**
 * A non-modal panel anchored to its trigger. The child element toggles it; focus moves into the panel on open,
 * Escape closes it and returns focus to the trigger, and a click outside or tabbing away closes it.
 */
export function Popover({ children, content, title, label, placement = "bottom", align = "start", open: openProp, defaultOpen = false, onOpenChange,
  width = 280, initialFocus = true, loading = false, style }) {
  React.useEffect(ensureBasicsStyle, []);
  const id = usePixId("pix-po-");
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const host = React.useRef(null), anchor = React.useRef(null), panel = React.useRef(null);
  const triggerEl = () => (anchor.current ? focusables(anchor.current)[0] || anchor.current.firstElementChild : null);
  const close = React.useCallback((restore) => { setOpen(false); if (restore) refocus(triggerEl()); }, [setOpen]);

  // Move focus in on open.
  React.useEffect(() => {
    if (!open || !panel.current || !initialFocus) return;
    const first = focusables(panel.current)[0];
    refocus(first || panel.current);
  }, [open]);

  // Click outside and Escape from anywhere close it.
  React.useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const away = (e) => { if (host.current && !host.current.contains(e.target)) close(false); };
    const onKey = (e) => { if (e.key === "Escape" && !(host.current && host.current.contains(e.target))) close(true); };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("touchstart", away); document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  const trigger = React.isValidElement(children)
    ? React.cloneElement(children, {
        "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? id : undefined,
        onClick: chain(children.props.onClick, () => setOpen(!open)),
      })
    : children;

  const titleId = id + "-title";
  return (
    <div ref={host} style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}
      onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); close(true); } }}
      onBlur={(e) => { if (open && e.relatedTarget && host.current && !host.current.contains(e.relatedTarget)) close(false); }}>
      <span ref={anchor} style={{ display: "inline-flex" }}>{trigger}</span>
      {open && (
        <div ref={panel} id={id} role="dialog" tabIndex={-1} aria-label={title ? undefined : label} aria-labelledby={title ? titleId : undefined} className="pix-o-fade"
          style={{ position: "absolute", zIndex: 50, ...(placement === "top" ? { bottom: "100%", marginBottom: 6 } : { top: "100%", marginTop: 6 }), ...(PO_ALIGN[align] || PO_ALIGN.start),
            width, maxWidth: "calc(100vw - 32px)", boxSizing: "border-box", padding: "12px 14px", outline: "none",
            background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 4,
            boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,.08))", font: `400 13px/1.5 ${pixSans}`, color: "var(--fg1, #1c1917)", textAlign: "left", ...style }}>
          {title && <div id={titleId} style={{ marginBottom: 6, font: `600 13px/1.4 ${pixSans}`, color: "var(--fg1, #1c1917)" }}>{title}</div>}
          {loading ? <Skeleton variant="text" lines={3} label="Loading content" /> : content}
        </div>
      )}
    </div>
  );
}
