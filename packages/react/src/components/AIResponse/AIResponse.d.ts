import type React from "react";
export interface AIResponseStage {
  label: string;
  /** Completed steps show a solid emerald dot; pending ones pulse. */
  done?: boolean;
}

export interface AIResponseProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** `generating` shows the shimmer skeleton, `done` the answer, `error` the failure card. @default "done" */
  status?: "generating" | "done" | "error";
  /** Answer text. Rendered with preserved line breaks. */
  text?: string;
  /** Rich answer content. Takes precedence over `text`. */
  children?: React.ReactNode;
  /** Reasoning trace, rendered with the ThinkingTrace component. A string is
   *  split into one step per line; an array of ThinkingStep objects gives you
   *  tool, read and write steps with system marks. */
  thinking?: string | import("../ThinkingTrace/ThinkingTrace").ThinkingStep[];
  /** Header label on the trace. Default "Show thinking". @default "Show thinking" */
  thinkingLabel?: string;
  /** Start the trace expanded. @default false */
  defaultThinkingOpen?: boolean;
  /** Adds the icon-only replay button to the trace header. */
  onReplayThinking?: () => void;

  /** Model name shown in the header. */
  model?: string;
  /** Elapsed time, e.g. "4.2s". */
  duration?: string;
  /** Token readout, e.g. "1,284 tokens". */
  tokens?: string;

  /** Failure message for `status: "error"`. */
  error?: string;
  /** Header line while generating. Default "Thinking…". @default "Thinking…" */
  stage?: string;
  /** Optional step checklist shown above the skeleton. @default [] */
  stages?: (string | AIResponseStage)[];

  /** Sources the answer rests on, shown as numbered chips under the answer.
   *  A string is the label; an object adds a hover `note` and an optional `href`. @default [] */
  citations?: (string | { label: string; note?: string; href?: string })[];

  /** Adds a Stop button while generating. */
  onStop?: () => void;
  /** Adds Regenerate (done) / Retry (error). */
  onRetry?: () => void;
  /** Adds a Copy button under the answer. */
  onCopy?: () => void;
  /** Adds thumbs up / down feedback buttons. Called with "up", "down", or
   *  null when the user clears their vote. */
  onFeedback?: (vote: "up" | "down" | null) => void;
  /** Hide the Copy/Regenerate row. Default true (shown). @default true */
  showActions?: boolean;
  style?: React.CSSProperties;
}
export declare function AIResponse(props: AIResponseProps): React.JSX.Element;
