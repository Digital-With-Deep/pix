import type React from "react";
export interface StackProps {
  /** Flow axis. Default `col`. */
  direction?: "col" | "row";
  /** Gap in px (or any CSS length string). Default 12. */
  gap?: number | string;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around";
  /** Allow rows to wrap — use on `row` stacks so they survive narrow viewports. */
  wrap?: boolean;
  /** Render as `inline-flex`. */
  inline?: boolean;
  /** Take remaining space in a parent flex container. */
  grow?: boolean;
  /** Element tag. Default `div`. */
  as?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Stack(props: StackProps): React.JSX.Element;
