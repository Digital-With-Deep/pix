import type React from "react";
export interface SwitchProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** With a label the switch renders as a settings row: text left, track right. Without one, just the track (give it an accessible name yourself). */
  label?: string;
  description?: React.ReactNode;
  disabled?: boolean;
  /** Hairline above — set on every row but the first when stacking. */
  divider?: boolean;
  style?: React.CSSProperties;
}
export declare function Switch(props: SwitchProps): React.JSX.Element;
