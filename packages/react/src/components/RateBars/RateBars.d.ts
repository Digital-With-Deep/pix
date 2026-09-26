import type React from "react";
export interface RateBarsRow {
  /** Row identity, rendered monospace (e.g. an invariant name). */
  name: string;
  /** Percentage, 0–100. */
  value: number;
  /** One line saying what a failure of this row looks like. */
  note?: React.ReactNode;
  /** Overrides the threshold verdict for this row. */
  tone?: "default" | "danger";
}

export interface RateBarsProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  rows: RateBarsRow[];
  /** Small uppercase header label, e.g. "Pass rate across 42 runs". */
  caption?: string;
  /** Right-aligned monospace qualifier in the header. */
  hint?: React.ReactNode;
  /** Values below this render red. Default 90. */
  threshold?: number;
  style?: React.CSSProperties;
}
export declare function RateBars(props: RateBarsProps): React.JSX.Element;
