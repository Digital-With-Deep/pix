import type React from "react";
export type ConfidenceState = "confident" | "low" | "review" | "failed";
export interface ConfidenceBadgeProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** How far to trust the answer. Each state has its own colour, icon and label: `confident` ("Confident"), `low` ("Low confidence"), `review` ("Needs review"), `failed` ("Check failed"). @default "confident" */
  state?: ConfidenceState;
  /** Optional score from 0 to 1, shown in monospace as a whole percentage (0.62 renders "62%"). Values outside 0 to 1 are clamped. */
  score?: number;
  /** What the confidence rests on, in plain words, such as "checked against 3 sources". */
  scope?: string;
  /** Why the badge says what it says. Shown in a tooltip on hover or keyboard focus, and read by screen readers as the badge's description. */
  reason?: string;
  /** `inline` is a small pill that sits in a line of text or a table cell; `standalone` is a larger block with the scope on its own line. @default "inline" */
  size?: "inline" | "standalone";
  /** Overrides the state's default label. Keep it in words; the colour is never the only signal. */
  label?: string;
  style?: React.CSSProperties;
}
/** States how far to trust an AI answer: confident, low confidence, needs review or check failed, always in words as well as colour. */
export declare function ConfidenceBadge(props: ConfidenceBadgeProps): React.JSX.Element;
