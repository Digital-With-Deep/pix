import type React from "react";
type NativeCheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "onChange" | "style" | "children">;
export interface CheckboxProps extends NativeCheckboxProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** Controlled state. Leave unset and use `defaultChecked` for an uncontrolled checkbox. */
  checked?: boolean;
  /** Initial state when uncontrolled. @default false */
  defaultChecked?: boolean;
  /** Partly selected: shows a dash and reports "mixed" to assistive tech. Visual state only; you clear it when the user decides. @default false */
  indeterminate?: boolean;
  /** Called with the new checked state and the change event. */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Visible label; clicking it toggles the box. Without one, pass `aria-label`. */
  label?: React.ReactNode;
  /** Second line under the label, linked with `aria-describedby`. */
  description?: React.ReactNode;
  /** Message under the label; turns the box border red and sets `aria-invalid`. */
  error?: React.ReactNode;
  /** @default false */
  disabled?: boolean;
  /** Native `required`; adds an asterisk to the label. @default false */
  required?: boolean;
  name?: string;
  value?: string;
  /** Id for the input; generated when omitted. */
  id?: string;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): React.JSX.Element;
