import type React from "react";
export interface TooltipProps {
  /** The tooltip text. Keep it to a short phrase; anything interactive belongs in a Popover. */
  content: React.ReactNode;
  /** One focusable element (a Button, a link). It receives `aria-describedby`. */
  children: React.ReactElement;
  /** Side of the trigger the tooltip appears on. @default "top" */
  placement?: "top" | "bottom" | "left" | "right";
  /** Milliseconds of hover before it opens. Keyboard focus opens it at once. @default 400 */
  delay?: number;
  /** Milliseconds before it closes after the pointer leaves, so the pointer can cross onto the tooltip. @default 100 */
  closeDelay?: number;
  /** Controlled open state. Leave unset for hover and focus behaviour. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Suppress the tooltip without removing the wrapper. @default false */
  disabled?: boolean;
  /** Maximum width before the text wraps. @default 240 */
  maxWidth?: number | string;
  /** Styles for the tooltip bubble. */
  style?: React.CSSProperties;
}
export declare function Tooltip(props: TooltipProps): React.JSX.Element;
