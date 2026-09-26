import type React from "react";
export interface GridProps {
  /** Minimum column width before columns reflow. Default 240. Ignored when `cols` is set. */
  min?: number | string;
  /** Fixed column count — only for layouts that must not reflow. */
  cols?: number;
  /** Gap in px or CSS length. Default 12. */
  gap?: number | string;
  align?: React.CSSProperties["alignItems"];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Grid(props: GridProps): React.JSX.Element;

export interface SplitProps {
  /** Side rail width; also the reflow threshold. Default 300. */
  side?: number | string;
  /** Put the rail before the main column on wide viewports. */
  sideFirst?: boolean;
  gap?: number | string;
  main?: React.ReactNode;
  aside?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Split(props: SplitProps): React.JSX.Element;
