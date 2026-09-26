import type React from "react";
export interface PlanCardProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  name: string;
  /** Strong border and a "Current" tag. Exactly one card in a row should have it. */
  current?: boolean;
  /** One limit per line, already formatted: "5 entities in scope". */
  features: string[];
  /** Optional node under the list. There is no price slot by design: plans are sold on an order form. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function PlanCard(props: PlanCardProps): React.JSX.Element;
