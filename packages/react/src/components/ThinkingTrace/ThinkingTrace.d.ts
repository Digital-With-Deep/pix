import type React from "react";
export interface ThinkingStep {
  /** `thought` — a reasoning line. `tool` — a named tool call. `read` — a pull from a system of record. `write` — a push/write-back. All but `thought` render monospace. */
  kind?: "thought" | "tool" | "read" | "write";
  /** System or store the `read`/`write` step touches, e.g. "SAP S/4HANA", "SharePoint". A monogram mark is derived from the name (SAP, SharePoint, PowerPoint, Excel, ServiceNow, S3 and others are recognised). */
  system?: string;
  /** Override the derived mark: an image URL, or your own element. */
  logo?: string | React.ReactNode;
  /** Override the READ / WRITE-BACK chip label. */
  verb?: string;
  /** The step itself, written as something the model has established. */
  label: string;
  /** Follow-on lines nested under the step. */
  lines?: string[];
  /** Monospace qualifier under a tool step, e.g. its arguments. */
  detail?: string;
  /** Right-aligned elapsed readout, e.g. "142ms". */
  duration?: string;
  /** Marks a completed step while the trace is still streaming. */
  state?: "done" | "active";
}

export interface ThinkingTraceProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Steps in order. While streaming they reveal one at a time. */
  steps: ThinkingStep[];
  /** Header shown while streaming. Default "Thinking it through…". */
  title?: string;
  /** Header shown once `status` is `done`. Default "Thought it through". */
  doneLabel?: string;
  /** `streaming` reveals steps on a timer and shows the working footer; `done` shows all steps. */
  status?: "streaming" | "done";
  /** Footer line under the trace while streaming. Default "Working on it…". */
  workingLabel?: string;
  /** Ms between reveals. Default 900. */
  interval?: number;
  /** Start expanded. Default true. */
  defaultOpen?: boolean;
  /** Drive the reveal yourself — number of steps to show. Disables the internal timer. */
  revealed?: number;
  /** Fires once the last step has been revealed (uncontrolled streaming only). */
  onComplete?: () => void;
  /** When set, an icon-only replay button appears next to the header title — only once streaming stops. */
  onReplay?: () => void;
  /** Tooltip / accessible name for the replay button. Default "Replay". */
  replayLabel?: string;
  /** Extra header controls, shown next to the title once streaming stops. */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function ThinkingTrace(props: ThinkingTraceProps): React.JSX.Element;
