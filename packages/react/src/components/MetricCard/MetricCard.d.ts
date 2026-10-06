import type React from "react";
export interface MetricCardProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Tiny uppercase tracked label. */
  label: string;
  /** The number, pre-formatted (e.g. "$42,318", "12"). */
  value: string | number;
  /** Secondary line under the value. */
  delta?: string;
  /** Colors the delta and prefixes an arrow. @default "neutral" */
  deltaType?: "up" | "down" | "neutral";
  /** Small right-aligned qualifier in the header row (e.g. "Today"). */
  hint?: string;
  /** Colors the value itself. Reserve for real state, not decoration. @default "default" */
  valueTone?: "default" | "danger" | "warning" | "success";
  /** Adds a completion rule under the value, 0–1. */
  progress?: number;
  /** Extra node under the delta — a badge, a chip row. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function MetricCard(props: MetricCardProps): React.JSX.Element;
