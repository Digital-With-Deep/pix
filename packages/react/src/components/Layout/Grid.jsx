import * as React from "react";
export function Grid({ min = 240, cols, gap = 12, align, children, style }) {
  return React.createElement("div", {
    style: {
      display: "grid",
      gap,
      gridTemplateColumns: cols
        ? "repeat(" + cols + ", minmax(0, 1fr))"
        : "repeat(auto-fit, minmax(min(100%, " + (typeof min === "number" ? min + "px" : min) + "), 1fr))",
      alignItems: align,
      minWidth: 0,
      ...style,
    },
  }, children);
}

/** Two-track layout: main content + fixed-width side rail that drops below when space runs out. */
export function Split({ side = 300, sideFirst = false, gap = 16, main, aside, style }) {
  const w = typeof side === "number" ? side + "px" : side;
  return React.createElement("div", {
    style: { display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap, minWidth: 0, ...style },
  },
    React.createElement("div", { style: { flex: "3 1 min(100%, 380px)", minWidth: 0, order: sideFirst ? 2 : 1 } }, main),
    React.createElement("div", { style: { flex: "1 1 min(100%, " + w + ")", minWidth: 0, order: sideFirst ? 1 : 2 } }, aside)
  );
}
