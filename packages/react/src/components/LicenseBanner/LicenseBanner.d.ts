import type React from "react";
export interface LicenseBannerProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** "Evaluation", "Standard"… */
  planLabel: string;
  /** A Date, or a string already formatted for display. */
  termEnd: Date | string;
  daysLeft?: number;
  /** Switches from the amber countdown to the red "ended" message. */
  expired?: boolean;
  /** Defaults to "See plans", or "Renew" once expired. */
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}
/** Render it only while the term is ending or has ended; it has no neutral state. */
export declare function LicenseBanner(props: LicenseBannerProps): React.JSX.Element;
