import * as React from "react";
const faSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

function faScrollRoot(el) {
  for (let n = el && el.parentElement; n; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY;
    if ((o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight) return n;
  }
  return null; // the window scrolls
}

/**
 * The action row of a form, always reachable: it sits at the form's natural end, and while that end is out of view it is
 * pinned to the bottom of the viewport (end is below) or the top (the reader scrolled past it), whichever side it is on.
 */
export function FormActions({ children, summary, status, position = "auto", tone = "neutral", style }) {
  const anchor = React.useRef(null);
  const [pin, setPin] = React.useState(null); // null | "top" | "bottom"
  const [box, setBox] = React.useState({ left: 0, width: 0, top: 0, bottom: 0 });

  React.useEffect(() => {
    if (position !== "auto" || !anchor.current || typeof IntersectionObserver === "undefined") { setPin(position === "auto" ? null : position === "static" ? null : position); return; }
    const el = anchor.current, root = faScrollRoot(el);
    const measure = () => { const r = root ? root.getBoundingClientRect() : { left: 0, width: window.innerWidth, top: 0, bottom: window.innerHeight }; setBox({ left: r.left, width: r.width, top: r.top, bottom: r.bottom }); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setPin(null); return; }
      const rb = e.rootBounds || { top: 0, bottom: window.innerHeight };
      setPin(e.boundingClientRect.top >= rb.bottom - 1 ? "bottom" : "top"); measure();
    }, { root, threshold: 0 });
    io.observe(el); measure();
    window.addEventListener("resize", measure);
    return () => { io.disconnect(); window.removeEventListener("resize", measure); };
  }, [position]);

  const bar = (pinned) => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "12px 18px", fontFamily: faSans,
      background: "var(--surface, #fff)", borderTop: pinned === "bottom" || !pinned ? "1px solid var(--border, #e4e4e7)" : "none", borderBottom: pinned === "top" ? "1px solid var(--border, #e4e4e7)" : "none",
      boxShadow: pinned ? (pinned === "top" ? "0 6px 16px -8px rgba(0,0,0,.18)" : "0 -6px 16px -8px rgba(0,0,0,.18)") : "none" }}>
      {(summary || status) && <span style={{ minWidth: 0, font: `400 12px/1.4 ${faSans}`, color: tone === "claim" ? "var(--claim, #b91c1c)" : tone === "truth" ? "var(--truth, #047857)" : "var(--fg3, #71717a)" }} role={tone === "claim" ? "alert" : "status"}>{summary || status}</span>}
      <span style={{ flex: 1 }} />
      {children}
    </div>
  );
  return (
    <>
      <div ref={anchor} style={{ visibility: pin ? "hidden" : "visible", ...style }}>{bar(null)}</div>
      {pin && <div style={{ position: "fixed", zIndex: 25, left: box.left, width: box.width, [pin]: pin === "top" ? box.top : Math.max(0, window.innerHeight - box.bottom) }}>{bar(pin)}</div>}
    </>
  );
}
