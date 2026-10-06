import type React from "react";
export interface PromptPlusItem {
  label: string;
  /** Built-in glyph: upload | drive | data | doc | spark. Defaults to a document. */
  icon?: "upload" | "drive" | "data" | "doc" | "spark";
  /** Secondary line under the label (limits, connection state, counts). */
  meta?: string;
  /** `"attach"` opens the native file picker. Anything else is passed to `onPlusAction`. */
  action?: "attach" | string;
}

export interface PromptModel {
  id: string;
  name: string;
  /** Short trade-off line — speed, depth, privacy. */
  meta?: string;
  /** Tiny uppercase tag, e.g. "Default" or "Private". */
  badge?: string;
}

export interface PromptAttachment {
  name: string;
  /** Bytes. Rendered as KB/MB. */
  size?: number;
  type?: string;
  /** Image URL rendered as the chip thumbnail. Set automatically for image
   *  uploads; pass your own for server-side thumbnails of PDFs and docs. */
  preview?: string;
  /** Per-file failure, e.g. "Too large" or "Unsupported type". Renders the chip
   *  in red with a warning glyph and shows this text in place of the size. */
  error?: string;
}

export interface PromptSubmission {
  text: string;
  model: string;
  attachments: PromptAttachment[];
}

export interface PromptInputProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Controlled text. Omit to let the composer manage its own state. */
  value?: string;
  /** @default "" */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fired on Enter or Send with the full submission payload. */
  onSubmit?: (submission: PromptSubmission) => void;
  /** @default "Ask about a run, an agent, or a finding…" */
  placeholder?: string;

  /** Show the left "+" context menu. Default true. @default true */
  showPlusMenu?: boolean;
  /** Menu contents. Defaults to upload / Drive / entity ledger / saved prompt. */
  plusItems?: PromptPlusItem[];
  /** Fired for any plus item without `action: "attach"`. */
  onPlusAction?: (item: PromptPlusItem) => void;

  /** Show the model selector. Default true. @default true */
  showModelSelector?: boolean;
  models?: PromptModel[];
  /** Controlled model id. */
  model?: string;
  defaultModel?: string;
  onModelChange?: (id: string) => void;

  /** Enable file attachment chips and the hidden file input. Default true. @default true */
  allowFiles?: boolean;
  /** Controlled attachment list. Omit to let the composer track its own. */
  attachments?: PromptAttachment[];
  onAttach?: (files: PromptAttachment[]) => void;
  onRemoveAttachment?: (file: PromptAttachment) => void;

  /** Toggleable capability pills, e.g. ["Web search", "Deep research"]. @default [] */
  tools?: string[];
  /** @default [] */
  activeTools?: string[];
  onToggleTool?: (tool: string) => void;

  /** @default "Send" */
  sendLabel?: string;
  /** Helper line under the field. @default "Enter to send · Shift+Enter for a new line" */
  hint?: string;
  /** @default true */
  showHint?: boolean;
  /** Composer-level error. Turns the field border red and replaces the hint
   *  line with this message. Use for upload, quota, and model failures. */
  error?: string;
  /** @default false */
  disabled?: boolean;
  /** Textarea rows. Default 3. @default 3 */
  rows?: number;
  /** @default "100%" */
  width?: number | string;
  style?: React.CSSProperties;
}
export declare function PromptInput(props: PromptInputProps): React.JSX.Element;
