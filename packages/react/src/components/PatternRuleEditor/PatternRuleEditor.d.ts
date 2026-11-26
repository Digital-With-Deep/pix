import type React from "react";
export type PatternLookBack = "3h" | "12h" | "1d" | "3d" | "7d" | "14d" | "30d";
export interface PatternRule {
  /** Set for a saved rule. Without it the editor is in "new rule" mode: the heading and the submit button say so, and Delete is hidden. */
  id?: string;
  /** Describes the rule's focus; it appears on the patterns the rule finds. */
  name: string;
  /** A filter expression selecting the traces to investigate. Empty means every trace. */
  scope?: string;
  /** Concerns to investigate, such as "Tool failures" or "User complaints". */
  watchFor?: string[];
  /** Free-text guidance: what to exclude or emphasize. */
  instructions?: string;
  /** How far back each full investigation reads. Any other value is snapped to the nearest option. @default "7d" */
  lookBack?: PatternLookBack | string;
}
export interface PatternRun {
  /** `queued` and `running` disable Run now; `done` shows the coverage counts; `error` shows `error`. */
  state: "idle" | "queued" | "running" | "done" | "error";
  /** When the rule was last checked for new traces: ISO-8601 string or epoch milliseconds. A check is not always a full investigation. */
  checkedAt?: string | number;
  /** When the last full investigation finished. */
  finishedAt?: string | number;
  tracesRead?: number;
  searches?: number;
  /** Patterns the run created, updated and closed. */
  created?: number;
  updated?: number;
  closed?: number;
  /** What the run could not cover, such as traces too large to read in full. */
  gaps?: string[];
  /** Shown when `state` is "error". */
  error?: string;
}
export interface PatternRuleEditorProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** The saved rule. The form resets whenever this object changes, so memoize it. Omit to create a rule. */
  rule?: PatternRule;
  /** Called with the edited rule when the form is submitted and the name is not empty. */
  onSave?: (rule: PatternRule) => void;
  /** Called with the draft on every edit. */
  onChange?: (rule: PatternRule) => void;
  /** Shows Run now; called with the current draft. Disabled while `run.state` is "queued" or "running". */
  onRunNow?: (rule: PatternRule) => void;
  /** Shows Delete rule on a saved rule. Confirm before deleting. */
  onDelete?: (rule: PatternRule) => void;
  /** The rule's last check and full investigation; shown under the form. */
  run?: PatternRun;
  /** "Now" for the relative run times (ISO string, epoch milliseconds or Date). Defaults to the run's own latest time. */
  now?: string | number | Date;
  /** One-press concerns offered under Watch for. @default [] */
  watchSuggestions?: string[];
  /** How many traces the scope matches in the look-back window; shown under Scope. */
  scopeMatches?: number;
  /** Placeholder showing your filter syntax. */
  scopePlaceholder?: string;
  /** Where this rule's alerts go, as a short phrase. An empty string says no destinations are configured. */
  alerts?: string;
  /** Shows Configure in the Alerts row. */
  onConfigureAlerts?: () => void;
  /** Uppercase heading. Defaults to "Pattern rule", or "New pattern rule" without a rule id. */
  title?: string;
  /** Label of the submit button. Defaults to "Save", or "Create" without a rule id. */
  saveLabel?: string;
  /** Show the rule without any editing control. @default false */
  readOnly?: boolean;
  style?: React.CSSProperties;
}
/** The editor for one discovery rule: name, trace scope, concerns to watch for, custom instructions and look-back window, with Run now and the last run's coverage. */
export declare function PatternRuleEditor(props: PatternRuleEditorProps): React.JSX.Element;
/** The look-back options as `[value, label, hours]`, shortest first. */
export declare const PATTERN_LOOK_BACKS: ReadonlyArray<readonly [PatternLookBack, string, number]>;
/** Snaps any look-back value ("5d", "36h", "2w") to the nearest listed option. */
export declare function nearestPatternLookBack(value: string): PatternLookBack;
