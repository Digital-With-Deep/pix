import type React from "react";
export interface AuditEvent {
  /** Stable unique id — used in the URL (`e=`) and as the row key. */
  id: string;
  /** Event time: epoch milliseconds or an ISO-8601 string. */
  ts: number | string;
  /** One line describing what happened; shown in the Event column and the detail header. */
  message: string;
  agent?: string;
  /** Non-human identity the agent acted under (service account). */
  identity?: string;
  kind?: "read" | "write" | "decision" | "tool_call" | "auth" | "escalation" | string;
  /** System accessed, e.g. "SAP S/4HANA". */
  system?: string;
  resource?: string;
  action?: string;
  outcome?: "ok" | "flagged" | "denied" | "error" | string;
  entity?: string;
  control?: string;
  run_id?: string;
  trace_id?: string;
  latency_ms?: number;
  /** Why the agent decided what it did — rendered as its own block in the detail panel. */
  rationale?: string;
  /** Any further fields are searchable, filterable and shown in the detail panel. */
  [field: string]: unknown;
}

export interface AuditFilter { field: string; op?: "is" | "is_not"; values: string[]; }
export interface AuditFacet { key: string; label: string; }
export interface AuditColumn {
  key: string; label: string;
  /** Fixed width in px; omit and set `flex` for the one elastic column. */
  width?: number; flex?: boolean; align?: "left" | "right";
  render?: (event: AuditEvent) => React.ReactNode;
}
export type AuditRange = "15m" | "1h" | "24h" | "7d" | "30d" | "all" | "custom";
export interface AuditLogState {
  query: string; filters: AuditFilter[]; range: AuditRange; sort: "asc" | "desc";
  /** Id of the open event. */
  event?: string;
  /** Custom window (epoch ms), set when a histogram bar is zoomed. */
  from?: number; to?: number;
}

export interface AuditLogProps {
  /** The events to search. Indexed once per array identity — memoize it. */
  events: AuditEvent[];
  /** Fields offered as facets in the left rail. Defaults: agent, kind, system, outcome, entity, control. */
  facets?: AuditFacet[];
  /** Result columns after Time. */
  columns?: AuditColumn[];
  defaultQuery?: string;
  defaultFilters?: AuditFilter[];
  defaultRange?: AuditRange;
  defaultSort?: "asc" | "desc";
  defaultEvent?: string;
  /** "Now" for relative ranges (epoch ms or ISO). Defaults to the newest event. */
  now?: number | string;
  /** Overall height in px. The result list scrolls inside it. Default 680. */
  height?: number;
  title?: string;
  /** Read the initial state from, and mirror every change into, the address bar. Default false. */
  syncUrl?: boolean;
  /** Origin + path used when building the copied link. Defaults to the current page. */
  baseUrl?: string;
  /** Fired on every state change with the encoded query string and the hit count. */
  onStateChange?: (state: AuditLogState & { params: string; hits: number }) => void;
  onCopyLink?: (url: string) => void;
  /** Shows the Export button; receives the current hits. */
  onExport?: (hits: AuditEvent[]) => void;
  onOpenEvent?: (event: AuditEvent) => void;
  /** With no events yet: a skeleton of the workbench. With events: a “loading…” hint while more arrive. */
  loading?: boolean;
  style?: React.CSSProperties;
}

export declare function AuditLog(props: AuditLogProps): React.JSX.Element;

/** Encode/decode the search state as URL params: `q`, `f=field:is:a|b` (repeatable), `t`, `from`, `to`, `s`, `e`. */
export declare const AuditLogParams: {
  encode(state: Partial<AuditLogState>): string;
  parse(search: string): AuditLogState;
};
