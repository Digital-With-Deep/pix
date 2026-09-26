import * as React from "react";
const skSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const SK_CSS = `@keyframes ds-sk-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.ds-sk{position:relative;overflow:hidden;border-radius:3px;background:var(--zinc-100,#f4f4f5)}
.ds-sk::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 0,var(--surface,#fff) 45%,transparent 90%);opacity:.55;background-size:400px 100%;animation:ds-sk-shimmer 1.4s linear infinite}
[data-theme="dark"] .ds-sk::after,.dark .ds-sk::after{opacity:.18}
@media (prefers-reduced-motion:reduce){.ds-sk::after{animation:none}}`;
let skStyled = false;
function skEnsureStyle() {
  if (skStyled || typeof document === "undefined") return;
  if (!document.getElementById("ds-skeleton-css")) { const s = document.createElement("style"); s.id = "ds-skeleton-css"; s.textContent = SK_CSS; document.head.appendChild(s); }
  skStyled = true;
}

/** One placeholder shape. Compose these, or use the presets below, which match the components' real footprints. */
export function Skeleton({ variant = "block", width, height, lines = 1, gap = 8, label = "Loading", style, children }) {
  React.useEffect(skEnsureStyle, []);
  if (children) return <div role="status" aria-busy="true" aria-label={label} style={style}>{children}</div>;
  const h = height != null ? height : variant === "text" ? 12 : variant === "circle" ? 32 : 16;
  const w = width != null ? width : variant === "circle" ? h : "100%";
  if (variant === "text" && lines > 1) {
    return <div role="status" aria-busy="true" aria-label={label} style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {Array.from({ length: lines }, (_, i) => <span key={i} className="ds-sk" style={{ display: "block", height: h, width: i === lines - 1 ? "62%" : w }} />)}</div>;
  }
  return <span role="status" aria-busy="true" aria-label={label} className="ds-sk" style={{ display: "block", width: w, height: h, borderRadius: variant === "circle" ? 999 : 3, ...style }} />;
}
const bar = (w, h = 12, extra) => <span className="ds-sk" style={{ display: "block", width: w, height: h, ...extra }} />;
const box = (style) => ({ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", ...style });
const wrap = (label, node, style) => { skEnsureStyle(); return <div role="status" aria-busy="true" aria-label={label} style={{ fontFamily: skSans, ...style }}>{node}</div>; };

/** A data table: toolbar, header row, `rows` body rows with staggered widths. */
Skeleton.Table = function SkeletonTable({ columns = 5, rows = 5, caption = true, style }) {
  const widths = [64, 42, 55, 36, 48, 60, 40];
  return wrap("Loading table", <div style={box(style)}>
    {caption && <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>{bar(110, 12)}{bar(160, 12, { marginLeft: 8 })}<span style={{ flex: 1 }} />{bar(48, 10)}</div>}
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14, padding: "9px 14px", background: "var(--zinc-50, #fafafa)" }}>{Array.from({ length: columns }, (_, i) => bar(`${40 + (i * 13) % 35}%`, 9))}</div>
    {Array.from({ length: rows }, (_, r) => <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14, padding: "12px 14px", borderTop: "1px solid var(--divider, #f4f4f5)" }}>
      {Array.from({ length: columns }, (_, c) => bar(`${widths[(r + c) % widths.length]}%`, 12))}</div>)}
  </div>);
};
/** A metric card. */
Skeleton.Metric = function SkeletonMetric({ style }) {
  return wrap("Loading metric", <div style={box({ padding: 20, ...style })}>{bar(90, 9)}{bar(120, 28, { marginTop: 12 })}{bar(150, 10, { marginTop: 10 })}</div>);
};
/** A form: `fields` label + input pairs, optionally in two columns, with a footer button. */
Skeleton.Form = function SkeletonForm({ fields = 4, columns = 1, footer = true, style }) {
  return wrap("Loading form", <div style={box(style)}>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "14px 12px", padding: 18 }}>
      {Array.from({ length: fields }, (_, i) => <div key={i}>{bar(70 + (i * 23) % 50, 9)}{bar("100%", 34, { marginTop: 7 })}</div>)}</div>
    {footer && <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--border, #e4e4e7)" }}>{bar(110, 30)}</div>}
  </div>);
};
/** A list of rows with a leading glyph, one or two text lines, and a trailing tag. */
Skeleton.List = function SkeletonList({ rows = 4, glyph = true, twoLine = true, style }) {
  return wrap("Loading list", <div style={box(style)}>
    {Array.from({ length: rows }, (_, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i ? "1px solid var(--divider, #f4f4f5)" : "none" }}>
      {glyph && bar(18, 18, { borderRadius: 999, flexShrink: 0 })}
      <span style={{ flex: 1 }}>{bar(`${45 + (i * 17) % 40}%`, 12)}{twoLine && bar(`${30 + (i * 11) % 30}%`, 9, { marginTop: 6 })}</span>{bar(56, 18)}</div>)}
  </div>);
};
/** A field: label and input, for Select and inputs. */
Skeleton.Field = function SkeletonField({ label = true, style }) {
  return wrap("Loading field", <div style={style}>{label && bar(90, 9, { marginBottom: 7 })}{bar("100%", 38)}</div>);
};
/** A bar chart: legend, bars of varied heights, axis labels. */
Skeleton.Chart = function SkeletonChart({ bars = 12, height = 130, style }) {
  return wrap("Loading chart", <div style={box({ padding: "14px 16px", ...style })}>
    <div style={{ display: "flex", gap: 14 }}>{bar(70, 10)}{bar(70, 10)}</div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, marginTop: 14, borderBottom: "1px solid var(--border, #e4e4e7)" }}>
      {Array.from({ length: bars }, (_, i) => bar("100%", `${35 + ((i * 37) % 55)}%`, { flex: 1, borderRadius: "2px 2px 0 0" }))}</div>
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>{Array.from({ length: bars }, (_, i) => bar("100%", 8, { flex: 1 }))}</div>
  </div>);
};
/** A card with an uppercase header and `lines` of text. */
Skeleton.Panel = function SkeletonPanel({ lines = 4, style }) {
  return wrap("Loading panel", <div style={box(style)}>
    <div style={{ padding: "11px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>{bar(140, 9)}</div>
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: lines }, (_, i) => bar(`${88 - (i * 19) % 40}%`, 12))}</div>
  </div>);
};
/** A whole console page: breadcrumb, title, lede, metric row, table. */
Skeleton.Page = function SkeletonPage({ metrics = 4, table = true, form = false, style }) {
  return wrap("Loading page", <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 28px 40px", ...style }}>
    {bar(140, 10)}{bar(260, 26, { marginTop: 14 })}{bar("60%", 12, { marginTop: 12 })}{bar("48%", 12, { marginTop: 6 })}
    {metrics > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: 16, marginTop: 24 }}>{Array.from({ length: metrics }, (_, i) => <Skeleton.Metric key={i} />)}</div>}
    {form && <div style={{ marginTop: 20 }}><Skeleton.Form fields={4} columns={2} /></div>}
    {table && <div style={{ marginTop: 20 }}><Skeleton.Table /></div>}
  </div>);
};
