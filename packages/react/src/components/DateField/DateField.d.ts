import type React from "react";
type DateFieldNativeProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "style" | "size" | "children" | "min" | "max">;
export interface DateFieldProps extends DateFieldNativeProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** Which picker to show: a date, a time of day, or both (a native `datetime-local` input). @default "date" */
  type?: "date" | "time" | "datetime";
  /** Visible label, wired to the input with `for`/`id`. Without one, pass `aria-label`. */
  label?: React.ReactNode;
  /** Helper text under the input, linked with `aria-describedby`. A good place for the time zone. */
  hint?: React.ReactNode;
  /** Replaces the hint, turns the border red and sets `aria-invalid`. */
  error?: React.ReactNode;
  /**
   * Controlled value as an ISO 8601 string: `2026-12-04` for a date, `14:30` for a time, `2026-12-04T14:30` for both.
   * A full date-time is cut to what `type` shows, and a value with a time zone (`Z` or an offset) is shown in local time.
   * Leave unset and use `defaultValue` for an uncontrolled field.
   */
  value?: string | null;
  /** Initial value when uncontrolled, in the same formats as `value`. */
  defaultValue?: string;
  /** Called with the new value and the change event. The value is `""` when cleared, otherwise in the format of `value`, without a time zone. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Earliest allowed value, in the same formats as `value`. */
  min?: string;
  /** Latest allowed value, in the same formats as `value`. */
  max?: string;
  /** Native `step`, in seconds for times (60 by default in browsers; 1 adds a seconds field) and days for dates. */
  step?: number | string;
  /** Marks the field required (native `required`) and adds an asterisk to the label. @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  readOnly?: boolean;
  /** Id for the input; generated when omitted. Hint and error ids derive from it. */
  id?: string;
  /** Extra styles for the input element itself. */
  inputStyle?: React.CSSProperties;
  /** Styles for the outer wrapper. */
  style?: React.CSSProperties;
}
/** A date, time, or date and time input on the browser's native picker. */
export declare function DateField(props: DateFieldProps): React.JSX.Element;
