import type React from "react";
export interface StepperProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Short step names, in order. Keep each to one or two words; long names truncate. */
  steps: string[];
  /** Zero-based index of the step in progress. Earlier steps read DONE. */
  current: number;
  /** When given, completed steps become clickable so people can go back. Future steps never are. */
  onStepClick?: (index: number) => void;
  style?: React.CSSProperties;
}
export declare function Stepper(props: StepperProps): React.JSX.Element;
