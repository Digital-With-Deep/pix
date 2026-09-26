import * as React from "react";
const stackAlign = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" };
const stackJustify = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" };

export function Stack({ direction = "col", gap = 12, align, justify, wrap = false, inline = false, grow, as = "div", children, style }) {
  return React.createElement(as, {
    style: {
      display: inline ? "inline-flex" : "flex",
      flexDirection: direction === "row" ? "row" : "column",
      gap: typeof gap === "number" ? gap : gap,
      alignItems: align ? stackAlign[align] || align : undefined,
      justifyContent: justify ? stackJustify[justify] || justify : undefined,
      flexWrap: wrap ? "wrap" : undefined,
      flexGrow: grow ? 1 : undefined,
      minWidth: 0,
      ...style,
    },
  }, children);
}
