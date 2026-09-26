import type React from "react";
export interface UsageMeterProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** What is being counted: "Entities in scope", "Seats". */
  label: string;
  used: number;
  /** `null` means unlimited: the bar is dropped and the value reads "· unlimited". */
  limit?: number | null;
  /** Fraction of the limit at which the bar turns amber. Default 0.8. */
  nearAt?: number;
  /** Replaces the automatic near/full message. Pass `null` to show none. */
  note?: React.ReactNode | null;
  /** Hairline above — set on every meter but the first when stacking them in one card. */
  divider?: boolean;
  style?: React.CSSProperties;
}
export declare function UsageMeter(props: UsageMeterProps): React.JSX.Element;
