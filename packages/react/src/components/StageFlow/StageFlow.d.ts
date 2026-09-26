import type React from "react";
export interface StageFlowStage {
  /** Uppercase stage name. */
  label: string;
  /** Population at this stage, pre-formatted. */
  value: string | number;
  /** One line saying what is true of items at this stage. */
  note?: React.ReactNode;
  /** Fill fraction of the stage's rule, 0–1. */
  progress?: number;
  /** `alert` tints the stage amber (where the estate stalls); `idle` greys an unreached stage. Default derives from `value`. */
  tone?: "neutral" | "alert" | "idle";
}

export interface StageFlowProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  stages: StageFlowStage[];
  /** Small uppercase header label, e.g. "Control lifecycle". */
  caption?: string;
  /** Right-aligned monospace qualifier in the header, e.g. "14 agents · FY2027 Q1". */
  hint?: React.ReactNode;
  /** Tighter padding for use as a page-top strip. */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function StageFlow(props: StageFlowProps): React.JSX.Element;
