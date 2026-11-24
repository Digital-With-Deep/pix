import type React from "react";
export interface DialogProps {
  /** Controlled open state. Leave unset and pass `trigger` (and optionally `defaultOpen`) for self-managed. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called with `false` on Escape, the close button, an overlay click, or with `true` when `trigger` is clicked. */
  onOpenChange?: (open: boolean) => void;
  /** An element (usually a Button) that opens the dialog on click. Optional when you control `open` yourself. */
  trigger?: React.ReactElement;
  /** Heading; names the dialog through `aria-labelledby`. */
  title?: React.ReactNode;
  /** One line under the title; describes the dialog through `aria-describedby`. */
  description?: React.ReactNode;
  /** Accessible name when there is no visible `title`. */
  label?: string;
  /** The dialog body. Scrolls when it outgrows the viewport. */
  children?: React.ReactNode;
  /** Right-aligned action row, usually a secondary and a primary Button. */
  footer?: React.ReactNode;
  /** Maximum width: `sm` 400, `md` 560, `lg` 760 px. @default "md" */
  size?: "sm" | "md" | "lg";
  /** `alertdialog` for a confirmation that interrupts, such as deleting a run. @default "dialog" */
  role?: "dialog" | "alertdialog";
  /** Close when the dimmed backdrop is clicked. Turn off for forms that would lose input. @default true */
  closeOnOverlayClick?: boolean;
  /** Hide the close button in the header (Escape still closes). @default false */
  hideCloseButton?: boolean;
  /** Accessible name of the close button. @default "Close" */
  closeLabel?: string;
  /** Element to focus on open. Defaults to the first focusable element in the body or footer, then the close button. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Show a text skeleton in the body while its content loads. @default false */
  loading?: boolean;
  /** Styles for the dialog panel. */
  style?: React.CSSProperties;
}
export declare function Dialog(props: DialogProps): React.JSX.Element;
