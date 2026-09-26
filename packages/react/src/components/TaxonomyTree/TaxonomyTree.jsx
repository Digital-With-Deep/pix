import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const ttFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const ttMono = "var(--font-mono, ui-monospace, monospace)";

function TaxonomyTreeBase({ nodes = [], caption, hint, style }) {
  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: ttFont, ...style }}>
      {(caption || hint) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
          {caption && <span style={{ font: `600 10px ${ttFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #71717a)" }}>{caption}</span>}
          {hint && <span style={{ marginLeft: "auto", fontFamily: ttMono, fontSize: 11, color: "var(--fg-muted, #a1a1aa)" }}>{hint}</span>}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        {nodes.map((n, i) => (
          <div key={n.label + i} style={{ display: "flex", flexWrap: "nowrap", alignItems: "baseline", gap: 8, minWidth: 520, padding: "9px 14px", borderTop: i === 0 ? "none" : "1px solid var(--divider, #f4f4f5)", paddingLeft: 14 + (n.depth || 0) * 22 }}>
            {(n.depth || 0) > 0 && <span style={{ fontFamily: ttMono, fontSize: 12, color: "var(--zinc-300, #d4d4d8)" }}>&#9492;</span>}
            <span style={{ fontFamily: ttMono, fontSize: 13, color: "var(--fg1, #18181b)", whiteSpace: "nowrap" }}>{n.label}</span>
            {n.code && <span style={{ fontFamily: ttMono, fontSize: 11, color: "var(--fg-muted, #a1a1aa)", whiteSpace: "nowrap" }}>{n.code}</span>}
            {n.ext && <span style={{ fontFamily: ttMono, fontSize: 11, color: "var(--violet-600, #7c3aed)", whiteSpace: "nowrap" }}>{n.ext}</span>}
            {n.objective && <span style={{ marginLeft: "auto", fontFamily: ttMono, fontSize: 11, color: "var(--fg3, #71717a)", whiteSpace: "nowrap" }}>{n.objective}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function TaxonomyTree(props) {
  if (props.loading) return <Skeleton.List rows={6} glyph={false} twoLine={false} style={props.style} />;
  return <TaxonomyTreeBase {...props} />;
}
