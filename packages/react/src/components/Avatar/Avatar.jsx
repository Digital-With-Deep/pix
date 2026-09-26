import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const avatarFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const avatarSizes = { xs: 20, sm: 28, md: 40, lg: 56, xl: 72 };
const avatarTones = {
  neutral: { background: "var(--zinc-100, #f4f4f5)", color: "var(--fg2, #3f3f46)" },
  accent: { background: "var(--emerald-100, #d1fae5)", color: "var(--emerald-800, #065f46)" },
  info: { background: "var(--blue-100, #dbeafe)", color: "var(--blue-800, #1e40af)" },
  warning: { background: "var(--amber-100, #fef3c7)", color: "var(--amber-800, #92400e)" },
  danger: { background: "var(--red-100, #fee2e2)", color: "var(--red-700, #b91c1c)" },
  solid: { background: "var(--zinc-900, #18181b)", color: "var(--fg-inverse, #fff)" },
};
const avatarStatusColors = { online: "var(--emerald-500, #10b981)", away: "var(--amber-500, #f59e0b)", busy: "var(--red-600, #dc2626)", offline: "var(--zinc-400, #a1a1aa)" };

function avatarInitials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
}

function AvatarBase({ src, name, initials, iconPath, size = "md", tone = "neutral", square = false, status, ring = false, title, style }) {
  const h = React.createElement;
  const px = typeof size === "number" ? size : avatarSizes[size] || avatarSizes.md;
  const t = avatarTones[tone] || avatarTones.neutral;
  const label = initials || avatarInitials(name);
  const inner = {
    width: px, height: px, borderRadius: square ? Math.max(3, Math.round(px * 0.22)) : 999, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    font: "600 " + Math.max(9, Math.round(px * 0.36)) + "px " + avatarFont, letterSpacing: "0.02em",
    boxShadow: (ring ? "0 0 0 2px var(--surface, #fff), 0 0 0 3px var(--emerald-500, #10b981)" : "inset 0 0 0 1px rgba(24,24,27,0.08)"),
    ...t,
  };
  const face = src
    ? h("img", { src, alt: name || "", style: { width: "100%", height: "100%", objectFit: "cover" } })
    : iconPath
      ? h("svg", { viewBox: "0 0 24 24", width: Math.round(px * 0.5), height: Math.round(px * 0.5), fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }, h("path", { d: iconPath }))
      : label;
  const node = h("div", { style: inner, "aria-hidden": !name && !title ? true : undefined }, face);
  if (!status) return h("div", { title: title || name, style: { display: "inline-flex", ...style } }, node);
  const dot = Math.max(6, Math.round(px * 0.26));
  return h("div", { title: title || name, style: { position: "relative", display: "inline-flex", ...style } },
    node,
    h("span", {
      style: {
        position: "absolute", right: square ? -1 : 0, bottom: square ? -1 : 0, width: dot, height: dot, borderRadius: 999,
        background: avatarStatusColors[status] || avatarStatusColors.offline,
        boxShadow: "0 0 0 2px var(--surface, #fff)",
      },
    })
  );
}

export function AvatarGroup({ avatars = [], max = 4, size = "sm", square = false, overlap, tone = "neutral", style }) {
  const h = React.createElement;
  const px = typeof size === "number" ? size : avatarSizes[size] || avatarSizes.sm;
  const shift = overlap !== undefined ? overlap : Math.round(px * 0.3);
  const shown = avatars.slice(0, max);
  const rest = avatars.length - shown.length;
  const wrap = { boxShadow: "0 0 0 2px var(--surface, #fff)", borderRadius: square ? Math.max(3, Math.round(px * 0.22)) : 999 };
  return h("div", { style: { display: "inline-flex", alignItems: "center", ...style } },
    shown.map((a, i) => h("div", { key: i, style: { marginLeft: i ? -shift : 0, ...wrap } },
      h(Avatar, Object.assign({ size: px, square, tone }, typeof a === "string" ? { name: a } : a)))),
    rest > 0 && h("div", { style: { marginLeft: -shift, ...wrap } },
      h(Avatar, { size: px, square, tone: "solid", initials: "+" + rest, title: rest + " more" }))
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function Avatar(props) {
  if (props.loading) return <Skeleton variant="circle" height={typeof props.size === "number" ? props.size : ({ xs: 20, sm: 28, md: 40, lg: 56, xl: 72 })[props.size] || 40} style={props.style} />;
  return <AvatarBase {...props} />;
}
