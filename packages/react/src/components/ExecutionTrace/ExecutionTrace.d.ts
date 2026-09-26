import type React from "react";
export interface ExecutionTraceStep {
  /** Tool name. Always rendered monospace. */
  name: string;
  /** Call arguments. An object is formatted as `{ "key": value }`; a string is printed verbatim. */
  args?: Record<string, unknown> | string;
  /** Wall time for the call, e.g. "142ms". */
  duration?: string;
  /** Returned payload, revealed when the row is expanded. */
  result?: string;
  /** Reviewer note on what this step got wrong. Its presence flags the step amber. */
  note?: string;
  /** Flag the step amber without attaching a note. */
  flagged?: boolean;
  /** Override the displayed step number (for elided traces). */
  index?: number;
}

export interface ExecutionTraceMissing {
  /** Tool the agent had available. Rendered monospace. */
  name: string;
  /** Defaults to "never called". */
  label?: string;
  /** Why the omission matters — the substance of the finding. */
  note?: string;
}

export interface ExecutionTraceProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Card label. Default "Execution trace". */
  title?: string;
  steps: ExecutionTraceStep[];
  /** Call count. Defaults to `steps.length`. */
  calls?: number;
  /** Total wall time, e.g. "300ms". */
  duration?: string;
  /** Token total, e.g. "2,140 tokens". */
  tokens?: string;
  /** Run cost, e.g. "$0.031". */
  cost?: string;
  /** Replaces the whole assembled summary line. */
  meta?: string;
  /** Tools that were available and never invoked — the hatched block under the trace. */
  missing?: ExecutionTraceMissing[];
  /** Expand every step's result on first render. */
  defaultOpen?: boolean;
  style?: React.CSSProperties;
}
export declare function ExecutionTrace(props: ExecutionTraceProps): React.JSX.Element;
