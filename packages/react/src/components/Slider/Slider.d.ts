import type React from "react";
type SliderNativeProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "style" | "children" | "min" | "max" | "step" | "size">;
export interface SliderProps extends SliderNativeProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** Visible label, wired to the input with `for`/`id`. Without one, pass `aria-label`. */
  label?: React.ReactNode;
  /** Helper text under the slider, linked with `aria-describedby`. */
  hint?: React.ReactNode;
  /** Replaces the hint, turns the track and thumb red and sets `aria-invalid`. */
  error?: React.ReactNode;
  /** Controlled value. Clamped to `min` and `max`. Leave unset and use `defaultValue` for an uncontrolled slider. */
  value?: number | null;
  /** Initial value when uncontrolled. @default min */
  defaultValue?: number;
  /** Called with the new number and the change event while the thumb moves. */
  onChange?: (value: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Lowest value. @default 0 */
  min?: number;
  /** Highest value. @default 100 */
  max?: number;
  /** Distance between allowed values, or `"any"` for a continuous slider. The value display shows as many decimals as the step has. @default 1 */
  step?: number | "any";
  /** Show the current value, in monospace, at the right of the label row. @default true */
  showValue?: boolean;
  /** Show the `min` and `max` values under the track. @default false */
  showRange?: boolean;
  /** Format the value display, the range labels and the value screen readers announce, for example as a percentage or an amount. */
  formatValue?: (value: number) => string;
  /** @default false */
  disabled?: boolean;
  /** Adds an asterisk to the label and the native `required` attribute. @default false */
  required?: boolean;
  /** Id for the input; generated when omitted. Hint and error ids derive from it. */
  id?: string;
  /** Styles for the outer wrapper. */
  style?: React.CSSProperties;
}
/** Pick a number in a range by dragging or with the arrow keys. */
export declare function Slider(props: SliderProps): React.JSX.Element;
