import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";

const sbSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const CHEVRON = "M9 6l6 6-6 6";

function keyOf(item, fallback) {
  return item.key != null ? item.key : (typeof item.label === "string" ? item.label : fallback);
}

function subId(k) {
  return "sb-sub-" + String(k).replace(/[^\w-]+/g, "-");
}

function Icon({ path, size = 18, color, style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color, ...style }}>
      <path d={path} />
    </svg>
  );
}

function Row({ item, depth, active, open, hasChildren, controls, onActivate }) {
  const [hover, setHover] = React.useState(false);
  const disabled = !!item.disabled;
  // Leaves align under the top-level icon; deeper levels indent further.
  const pl = depth === 0 ? 10 : 38 + (depth - 1) * 16;
  const bg = active ? "var(--bg-muted, #f4f4f5)" : hover && !disabled ? "var(--bg-subtle, #fafafa)" : "transparent";
  const fg = active ? "var(--fg1, #18181b)" : "var(--fg2, #52525b)";
  const common = {
    display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box",
    padding: "7px 8px 7px " + pl + "px", border: 0, borderRadius: 7, textAlign: "left",
    background: bg, color: fg, font: (active ? 600 : 500) + " 13px " + sbSans,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
    transition: "background 120ms, color 120ms", textDecoration: "none",
  };
  const inner = (
    <>
      {depth === 0 && item.iconPath && <Icon path={item.iconPath} color={active ? "var(--fg1, #18181b)" : "var(--fg3, #71717a)"} />}
      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
      {item.badge != null && (
        <span style={{ font: "600 11px var(--font-mono, ui-monospace, monospace)", padding: "1px 6px", borderRadius: 999, background: active ? "var(--accent-bg, #f4f4f5)" : "var(--bg-muted, #f4f4f5)", color: active ? "var(--accent-fg, #18181b)" : "var(--fg3, #71717a)", flexShrink: 0 }}>{item.badge}</span>
      )}
      {hasChildren && <Icon path={CHEVRON} size={14} color="var(--fg-muted, #a1a1aa)" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 200ms ease" }} />}
    </>
  );
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: disabled ? undefined : onActivate,
  };
  if (item.href && !hasChildren) {
    return <a href={disabled ? undefined : item.href} aria-current={active ? "page" : undefined} aria-disabled={disabled || undefined} style={common} {...handlers}>{inner}</a>;
  }
  return (
    <button type="button" disabled={disabled} aria-expanded={hasChildren ? open : undefined} aria-controls={hasChildren ? controls : undefined} aria-current={active && !hasChildren ? "page" : undefined} style={common} {...handlers}>
      {inner}
    </button>
  );
}

function SidebarBase({ items = [], header, footer, activeKey, defaultActiveKey, onNavigate, width = 248, style }) {
  const [openMap, setOpenMap] = React.useState(() => {
    const m = {};
    const walk = (list, prefix) => list.forEach((it, i) => {
      const k = keyOf(it, prefix + i);
      if (it.items && it.items.length) { m[k] = it.defaultOpen != null ? it.defaultOpen : false; walk(it.items, k + "."); }
    });
    walk(items, "");
    return m;
  });
  const [ownActive, setOwnActive] = React.useState(defaultActiveKey);
  const active = activeKey !== undefined ? activeKey : ownActive;

  const toggle = (k) => setOpenMap((m) => ({ ...m, [k]: !m[k] }));
  const select = (k, it) => { if (activeKey === undefined) setOwnActive(k); if (it.onSelect) it.onSelect(); if (onNavigate) onNavigate(k, it); };

  const renderList = (list, depth, prefix) => (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 1 }}>
      {list.map((it, i) => {
        const k = keyOf(it, prefix + i);
        if (it.heading) {
          return <li key={k} style={{ padding: depth === 0 ? "12px 10px 4px" : "8px 10px 2px", font: "600 10px " + sbSans, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #71717a)" }}>{it.label}</li>;
        }
        const hasChildren = !!(it.items && it.items.length);
        const open = !!openMap[k];
        const id = hasChildren ? subId(k) : undefined;
        return (
          <li key={k}>
            <Row item={it} depth={depth} active={active === k} open={open} hasChildren={hasChildren} controls={id}
              onActivate={() => { if (hasChildren) toggle(k); else select(k, it); }} />
            {hasChildren && (
              // grid-template-rows 0fr -> 1fr animates the submenu's auto height
              // smoothly; the global reduced-motion rule in @pix-ui/css zeroes it.
              <div id={id} style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 240ms ease" }}>
                <div style={{ overflow: "hidden", minHeight: 0 }}>
                  <div style={{ paddingTop: 2 }}>{renderList(it.items, depth + 1, k + ".")}</div>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav aria-label="Sidebar" style={{ display: "flex", flexDirection: "column", width, boxSizing: "border-box", height: "100%", background: "var(--surface, #fff)", borderRight: "1px solid var(--border, #e4e4e7)", fontFamily: sbSans, ...style }}>
      {header != null && <div style={{ flexShrink: 0 }}>{header}</div>}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 8 }}>{renderList(items, 0, "")}</div>
      {footer != null && <div style={{ flexShrink: 0, borderTop: "1px solid var(--divider, #f4f4f5)", padding: 8 }}>{footer}</div>}
    </nav>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function Sidebar(props) {
  if (props.loading) {
    return (
      <div style={{ width: props.width || 248, boxSizing: "border-box", height: "100%", background: "var(--surface, #fff)", borderRight: "1px solid var(--border, #e4e4e7)", padding: 12, ...props.style }}>
        <Skeleton.List rows={8} glyph twoLine={false} />
      </div>
    );
  }
  return <SidebarBase {...props} />;
}
