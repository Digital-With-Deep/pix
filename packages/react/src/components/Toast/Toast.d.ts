import type React from "react";

export type ToastTone = "info" | "truth" | "claim" | "warn";

export interface ToastAction {
  /** Button text, verb first: "Undo", "View run". */
  label: string;
  /** Runs before the toast dismisses itself. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ToastProps {
  /** `info` neutral news, `truth` a verified result, `claim` an unverified or failed model output, `warn` needs attention. @default "info" */
  tone?: ToastTone;
  /** First line, in bold. Say what happened in words; the color and icon only reinforce it. */
  title?: React.ReactNode;
  /** Second line. */
  description?: React.ReactNode;
  /** Body; wins over `description`. */
  children?: React.ReactNode;
  /** One optional button under the text. Pressing it also dismisses the toast. */
  action?: ToastAction;
  /** Shows the close button and is called when it, or the action, is pressed. */
  onDismiss?: () => void;
  /** Accessible name of the close button. @default "Dismiss notification" */
  dismissLabel?: string;
  style?: React.CSSProperties;
}
/** One notification card. Use it through `ToastProvider` and `useToast()`; render it directly only for a static preview. */
export declare function Toast(props: ToastProps): React.JSX.Element;

export interface ToastOptions {
  /** Pass an existing id to replace that toast in place (for example "Saving" then "Saved"). Generated when omitted. */
  id?: string;
  /** @default "info" */
  tone?: ToastTone;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** One optional button. A toast with an action stays until dismissed unless you set `duration`. */
  action?: ToastAction;
  /** Milliseconds before it dismisses itself; `0` keeps it until dismissed. Defaults to the provider's `duration`, or `0` when there is an action. */
  duration?: number;
  /** Accessible name of the close button. @default "Dismiss notification" */
  dismissLabel?: string;
  /** Called when the toast leaves, by timeout, close button or action. */
  onDismiss?: () => void;
}

export interface ToastProviderProps {
  /** Your app. `useToast()` works anywhere below. */
  children?: React.ReactNode;
  /** Corner or edge of the viewport the stack sits in. @default "bottom-right" */
  placement?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom" | "top";
  /** Toasts visible at once; later ones queue until a slot frees up. @default 3 */
  max?: number;
  /** Default auto-dismiss time in milliseconds. Timers pause while the pointer or keyboard focus is on the stack. @default 5000 */
  duration?: number;
  /** Accessible name of the notifications region. @default "Notifications" */
  label?: string;
  /** Styles for the fixed region that holds the stack. */
  style?: React.CSSProperties;
}
/** Holds the toast queue and renders it into a polite live region. Mount once near the root. */
export declare function ToastProvider(props: ToastProviderProps): React.JSX.Element;

export interface ToastApi {
  /** Queue a toast; a string is shorthand for `{ title }`. Returns its id. */
  toast: (options: ToastOptions | string) => string;
  /** Remove one toast by id, or every toast when called with no id. */
  dismiss: (id?: string) => void;
}
/** Access the nearest ToastProvider. Outside one it returns no-op functions and warns once. */
export declare function useToast(): ToastApi;
