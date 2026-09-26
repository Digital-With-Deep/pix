import * as React from "react";
const menuFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const MENU_CHEVRON = "M9 5l7 7-7 7";

export function Menu({ trigger, items = [], align = "end", width = 200, open: openProp, onOpenChange, style }) {
  const h = React.createElement;
  const [openState, setOpenState] = React.useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = (v) => { if (openProp === undefined) setOpenState(v); if (onOpenChange) onOpenChange(v); };
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return h("div", { ref, style: { position: "relative", display: "inline-flex", ...style } },
    h("span", { onClick: () => setOpen(!open), style: { display: "inline-flex" } },
      React.isValidElement(trigger) ? React.cloneElement(trigger, { "aria-haspopup": "menu", "aria-expanded": open }) : trigger),
    open && h(MenuPanel, {
      items, width, close: () => setOpen(false),
      style: { position: "absolute", top: "calc(100% + 6px)", [align === "start" ? "left" : "right"]: 0, zIndex: 50 },
    })
  );
}

const menuPanelStyle = {
  background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4,
  boxShadow: "0 8px 24px rgba(24,24,27,0.10), 0 2px 6px rgba(24,24,27,0.06)",
  padding: 4, textAlign: "left",
};

function MenuPanel({ items = [], width = 200, close, style }) {
  const h = React.createElement;
  const [openIdx, setOpenIdx] = React.useState(null);
  return h("div", { role: "menu", style: { minWidth: width, ...menuPanelStyle, ...style } },
    items.map((it, i) => {
      if (it.separator) return h("div", { key: "s" + i, style: { height: 1, background: "var(--divider, #f4f4f5)", margin: "4px 0" } });
      if (it.heading) return h("div", { key: "h" + i, style: { font: "600 10px " + menuFont, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--fg3, #71717a)", padding: "6px 8px 4px" } }, it.heading);
      return h(MenuRow, {
        key: (it.label || "") + i, item: it, width, close,
        submenuOpen: openIdx === i,
        onHover: () => setOpenIdx(it.items && it.items.length ? i : null),
      });
    })
  );
}

function MenuRow({ item, width, close, submenuOpen, onHover }) {
  const h = React.createElement;
  const [hover, setHover] = React.useState(false);
  const danger = item.tone === "danger";
  const hasSub = !!(item.items && item.items.length);
  const active = hover || submenuOpen;
  const row = h("button", {
    type: "button", role: "menuitem", disabled: item.disabled,
    "aria-haspopup": hasSub ? "menu" : undefined, "aria-expanded": hasSub ? submenuOpen : undefined,
    onClick: () => { if (hasSub) return; close && close(); if (item.onSelect) item.onSelect(); },
    style: {
      display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 8px", border: 0, borderRadius: 3,
      background: active && !item.disabled ? (danger ? "var(--red-50, #fef2f2)" : "var(--zinc-100, #f4f4f5)") : "transparent",
      color: danger ? "var(--red-700, #b91c1c)" : "var(--fg1, #18181b)",
      font: "500 13px " + menuFont, textAlign: "left", cursor: item.disabled ? "not-allowed" : "pointer",
      opacity: item.disabled ? 0.45 : 1,
    },
  },
    item.iconPath && h("svg", { viewBox: "0 0 24 24", width: 15, height: 15, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, opacity: 0.75 } },
      h("path", { d: item.iconPath })),
    h("span", { style: { flex: 1, minWidth: 0 } }, item.label),
    item.shortcut && !hasSub && h("span", { style: { font: "500 11px var(--font-mono, ui-monospace, monospace)", color: "var(--fg3, #71717a)", flexShrink: 0 } }, item.shortcut),
    hasSub && h("svg", { viewBox: "0 0 24 24", width: 13, height: 13, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, color: "var(--fg-muted, #a1a1aa)" } },
      h("path", { d: MENU_CHEVRON }))
  );
  if (!hasSub) return h("div", { onMouseEnter: () => { setHover(true); onHover(); }, onMouseLeave: () => setHover(false) }, row);
  return h("div", {
    onMouseEnter: () => { setHover(true); onHover(); }, onMouseLeave: () => setHover(false),
    style: { position: "relative" },
  },
    row,
    submenuOpen && h(MenuPanel, {
      items: item.items, width, close,
      style: { position: "absolute", top: -4, left: "100%", marginLeft: 4, zIndex: 51 },
    })
  );
}
