import type React from "react";
export interface Invariant {
  /** Invariant identifier, e.g. `arithmetic_delegated`. Always monospace. */
  name: string;
  /** `fail` reveals `detail`; `not_applicable` renders muted and is excluded from the count. */
  state: "pass" | "fail" | "not_applicable";
  /** What this invariant catches — the standing definition, shown in every state. */
  catches?: string;
  /** What happened in this run. Rendered only when the invariant failed. */
  detail?: string;
  /** Overrides the right-hand verdict word, e.g. "3 of 3" for replay_consistency. */
  observed?: string;
  /** Trace step this was decided at, e.g. "step 5". Shown in compact mode. */
  step?: string;
}

export interface InvariantPanelProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Card label. Default "Process invariants". */
  title?: string;
  /** The five invariants, in a stable order. */
  invariants: Invariant[];
  /** Run or objective the results belong to, e.g. "run #0042 · O-WHT-01". */
  scope?: string;
  /** One line per invariant — name, step reference, verdict. For side rails
   *  where the standing definitions would crowd the column. */
  compact?: boolean;
  /** Show the "not averaged" footer. Default true. */
  note?: boolean;
  style?: React.CSSProperties;
}
/**
 * Per-invariant results for one run. Deliberately has no aggregate score prop:
 * the components are the product, and an auditor tests them individually.
 */
export declare function InvariantPanel(props: InvariantPanelProps): React.JSX.Element;
