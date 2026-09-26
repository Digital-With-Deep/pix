import type React from "react";
export interface BarChartSeries {
  label: string;
  /** Bar fill. Use an emerald token for the measured series, zinc for the reference series. */
  color: string;
}

export interface BarChartGroup {
  /** Category label under the group, e.g. a month. */
  label: string;
  /** One value per series, in series order. */
  values: number[];
}

export interface BarChartProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  series: BarChartSeries[];
  data: BarChartGroup[];
  /** Small uppercase header label. */
  caption?: string;
  /** Right-aligned monospace qualifier in the header, e.g. "trailing 12 months". */
  hint?: React.ReactNode;
  /** Monospace roll-up shown right of the legend, e.g. "1,240 executed · 908 passed". */
  summary?: React.ReactNode;
  /** Plot height in px. Default 130. */
  height?: number;
  style?: React.CSSProperties;
}
export declare function BarChart(props: BarChartProps): React.JSX.Element;
