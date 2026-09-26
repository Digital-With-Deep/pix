import type React from "react";
export interface NextStepsItem {
  /** Short uppercase category chip, e.g. "DRIFT", "GAP", "ATTEST". */
  kind?: string;
  kindTone?: "neutral" | "warning" | "danger" | "info" | "success";
  /** The finding, written as a statement of what is true. */
  title: string;
  /** Why it matters and what has to happen. */
  body?: React.ReactNode;
  /** Link label for the one action this item leads to. */
  action?: string;
  onAction?: () => void;
}

export interface NextStepsProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Default "Suggested next steps". */
  title?: string;
  /** Provenance line, e.g. "3 actions from this week's sync · reviewed by the control agent". */
  subtitle?: React.ReactNode;
  items: NextStepsItem[];
  /** Shows the dismiss control when provided. */
  onDismiss?: () => void;
  dismissLabel?: string;
  style?: React.CSSProperties;
}
export declare function NextSteps(props: NextStepsProps): React.JSX.Element;
