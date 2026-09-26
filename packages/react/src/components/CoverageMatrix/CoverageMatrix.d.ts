import type React from "react";
export type CoverageState = "tested" | "stale" | "none" | "na";

export interface CoverageMatrixRow {
  /** Row identity, rendered monospace (e.g. an objective code). */
  label: string;
  /** Short description shown after the code. */
  description?: React.ReactNode;
  /** One state per assertion column, in `assertions` order. */
  cells: CoverageState[];
}

export interface CoverageMatrixProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Column headers — the assertion abbreviations across the top. */
  assertions: string[];
  rows: CoverageMatrixRow[];
  /** Show the state key above the grid. Default true. */
  legend?: boolean;
  legendOrder?: CoverageState[];
  style?: React.CSSProperties;
}
export declare function CoverageMatrix(props: CoverageMatrixProps): React.JSX.Element;
