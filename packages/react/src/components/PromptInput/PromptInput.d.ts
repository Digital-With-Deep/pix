import type React from "react";
export interface PromptPlusItem {
  label: string;
  /** Built-in glyph: upload | drive | data | doc | spark. Defaults to a document. */
  icon?: "upload" | "drive" | "data" | "doc" | "spark";
  /** Secondary line under the label (limits, connection state, counts). */
  meta?: string;
  /** `"attach"` opens the native file picker and `"screenshot"` calls `onAddScreenshot`. Anything else is passed to `onPlusAction`. */
  action?: "attach" | "screenshot" | string;
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
  /** Stable key. Set automatically for files the composer adds; use it to find the attachment when you update its upload status. */
  id?: string;
  name: string;
  /** Bytes. Rendered as KB/MB. */
  size?: number;
  type?: string;
  /** Image URL rendered as the chip thumbnail. Set automatically for image
   *  uploads; pass your own for server-side thumbnails of PDFs and docs. */
  preview?: string;
  /** The picked, dropped, pasted or captured file, for your upload code. Absent on attachments you create yourself. */
  file?: File;
  /** `uploading` shows a progress bar on the chip and holds Send until it finishes; `error` renders the chip in red. */
  status?: "uploading" | "done" | "error";
  /** Upload progress from 0 to 100 while `status` is `uploading`. Leave unset for an indeterminate bar. */
  progress?: number;
  /** Per-file failure, e.g. "Too large" or "Unsupported type". Renders the chip
   *  in red with a warning glyph and shows this text in place of the size. */
  error?: string;
}

/** What `onAddScreenshot` resolves to: a captured image, a ready-made attachment, or nothing when the person cancelled. */
export type PromptScreenshotResult = File | Blob | PromptAttachment | null | undefined;

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
  /** Accessible name of the text field. @default "Message" */
  label?: string;

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

  /** Enable attachment chips, the file picker, drag and drop and pasting files. @default true */
  allowFiles?: boolean;
  /** Controlled attachment list. Pair with `onAttachmentsChange`. Omit to let the composer track its own. */
  attachments?: PromptAttachment[];
  /** Initial attachments when uncontrolled. @default [] */
  defaultAttachments?: PromptAttachment[];
  /** Called with the whole next list whenever a file is added or removed. */
  onAttachmentsChange?: (attachments: PromptAttachment[]) => void;
  /** Called with only the newly added attachments, including any rejected with an `error`. Start uploads here. */
  onAttach?: (files: PromptAttachment[]) => void;
  /** Called with the attachment a person removed, or one replaced when `multiple` is off. Cancel its upload here. */
  onRemoveAttachment?: (file: PromptAttachment) => void;
  /** File types to allow, in the `accept` attribute format: `"image/*,.pdf,text/csv"`. Applies to the picker, drops and pastes; others become error chips. */
  accept?: string;
  /** Allow more than one attachment. When off, a new file replaces the current one. @default true */
  multiple?: boolean;
  /** Largest file in bytes. Bigger files become error chips and are not uploaded. */
  maxFileSize?: number;
  /** Chip text for a file over `maxFileSize`. Defaults to "Over the 25 MB limit", with the size taken from `maxFileSize`. */
  maxFileSizeError?: string;
  /** Chip text for a file that doesn't match `accept`. @default "File type not supported" */
  unsupportedFileError?: string;
  /** Show a paperclip button that opens the file picker, beside the "+" menu or in place of it. @default false */
  showAttachButton?: boolean;
  /** Accessible name and tooltip of the paperclip button. @default "Attach files" */
  attachLabel?: string;
  /** Shown over the composer while files are dragged onto it. @default "Drop files to attach" */
  dropLabel?: string;
  /** Adds a camera button that calls this and attaches what it resolves to. PIX does not capture the screen itself:
   *  use your own capture (for example `getDisplayMedia`) or a native bridge. Resolve `null` when the person cancels. */
  onAddScreenshot?: () => Promise<PromptScreenshotResult>;
  /** Accessible name and tooltip of the screenshot button. @default "Add screenshot" */
  screenshotLabel?: string;
  /** Shown under the composer when `onAddScreenshot` rejects. @default "Couldn't add the screenshot" */
  screenshotError?: string;

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
