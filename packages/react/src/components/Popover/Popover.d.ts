import type React from "react";
export interface PopoverProps {
  /** The trigger: one element, usually a Button. Clicking it toggles the panel; it receives `aria-haspopup`, `aria-expanded` and `aria-controls`. */
  children: React.ReactElement;
  /** What the panel holds: text, a short form, a list of links. */
  content?: React.ReactNode;
  /** Visible heading at the top of the panel; also names it. */
  title?: React.ReactNode;
  /** Accessible name when there is no `title`. */
  label?: string;
  /** Side of the trigger the panel opens on. @default "bottom" */
  placement?: "bottom" | "top";
  /** Which edge of the trigger the panel lines up with. @default "start" */
  align?: "start" | "center" | "end";
  /** Controlled open state. Leave unset for self-managed. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panel width. @default 280 */
  width?: number | string;
  /** Move focus into the panel when it opens (first focusable element, else the panel). @default true */
  initialFocus?: boolean;
  /** Show a text skeleton in the panel while its content loads. @default false */
  loading?: boolean;
  /** Styles for the panel. */
  style?: React.CSSProperties;
}
export declare function Popover(props: PopoverProps): React.JSX.Element;
