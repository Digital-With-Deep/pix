import type React from "react";
export type PlanStepStatus = "pending" | "running" | "done" | "skipped" | "failed";
export interface PlanStep {
  /** Stable id, used as the row key. */
  id: string;
  /** What the agent will do, in one plain line. */
  label: string;
  /** A second line of context: the system it touches, the rule it follows. */
  detail?: string;
  /** Progress of this step. Ignored while the plan is `proposed`. @default "pending" */
  status?: PlanStepStatus;
  /** Smaller steps nested under this one, numbered 2.1, 2.2 and so on. */
  substeps?: PlanStep[];
}
export interface PlanViewProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** Heading in the card's top bar. @default "Plan" */
  title?: string;
  /** The steps, in order. @default [] */
  steps?: PlanStep[];
  /** `proposed` shows numbered steps and the three actions; `running` marks the current step with a pulsing marker; `done` and `failed` add a summary line. @default "proposed" */
  status?: "proposed" | "running" | "done" | "failed";
  /** Time spent so far, already formatted, such as "1m 12s". Shown in monospace while running and in the summary. */
  elapsed?: string;
  /** Replaces the generated summary line once the plan is done or failed. */
  summary?: React.ReactNode;
  /** Primary action while proposed: let the agent run the plan. */
  onProceed?: () => void;
  /** Secondary action while proposed: change the plan before it runs. */
  onEditPlan?: () => void;
  /** Quiet action while proposed: the person takes the task back and does it themselves. */
  onTakeOver?: () => void;
  /** Label of the primary action. @default "Proceed" */
  proceedLabel?: string;
  /** Label of the edit action. @default "Edit plan" */
  editLabel?: string;
  /** Label of the take-over action. @default "Do it myself" */
  takeOverLabel?: string;
  style?: React.CSSProperties;
}
/** Shows an agent's plan before it acts, with Proceed, Edit plan and Do it myself, then live progress step by step and a summary when it finishes. */
export declare function PlanView(props: PlanViewProps): React.JSX.Element;
