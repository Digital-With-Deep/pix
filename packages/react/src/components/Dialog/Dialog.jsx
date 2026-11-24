import * as React from "react";
import { createPortal } from "react-dom";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { pixSans, ensureBasicsStyle, usePixId, useIsClient, useControllable, focusables, refocus, chain, CloseGlyph } from "../../internal/basics.jsx";

const DLG_WIDTH = { sm: 400, md: 560, lg: 760 };

/**
 * A modal dialog. Renders into `document.body` after mount (nothing on the server), traps focus, closes on Escape,
 * locks page scroll, and returns focus to whatever opened it.
 */
export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, trigger, title, description, label, children, footer, size = "md",
  role = "dialog", closeOnOverlayClick = true, hideCloseButton = false, closeLabel = "Close", initialFocusRef, loading = false, style }) {
  const client = useIsClient();
  const id = usePixId("pix-dlg-");
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const panel = React.useRef(null), anchor = React.useRef(null), downOnOverlay = React.useRef(false);
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  React.useEffect(() => {
    if (!open || !client || typeof document === "undefined") return;
    ensureBasicsStyle();
    const active = document.activeElement;
    const opener = active && active !== document.body ? active : anchor.current ? focusables(anchor.current)[0] : null;
    const body = document.body, prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const p = panel.current;
    const preferred = initialFocusRef && initialFocusRef.current;
    const inside = focusables(p).filter((el) => !el.hasAttribute("data-pix-dialog-close"));
    refocus(preferred || inside[0] || (p && p.querySelector("[data-pix-dialog-close]")) || p);

    // Pull focus back if it lands outside (a click on the page behind, a screen reader jump). Leave nested dialogs alone.
    const guard = (e) => {
      if (!p || p.contains(e.target)) return;
      const other = e.target && e.target.closest && e.target.closest("[data-pix-dialog]");
      if (other && other !== p) return;
      refocus(focusables(p)[0] || p);
    };
    document.addEventListener("focusin", guard);
    return () => {
      document.removeEventListener("focusin", guard);
      body.style.overflow = prevOverflow;
      refocus(opener);
    };
  }, [open, client]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.stopPropagation(); close(); return; }
    if (e.key !== "Tab") return;
    const list = focusables(panel.current);
    if (!list.length) { e.preventDefault(); refocus(panel.current); return; }
    const first = list[0], last = list[list.length - 1], at = document.activeElement;
    if (e.shiftKey && (at === first || at === panel.current)) { e.preventDefault(); refocus(last); }
    else if (!e.shiftKey && at === last) { e.preventDefault(); refocus(first); }
  };

  const triggerNode = React.isValidElement(trigger)
    ? <span ref={anchor} style={{ display: "inline-flex" }}>{React.cloneElement(trigger, { "aria-haspopup": "dialog", onClick: chain(trigger.props.onClick, () => setOpen(true)) })}</span>
    : trigger || null;

  const titleId = id + "-title", descId = id + "-desc";
  const overlay = (
    <div className="pix-o-fade" onMouseDown={(e) => { downOnOverlay.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (closeOnOverlayClick && downOnOverlay.current && e.target === e.currentTarget) close(); downOnOverlay.current = false; }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box",
        background: "var(--pix-overlay, rgba(12, 10, 9, 0.55))" }}>
      <div ref={panel} data-pix-dialog="" role={role} aria-modal="true" tabIndex={-1} onKeyDown={onKeyDown}
        aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : label} aria-describedby={description ? descId : undefined}
        className="pix-o-rise"
        style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", maxWidth: DLG_WIDTH[size] || DLG_WIDTH.md, maxHeight: "calc(100vh - 32px)", boxSizing: "border-box",
          background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 6, outline: "none",
          boxShadow: "var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,.10))", fontFamily: pixSans, color: "var(--fg1, #1c1917)", ...style }}>
        {(title || description || !hideCloseButton) && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "18px 20px 0" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && <h2 id={titleId} style={{ margin: 0, font: `600 16px/1.35 ${pixSans}`, color: "var(--fg1, #1c1917)" }}>{title}</h2>}
              {description && <p id={descId} style={{ margin: title ? "4px 0 0" : 0, font: `400 13px/1.5 ${pixSans}`, color: "var(--fg2, #57534e)" }}>{description}</p>}
            </div>
            {!hideCloseButton && (
              <button type="button" data-pix-dialog-close="" aria-label={closeLabel} onClick={close} className="pix-o-focus"
                style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, margin: "-4px -6px 0 0", padding: 0,
                  border: 0, borderRadius: 3, background: "transparent", color: "var(--fg2, #57534e)", cursor: "pointer" }}>
                <CloseGlyph size={16} />
              </button>
            )}
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 20px 18px", font: `400 14px/1.55 ${pixSans}` }}>
          {loading ? <Skeleton variant="text" lines={3} label="Loading content" /> : children}
        </div>
        {footer && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: 8, padding: "12px 20px", borderTop: "1px solid var(--border, #e7e5e4)",
            background: "var(--bg-subtle, #fafaf9)", borderRadius: "0 0 6px 6px" }}>{footer}</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {triggerNode}
      {client && open && typeof document !== "undefined" ? createPortal(overlay, document.body) : null}
    </>
  );
}
