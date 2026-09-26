import * as React from "react";
import { Avatar } from "../Avatar/Avatar.jsx";
const pageFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

export function Page({ avatar, title, secondary, actions, meta, below, maxWidth = 1200, padding = 24, sticky = false, children, style }) {
  const h = React.createElement;
  const av = avatar
    ? React.isValidElement(avatar)
      ? avatar
      : h(Avatar, typeof avatar === "string" ? { name: avatar } : avatar)
    : null;
  return h("div", { style: { fontFamily: pageFont, background: "var(--bg, #fafafa)", color: "var(--fg1, #18181b)", minHeight: "100%", ...style } },
    h("header", {
      style: {
        background: "var(--surface, #fff)",
        position: sticky ? "sticky" : undefined,
        top: sticky ? 0 : undefined,
        zIndex: sticky ? 10 : undefined,
      },
    },
      h("div", { style: { maxWidth, margin: "0 auto", padding: padding + "px " + padding + "px " + (below ? padding * 0.75 : padding) + "px" } },
        h("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, minWidth: 0 } },
          h("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0, flex: "1 1 260px" } },
            av,
            h("div", { style: { minWidth: 0 } },
              h("h1", { style: { margin: 0, font: "600 20px/1.25 " + pageFont, letterSpacing: "-0.015em", color: "var(--fg1, #18181b)", overflowWrap: "anywhere" } }, title),
              secondary && h("div", { style: { marginTop: 3, font: "400 13px/1.45 " + pageFont, color: "var(--fg3, #71717a)", overflowWrap: "anywhere" } }, secondary),
              meta && h("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 } }, meta)
            )
          ),
          actions && h("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: 8, flexShrink: 0 } }, actions)
        ),
        below && h("div", { style: { marginTop: 16 } }, below)
      )
    ),
    children && h("main", { style: { maxWidth, margin: "0 auto", padding } }, children)
  );
}
