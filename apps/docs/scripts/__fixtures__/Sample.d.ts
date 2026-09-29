import * as React from "react";
export interface SampleProps {
  /** Visual variant. */
  variant?: "filled" | "outline" | "ghost";
  /** Whether the control is disabled. */
  disabled?: boolean;
  /** Required label text. */
  label: string;
  /**
   * Size of the control.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}
export declare function Sample(props: SampleProps): React.ReactElement;
