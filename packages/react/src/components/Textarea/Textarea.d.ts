import type React from "react";
type NativeTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange" | "style" | "children">;
export interface TextareaProps extends NativeTextareaProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** Visible label, wired to the textarea with `for`/`id`. Without one, pass `aria-label`. */
  label?: React.ReactNode;
  /** Helper text under the textarea, linked with `aria-describedby`. */
  hint?: React.ReactNode;
  /** Replaces the hint, turns the border red and sets `aria-invalid`. */
  error?: React.ReactNode;
  /** Marks the field required (native `required`) and adds an asterisk to the label. @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  readOnly?: boolean;
  /** Controlled value. Leave unset and use `defaultValue` for an uncontrolled field. */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new string and the change event. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Native `maxLength`. Also turns on the character count unless `showCount` is `false`. */
  maxLength?: number;
  /** Show the `12/280` count under the field when `maxLength` is set. @default true */
  showCount?: boolean;
  /** Visible lines before scrolling. @default 4 */
  rows?: number;
  /** Which way the user can drag to resize. @default "vertical" */
  resize?: "vertical" | "none" | "both";
  placeholder?: string;
  /** Id for the textarea; generated when omitted. Hint, error and count ids derive from it. */
  id?: string;
  /** Extra styles for the textarea element itself. */
  inputStyle?: React.CSSProperties;
  /** Styles for the outer wrapper. */
  style?: React.CSSProperties;
}
export declare function Textarea(props: TextareaProps): React.JSX.Element;
