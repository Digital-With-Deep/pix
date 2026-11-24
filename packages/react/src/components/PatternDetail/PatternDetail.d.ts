import type React from "react";
import type { Pattern, PatternImpactUnit, PatternSeverity, PatternStatus } from "../PatternList/PatternList";

export interface PatternEvidence {
  /** Stable id; defaults to the position in the list. */
  id?: string;
  /** The trace this example comes from; shown in monospace and passed to `onOpenTrace`. */
  traceId: string;
  /** What the example shows: the problem, a retry that succeeded, or contrasting behaviour that helps explain the finding. */
  kind?: "problem" | "retry" | "contrast";
  /** One line on the example. */
  title?: string;
  /** The passage of the trace that matters, shown as preformatted text. */
  excerpt?: string;
  /** A substring of `excerpt` to mark as the highlighted passage. */
  highlight?: string;
  /** Why the highlighted passage supports the finding; revealed by "Show reason". */
  reason?: string;
  /** When the trace ran: an ISO-8601 string or epoch milliseconds. */
  at?: string | number;
}
export interface PatternCodeEvidence {
  /** Path of the source file; shown in monospace. */
  file: string;
  /** Line or range, such as "118-131". */
  lines?: string;
  /** Commit or tag the lines were read at. */
  revision?: string;
  /** How this code relates to the behaviour. */
  note?: string;
  /** Link to the file at the cited revision. Only http(s) and relative links are rendered. */
  href?: string;
}
export interface PatternImpactPoint {
  /** Period label under the bar, such as "Nov 14". */
  label: string;
  /** Matches in the period, per unit. */
  matched: Partial<Record<PatternImpactUnit, number>>;
  /** All traffic in the period, per unit. With totals on every point the chart offers percentages. */
  total?: Partial<Record<PatternImpactUnit, number>>;
}
export interface PatternModelShare {
  /** Model name; shown in monospace. */
  model: string;
  /** This model's share of the pattern's matches, 0 to 1. */
  matchShare: number;
  /** This model's share of all traffic, 0 to 1. A match share at least 1.5 times the traffic share is flagged as over-represented. */
  trafficShare: number;
}
export interface PatternActivity {
  id?: string;
  /** Who made the change: a person or an agent. */
  actor: string;
  /** What changed: "set status to Investigating". */
  text: string;
  reason?: string;
  at?: string | number;
}
export interface PatternFinding extends Pattern {
  /** What to change, or what to check when the cause is not yet supported by evidence. */
  suggestedFix?: string;
  /** Whether the evidence supports the proposed cause, or it is still a hypothesis to confirm. */
  cause?: "confirmed" | "hypothesis";
  /** Example traces behind the finding. */
  evidence?: PatternEvidence[];
  /** Source references that link the behaviour to a possible cause or a place to fix it. */
  code?: PatternCodeEvidence[];
  /** Impact per period, oldest first, drawn as a bar chart. */
  impactSeries?: PatternImpactPoint[];
  /** Per-model comparison of pattern matches against all traffic. */
  models?: PatternModelShare[];
  /** Changes to the pattern and their reasons, newest first. */
  activity?: PatternActivity[];
  /** A saved rating. While unset, the rating prompt is shown. */
  rating?: "useful" | "not_useful";
  /** For a duplicate: the id or name of the canonical pattern. */
  duplicateOf?: string;
}
export interface PatternDetailProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** The pattern to show. Without one, an empty prompt to choose a pattern. */
  pattern?: PatternFinding;
  /** Shows the Investigate button; start a deeper investigation with the pattern attached. */
  onInvestigate?: (pattern: PatternFinding) => void;
  /** Label of the investigate button. @default "Investigate" */
  investigateLabel?: string;
  /** Fired after "Copy as prompt" copies the Markdown brief, with the brief. */
  onCopyPrompt?: (markdown: string) => void;
  /** Link to this pattern. Shows the Copy link button and is included in the copied brief. */
  href?: string;
  /** Fired after Copy link copies `href`. */
  onCopyLink?: (url: string) => void;
  /** A shell command that retrieves one trace, with `{{trace}}` where the trace id goes. Added to the copied brief once per evidence trace. */
  traceCommand?: string;
  /** Makes Status editable. Called once the reader applies the change, with their optional reason. Update `pattern.status` in response. */
  onStatusChange?: (status: PatternStatus, reason?: string) => void;
  /** Makes Severity editable. Called once the reader applies the change, with their optional reason. */
  onSeverityChange?: (severity: PatternSeverity, reason?: string) => void;
  /** Makes Categories editable; called with the full new list on every change. */
  onCategoriesChange?: (categories: string[]) => void;
  /** Categories offered when editing. The pattern's own categories are always included. */
  categoryOptions?: string[];
  /** Shows "Is this pattern useful?" while the pattern has no rating. Called with the rating and an optional comment. */
  onRate?: (rating: "useful" | "not_useful", comment?: string) => void;
  /** Makes each evidence trace id a button; open the trace beside the pattern. */
  onOpenTrace?: (evidence: PatternEvidence) => void;
  /** Makes each bar of the impact chart a button; open the matching logs for that period. */
  onOpenPeriod?: (point: PatternImpactPoint, unit: PatternImpactUnit) => void;
  /** Hide every editing control: properties show as text and the rating prompt is not offered. @default false */
  readOnly?: boolean;
  /** Which impact count the header line shows. Falls back to traces. @default "traces" */
  impactUnit?: PatternImpactUnit;
  style?: React.CSSProperties;
}
/** One recurring problem in full: summary, suggested fix, impact over time, per-model comparison, trace and code evidence, editable properties, rating and activity. */
export declare function PatternDetail(props: PatternDetailProps): React.JSX.Element;
/** Builds the Markdown brief that "Copy as prompt" copies: the finding, impact, suggested fix, evidence, source references and, with `traceCommand`, a command per trace. */
export declare function patternPrompt(pattern: PatternFinding, options?: { url?: string; traceCommand?: string }): string;
