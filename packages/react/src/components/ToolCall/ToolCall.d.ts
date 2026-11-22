import type React from "react";
export interface ToolCallProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Tool name, shown in monospace, e.g. "orders.lookup". */
  name: string;
  /** `approval` means the call is held until a person approves it (pair with ApprovalCard as children). @default "done" */
  status?: "queued" | "running" | "done" | "failed" | "approval";
  /** Arguments the agent sent. Objects and JSON strings are pretty-printed. */
  input?: unknown;
  /** What the tool returned. Objects and JSON strings are pretty-printed. */
  output?: unknown;
  /** Failure message for `status: "failed"`. Falls back to `output`. */
  error?: string;
  /** Elapsed time, e.g. "420ms". */
  duration?: string;
  /** One-line summary next to the name. */
  description?: React.ReactNode;
  /** Start expanded. Defaults to open while running, failed or awaiting approval, closed when done. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Adds a Retry button on failure. */
  onRetry?: () => void;
  /** Extra content inside the expanded body, e.g. an ApprovalCard. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
/** One tool call an agent made: the tool, its status, the input it sent and what came back. */
export declare function ToolCall(props: ToolCallProps): React.JSX.Element;
