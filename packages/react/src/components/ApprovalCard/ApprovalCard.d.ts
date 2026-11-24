import type React from "react";
export interface ApprovalChange {
  /** Human label for the field, e.g. "Refund amount". */
  field: string;
  /** Stable key passed back in `onEdit`. Defaults to `field`. */
  key?: string;
  /** Current value. Omit or `null` for a value that does not exist yet. */
  before?: unknown;
  /** Proposed value. */
  after?: unknown;
  /** Allow the reviewer to change this value in Edit mode. @default true */
  editable?: boolean;
}
export interface ApprovalCardProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Short headline, e.g. "Issue a refund". Falls back to `action`. */
  title?: React.ReactNode;
  /** The proposed action in plain words. Shown under the title when both are given. */
  action?: React.ReactNode;
  /** The agent that proposed it, shown in monospace. */
  agent?: string;
  /** What the action touches, e.g. an order or account id, shown in monospace. */
  target?: string;
  /** The agent's reason, shown as "Why: …". */
  reason?: React.ReactNode;
  /** Before and after values. Rendered as a three-column diff table. @default [] */
  changes?: ApprovalChange[];
  /** Sets the left rule and the risk pill. @default "medium" */
  risk?: "low" | "medium" | "high" | "critical";
  /** Shows "Can be undone" or "Cannot be undone". Omit to hide. */
  reversible?: boolean;
  /** Evidence chips: a label, or `{ label, href }`. @default [] */
  evidence?: (string | { label: string; href?: string })[];
  /** ISO time or Date after which the request lapses. Shows a live countdown; once past, the card renders as expired. */
  expiresAt?: string | Date;
  /** `pending` shows the actions; the others render the outcome. @default "pending" */
  status?: "pending" | "approved" | "rejected" | "expired";
  /** Who decided, for resolved cards. */
  decidedBy?: string;
  /** When they decided, for resolved cards (shown as given). */
  decidedAt?: string;
  /** The reason given on a rejected card. */
  rejectReason?: string;
  /** Called when the reviewer approves the proposal as it stands. */
  onApprove?: () => void;
  /** Called with the reason (or undefined) once the reviewer confirms a rejection. */
  onReject?: (reason?: string) => void;
  /** Enables Edit. Called with `{ [key]: newValue }` when the reviewer approves with edits. */
  onEdit?: (edits: Record<string, string>) => void;
  /** Make the rejection reason required. @default false */
  requireRejectReason?: boolean;
  /** Label of the approve button. @default "Approve" */
  approveLabel?: string;
  style?: React.CSSProperties;
}
/** A proposed agent action waiting on a person: what changes, the risk, whether it can be undone, and Approve, Edit or Reject. */
export declare function ApprovalCard(props: ApprovalCardProps): React.JSX.Element;
