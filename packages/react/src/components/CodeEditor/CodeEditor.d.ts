import type React from "react";
export type CodeLanguage = "text" | "ts" | "tsx" | "js" | "jsx" | "typescript" | "javascript" | "python" | "py" | "json" | "yaml" | "yml" | "bash" | "sh" | "go" | "sql";
export interface CodeEditorProps {
  /** Controlled code. */
  value?: string;
  defaultValue?: string;
  /** Present and not `readOnly` → the block is editable in place. */
  onChange?: (value: string) => void;
  readOnly?: boolean;
  language?: CodeLanguage;
  /** Header label; a filename (`first-run.ts`) renders in monospace. */
  title?: React.ReactNode;
  icon?: React.ReactNode;
  lineNumbers?: boolean;
  /** Copy button in the header (default on). */
  copy?: boolean;
  wrap?: boolean;
  maxHeight?: number | string;
  /** 1-based lines to tint, e.g. the lines the reader must change. */
  highlightLines?: number[];
  placeholder?: string;
  tabSize?: number;
  /** ⌘S / Ctrl+S while editing. */
  onSave?: (value: string) => void;
  /** Extra header controls, left of Copy. */
  actions?: React.ReactNode;
  /** Footer text: "Saved 2 min ago", validation state. */
  status?: React.ReactNode;
  ariaLabel?: string;
  loading?: boolean;
  style?: React.CSSProperties;
}
export declare function CodeEditor(props: CodeEditorProps): React.JSX.Element;

export interface InlineCodeProps {
  children?: React.ReactNode;
  /** `accent` (violet, for the command to run) or `neutral`. */
  tone?: "accent" | "neutral";
  /** Click copies the text. */
  copy?: boolean;
  style?: React.CSSProperties;
}
export declare function InlineCode(props: InlineCodeProps): React.JSX.Element;
