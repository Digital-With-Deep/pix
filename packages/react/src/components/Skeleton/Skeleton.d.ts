import type React from "react";
export interface SkeletonProps {
  /** `block` (default), `text` (12px lines; the last is shorter), or `circle`. */
  variant?: "block" | "text" | "circle";
  width?: number | string;
  height?: number | string;
  /** For `text`: how many lines. */
  lines?: number;
  gap?: number;
  /** Accessible name of the region. Default "Loading". */
  label?: string;
  style?: React.CSSProperties;
  /** Wrap your own composition of shapes in one `role="status"` region. */
  children?: React.ReactNode;
}
/**
 * Placeholder shapes shown while data loads. Every data component also accepts `loading`, which renders the
 * matching preset in its own footprint; use these directly for page-level or custom layouts.
 * Shimmer respects `prefers-reduced-motion`.
 */
export declare function Skeleton(props: SkeletonProps): React.JSX.Element;
export declare namespace Skeleton {
  function Table(props: { columns?: number; rows?: number; caption?: boolean; style?: React.CSSProperties }): React.JSX.Element;
  function Metric(props: { style?: React.CSSProperties }): React.JSX.Element;
  function Form(props: { fields?: number; columns?: number; footer?: boolean; style?: React.CSSProperties }): React.JSX.Element;
  function List(props: { rows?: number; glyph?: boolean; twoLine?: boolean; style?: React.CSSProperties }): React.JSX.Element;
  function Field(props: { label?: boolean; style?: React.CSSProperties }): React.JSX.Element;
  function Chart(props: { bars?: number; height?: number; style?: React.CSSProperties }): React.JSX.Element;
  function Panel(props: { lines?: number; style?: React.CSSProperties }): React.JSX.Element;
  /** Breadcrumb, title, lede, a metric row and a table — the shape of most console pages. */
  function Page(props: { metrics?: number; table?: boolean; form?: boolean; style?: React.CSSProperties }): React.JSX.Element;
}
