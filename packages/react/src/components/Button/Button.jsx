import * as React from "react";
const btnBase = { font: "600 14px var(--font-sans, ui-sans-serif, system-ui, sans-serif)", borderRadius: 3, padding: "9px 16px", cursor: "pointer", transition: "all 160ms var(--ease, cubic-bezier(0.4,0,0.2,1))", display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid transparent", lineHeight: 1, whiteSpace: "nowrap" };
const btnVariants = {
  primary: { background: "var(--zinc-900, #18181b)", color: "var(--fg-inverse, #fff)", borderColor: "var(--zinc-900, #18181b)" },
  filled: { background: "var(--emerald-500, #10b981)", color: "#fff", borderColor: "var(--emerald-500, #10b981)" },
  secondary: { background: "var(--zinc-100, #f4f4f5)", color: "var(--zinc-900, #18181b)", borderColor: "var(--zinc-100, #f4f4f5)" },
  outline: { background: "var(--surface, #fff)", color: "var(--zinc-800, #27272a)", borderColor: "var(--zinc-200, #e4e4e7)" },
  destructive: { background: "var(--red-600, #dc2626)", color: "#fff", borderColor: "var(--red-600, #dc2626)" },
  ghost: { background: "transparent", color: "var(--fg2, #52525b)", borderColor: "transparent", padding: "9px 10px" },
};
const btnSizes = { sm: { padding: "6px 12px", fontSize: 13 }, md: null, lg: { padding: "11px 20px", fontSize: 15 } };
const btnHover = {
  primary: { background: "var(--zinc-800, #27272a)", borderColor: "var(--zinc-800, #27272a)" },
  filled: { background: "var(--emerald-600, #059669)", borderColor: "var(--emerald-600, #059669)" },
  secondary: { background: "var(--zinc-200, #e4e4e7)", borderColor: "var(--zinc-200, #e4e4e7)" },
  outline: { background: "var(--zinc-50, #fafafa)", borderColor: "var(--zinc-300, #d4d4d8)" },
  destructive: { background: "var(--red-700, #b91c1c)", borderColor: "var(--red-700, #b91c1c)" },
  ghost: { background: "var(--zinc-100, #f4f4f5)", color: "var(--fg1, #18181b)" },
};
const btnIconSize = { sm: 14, md: 16, lg: 16 };
const BTN_SPIN_ID = "__pix_btn_spin";
function btnEnsureSpin() {
  if (typeof document === "undefined" || document.getElementById(BTN_SPIN_ID)) return;
  const el = document.createElement("style");
  el.id = BTN_SPIN_ID;
  el.textContent = "@keyframes pixBtnSpin{to{transform:rotate(360deg)}}";
  document.head.appendChild(el);
}

export function Button({ variant = "primary", size = "md", iconPath, loading = false, loadingLabel, children, disabled = false, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  React.useEffect(btnEnsureSpin, []);
  const inert = disabled || loading;
  const s = { ...btnBase, ...(btnVariants[variant] || btnVariants.primary), ...(btnSizes[size] || null) };
  if (!children) { s.padding = size === "sm" ? "6px" : "8px"; }
  if (disabled) { s.opacity = 0.5; s.cursor = "not-allowed"; }
  else if (loading) { s.opacity = 0.5; s.cursor = "progress"; }
  else if (hover) { Object.assign(s, btnHover[variant] || btnHover.primary); }
  const px = btnIconSize[size] || 16;
  const label = loading && loadingLabel !== undefined ? loadingLabel : children;
  return React.createElement(
    "button",
    { type: "button", style: { ...s, ...style }, disabled: inert, "aria-busy": loading || undefined, onClick,
      onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), ...rest },
    loading
      ? React.createElement(
          "svg",
          { viewBox: "0 0 24 24", width: px, height: px, fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", "aria-hidden": true,
            style: { flexShrink: 0, animation: "pixBtnSpin 700ms linear infinite" } },
          React.createElement("circle", { cx: 12, cy: 12, r: 9, opacity: 0.3 }),
          React.createElement("path", { d: "M21 12a9 9 0 00-9-9" })
        )
      : iconPath && React.createElement(
          "svg",
          { viewBox: "0 0 24 24", width: px, height: px, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
          React.createElement("path", { d: iconPath })
        ),
    label
  );
}
