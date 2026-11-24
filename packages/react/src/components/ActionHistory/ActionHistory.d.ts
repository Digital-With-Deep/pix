import type React from "react";
export interface AgentAction {
  /** Stable id, passed to `onUndo` and used as the row key. */
  id: string;
  /** When the action ran: an ISO-8601 string or epoch milliseconds. Shown in UTC. */
  at: string | number;
  /** The agent that acted; shown in monospace and offered in the agent filter. */
  agent: string;
  /** What it did, as a short phrase: "Posted payment hold". */
  action: string;
  /** What it acted on, such as an invoice or ticket id; shown in monospace. */
  target?: string;
  /** `done` actions can be undone inside their window; `undone`, `failed` and `pending` cannot. */
  status: "done" | "undone" | "failed" | "pending";
  /** End of the undo window, as an ISO-8601 string or epoch milliseconds. While it is in the future a `done` action shows Undo and the time left; afterwards it shows "Locked". Omit for actions that cannot be undone. */
  undoUntil?: string | number;
  /** One more line of context under the action. */
  detail?: string;
}
export interface ActionHistoryProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** The actions, in any order; they are shown newest first. @default [] */
  actions?: AgentAction[];
  /** Called with the action id when Undo is pressed. The component does not change the action itself: update its `status` to `undone` when the undo succeeds. */
  onUndo?: (id: string) => void;
  /** Fixes the clock used for undo windows (ISO string, epoch milliseconds or Date). Omit to use the live time, updated every second while any window is open. */
  now?: string | number | Date;
  /** Uppercase heading. @default "Action history" */
  title?: string;
  /** Initial agent filter: an agent name or "all". @default "all" */
  defaultAgent?: string;
  /** Initial status filter. @default "all" */
  defaultStatus?: "all" | "done" | "undone" | "failed" | "pending";
  /** Label of the undo button. @default "Undo" */
  undoLabel?: string;
  /** Shown when the filters match nothing. @default "No actions match these filters." */
  emptyLabel?: string;
  style?: React.CSSProperties;
}
/** Lists what agents did, newest first, with an Undo button while each action's undo window is open (then "Locked"), and filters by agent and status. */
export declare function ActionHistory(props: ActionHistoryProps): React.JSX.Element;
