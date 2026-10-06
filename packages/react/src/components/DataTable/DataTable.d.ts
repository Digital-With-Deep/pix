import type React from "react";
export interface DataTableColumn<Row = any> {
  /** Row property this column reads. Also its React key. */
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  /** Adds the sort affordance and enables asc → desc → off cycling on click. */
  sortable?: boolean;
  /** Sort numerically and render with tabular figures. */
  numeric?: boolean;
  /** Render the cell in primary ink at 600 weight (identity columns). */
  strong?: boolean;
  /** Custom cell renderer. Receives the whole row. */
  render?: (row: Row) => React.ReactNode;
}

export interface DataTableFilter {
  /** Row property this dropdown filters on. */
  key: string;
  options: string[];
  /** Label for the pass-through option. Default "All". @default "All" */
  allLabel?: string;
}

export interface DataTableProps<Row = any> {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Number of placeholder rows while `loading`. Default 5. @default 5 */
  skeletonRows?: number;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Free-text filter across every column. Default true. @default true */
  searchable?: boolean;
  /** @default "Filter rows…" */
  searchPlaceholder?: string;
  /** Column dropdown filters shown in the toolbar. @default [] */
  filters?: DataTableFilter[];
  /** Sort applied on first render. */
  initialSort?: { key: string; dir: "asc" | "desc" };
  /** Toolbar title shown left of the filter controls. */
  caption?: string;
  /** Show the "n of m rows" readout. Default true. @default true */
  rowCount?: boolean;
  /** @default "No rows match these filters." */
  emptyMessage?: string;
  onRowClick?: (row: Row) => void;
  style?: React.CSSProperties;
}
export declare function DataTable<Row = any>(props: DataTableProps<Row>): React.JSX.Element;
