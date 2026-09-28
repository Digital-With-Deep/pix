import * as React from "react";
export interface SampleProps {
  /** Visual variant. */
  variant?: "filled" | "outline" | "ghost";
  /** Whether the control is disabled. */
  disabled?: boolean;
  /** Required label text. */
  label: string;
}
export declare function Sample(props: SampleProps): React.ReactElement;
