import type React from "react";
export type MessageFeedbackVote = "up" | "down" | null;

export interface MessageFeedbackDetail {
  /** Always `"down"`: the reason picker only opens for a thumbs down. */
  vote: "down";
  /** The reason chip the person picked, or null when they only wrote a comment. */
  reason: string | null;
  /** The free-text comment, trimmed. Empty when they only picked a reason. */
  comment: string;
}

export interface MessageActionsLabels {
  copy: string;
  copied: string;
  copyFailed: string;
  regenerate: string;
  helpful: string;
  notHelpful: string;
  branch: string;
  reasonTitle: string;
  reasonPlaceholder: string;
  submit: string;
  cancel: string;
  thanks: string;
}

export interface MessageActionsProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Text the Copy button puts on the clipboard, or a function that returns it at click time. Copy shows only when this is set. */
  text?: string | (() => string);
  /** Called with the copied text after a successful copy. */
  onCopy?: (text: string) => void;
  /** Adds a Regenerate button. */
  onRegenerate?: () => void;
  /** Controlled vote. Pass `null` for no vote. Omit to let the row track its own. */
  feedback?: MessageFeedbackVote;
  /** Initial vote when uncontrolled. @default null */
  defaultFeedback?: MessageFeedbackVote;
  /** Adds thumbs up and down. Called with "up", "down", or null when the person clears their vote. */
  onFeedback?: (vote: MessageFeedbackVote) => void;
  /** Opens a reason picker after a thumbs down and reports what the person picked and wrote. Also adds the thumbs on its own. */
  onFeedbackReason?: (detail: MessageFeedbackDetail) => void;
  /** Reason chips in the picker. Pass `[]` for a comment box only. @default ["Not accurate", "Not helpful", "Didn't follow instructions", "Too long"] */
  feedbackReasons?: string[];
  /** Adds a Branch button, for starting a new thread from this message. */
  onBranch?: () => void;
  /** Override any button name, tooltip or picker text, for wording or translation. */
  labels?: Partial<MessageActionsLabels>;
  /** Accessible name of the button group. @default "Message actions" */
  label?: string;
  /** Disable every action, for example while the message is still streaming. @default false */
  disabled?: boolean;
  /** Side the tooltips open on. @default "top" */
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
  /** Extra actions after the built-in ones, such as your own icon buttons. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** A compact row of actions for one agent message: copy, regenerate, thumbs up and down with an optional reason picker, and branch. */
export declare function MessageActions(props: MessageActionsProps): React.JSX.Element;
