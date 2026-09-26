import type React from "react";
export interface RadioOption { value: string; label: string; description?: React.ReactNode; disabled?: boolean }
export interface RadioGroupProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  options: RadioOption[];
  value?: string | null;
  onChange?: (value: string, option: RadioOption) => void;
  /** Uppercase group label, wired with aria-labelledby. */
  label?: string;
  /** Native radio name; generated when omitted. */
  name?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
/** Two to five mutually exclusive choices that each need a sentence of explanation. Longer lists: use Select. */
export declare function RadioGroup(props: RadioGroupProps): React.JSX.Element;
