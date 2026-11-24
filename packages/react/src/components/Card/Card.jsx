import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { pixSans, usePixId } from "../../internal/basics.jsx";

const CARD_PAD = { none: 0, sm: 12, md: 16, lg: 20 };

function CardBase({ title, description, action, children, footer, headingLevel = 3, padding = "md", style, ...rest }) {
  const id = usePixId("pix-card-");
  const pad = CARD_PAD[padding] != null ? CARD_PAD[padding] : CARD_PAD.md;
  const edge = pad || 16; // header and footer keep a gutter even when the body is flush
  const hasHeader = title != null || description != null || action != null;
  const level = Math.min(6, Math.max(2, headingLevel | 0 || 3));
  return (
    <div {...rest} role={rest.role || (title != null ? "group" : undefined)} aria-labelledby={rest["aria-labelledby"] || (title != null && !rest["aria-label"] ? id + "-t" : undefined)}
      style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e7e5e4)", borderRadius: 4, fontFamily: pixSans, color: "var(--fg1, #1c1917)", overflow: "hidden", ...style }}>
      {hasHeader && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: `${edge}px ${edge}px 0` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title != null && React.createElement(`h${level}`, { id: id + "-t", style: { margin: 0, font: `600 15px/1.35 ${pixSans}`, color: "var(--fg1, #1c1917)" } }, title)}
            {description != null && <p style={{ margin: title != null ? "2px 0 0" : 0, font: `400 13px/1.5 ${pixSans}`, color: "var(--fg2, #57534e)" }}>{description}</p>}
          </div>
          {action != null && <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>{action}</div>}
        </div>
      )}
      {children != null && children !== false && (
        <div style={{ padding: pad, paddingTop: hasHeader ? Math.min(pad, 12) || 12 : pad, font: `400 14px/1.55 ${pixSans}` }}>{children}</div>
      )}
      {hasHeader && (children == null || children === false) && !footer && <div style={{ height: edge }} />}
      {footer != null && footer !== false && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: 8, padding: `12px ${edge}px`, borderTop: "1px solid var(--border, #e7e5e4)", background: "var(--bg-subtle, #fafaf9)" }}>{footer}</div>
      )}
    </div>
  );
}

/** A surface for grouping related content, with an optional header (title, description, action), a body and a footer. With `loading`, renders a skeleton in its footprint. */
export function Card(props) {
  if (props.loading) return <Skeleton.Panel lines={3} style={props.style} />;
  const { loading, ...rest } = props;
  return <CardBase {...rest} />;
}
