import * as React from "react";
const badgeTones = {
  neutral: { background: "var(--zinc-100, #f4f4f5)", color: "var(--zinc-700, #3f3f46)" },
  accent: { background: "var(--emerald-50, #ecfdf5)", color: "var(--emerald-700, #047857)" },
  success: { background: "var(--emerald-50, #ecfdf5)", color: "var(--emerald-700, #047857)" },
  warning: { background: "var(--amber-50, #fffbeb)", color: "var(--amber-700, #b45309)" },
  danger: { background: "var(--red-50, #fef2f2)", color: "var(--red-700, #b91c1c)" },
  info: { background: "var(--blue-50, #eff6ff)", color: "var(--blue-700, #1d4ed8)" },
  outline: { background: "var(--surface, #fff)", color: "var(--zinc-600, #52525b)", boxShadow: "inset 0 0 0 1px var(--zinc-200, #e4e4e7)" },
};

export function Badge({ tone = "neutral", dot = false, size = "sm", maxWidth, title, onRemove, children, style }) {
  const t = badgeTones[tone] || badgeTones.neutral;
  const m = size === "md"
    ? { font: "500 12px var(--font-sans, ui-sans-serif, system-ui, sans-serif)", padding: "4px 10px", gap: 6 }
    : { font: "600 11px var(--font-sans, ui-sans-serif, system-ui, sans-serif)", padding: "3px 8px", gap: 5 };
  if (onRemove) m.padding = size === "md" ? "4px 6px 4px 10px" : "3px 4px 3px 8px";
  const label = typeof children === "string" ? children : undefined;
  return React.createElement(
    "span",
    { title: title || (maxWidth ? label : undefined),
      style: { display: "inline-flex", alignItems: "center", ...m, borderRadius: 3, lineHeight: 1.5, whiteSpace: "nowrap", maxWidth, ...t, ...style } },
    dot && React.createElement("span", { style: { width: 6, height: 6, borderRadius: 999, background: "currentColor", flexShrink: 0 } }),
    React.createElement("span", { style: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, children),
    onRemove && React.createElement(
      "button",
      { type: "button", onClick: onRemove, "aria-label": "Remove" + (label ? " " + label : ""),
        style: { flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14,
          marginLeft: 1, padding: 0, border: 0, borderRadius: 2, background: "transparent", color: "inherit", opacity: 0.65, cursor: "pointer" } },
      React.createElement("svg", { viewBox: "0 0 24 24", width: 10, height: 10, fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" },
        React.createElement("path", { d: "M6 6l12 12M18 6L6 18" }))
    )
  );
}
