import type React from "react";
export type PatternSeverity = "high" | "medium" | "low" | "info";
export type PatternStatus = "open" | "investigating" | "closed" | "duplicate";
export type PatternImpactUnit = "traces" | "users" | "sessions";
export interface PatternImpact {
  /** Affected traces in the measurement window. */
  traces?: number;
  /** Affected end users. Needs a user ID field on the traces. */
  users?: number;
  /** Affected sessions (conversations). Needs a session ID field on the traces. */
  sessions?: number;
  /** Share of all traffic in the window, 0 to 1. Shown as a percentage next to the trace count. */
  share?: number;
  /** The counts are an estimate from a sample; shown with a leading "~". */
  estimated?: boolean;
  /** Start and end of the measurement window: ISO-8601 strings or epoch milliseconds. */
  from?: string | number;
  to?: string | number;
}
export interface Pattern {
  /** Stable id, passed to `onSelect` and used as the row key. */
  id: string;
  /** Short name of the recurring behaviour: "Refund tool retried after timeout". */
  name: string;
  /** One or two sentences on what happens and who it affects. */
  summary?: string;
  /** Omit for older findings recorded without a severity; they sort and filter as "Unrated" (treated as low). */
  severity?: PatternSeverity;
  /** @default "open" */
  status?: PatternStatus;
  categories?: string[];
  /** Name of the discovery rule that found it. */
  rule?: string;
  /** When the behaviour was first and last observed: ISO-8601 strings or epoch milliseconds. */
  firstSeen?: string | number;
  lastSeen?: string | number;
  impact?: PatternImpact;
  /** Matches per recent period, oldest first, drawn as a small bar trend. */
  trend?: number[];
  /** A closed pattern whose behaviour came back. */
  reopened?: boolean;
  /** Severity was raised since it was first recorded. */
  severityRaised?: boolean;
}
export interface PatternListProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** The patterns, in any order. @default [] */
  patterns?: Pattern[];
  /** Id of the open pattern; its row is marked with `aria-current`. */
  selectedId?: string;
  /** Called with the pattern id when a row is pressed. */
  onSelect?: (id: string) => void;
  /** Uppercase heading. @default "Patterns" */
  title?: string;
  /** "Now" for the relative last-seen times (ISO string, epoch milliseconds or Date). Defaults to the newest `lastSeen`. */
  now?: string | number | Date;
  /** Which impact count the Impact column shows. Falls back to traces for a pattern without that count. @default "traces" */
  impactUnit?: PatternImpactUnit;
  /** Initial search text, matched against name, summary, categories, rule and id. @default "" */
  defaultQuery?: string;
  /** Initial severity filter. @default "all" */
  defaultSeverity?: "all" | PatternSeverity | "unrated";
  /** Initial status filter. Choosing a status shows it even when closed patterns are hidden. @default "all" */
  defaultStatus?: "all" | PatternStatus;
  /** Initial grouping. Grouping by status shows every status. @default "none" */
  defaultGroupBy?: "none" | "severity" | "status" | "category" | "rule";
  /** Hide closed and duplicate patterns until the reader asks for them. @default true */
  defaultHideClosed?: boolean;
  /** Row order: by severity then impact, by impact, or by most recently seen. @default "severity" */
  sort?: "severity" | "impact" | "lastSeen";
  /** Shown when the filters match nothing. @default "No patterns match these filters." */
  emptyLabel?: string;
  style?: React.CSSProperties;
}
/** A triage list of recurring problems found in traces: severity, impact, trend, last seen and status, with search, filters and grouping. */
export declare function PatternList(props: PatternListProps): React.JSX.Element;
