import type React from "react";
export interface SelectOption {
  value: string;
  label: string;
  /** Second line under the label. Searchable. */
  description?: string;
  /** Short right-aligned qualifier in mono — a code, a count, a status. Searchable. */
  meta?: string;
  /** A 16–20px node: an inline SVG or an <img>. Wins over `tile`. */
  icon?: React.ReactNode;
  /** Letter tile instead of an icon: "US", or `{ text, color }`. Without a color it uses the neutral inverse tile. */
  tile?: string | { text: string; color?: string };
  /** Consecutive options with the same group get one heading. Keep grouped options adjacent. */
  group?: string;
  /** Extra search terms that are not shown. */
  keywords?: string[];
  disabled?: boolean;
}
export interface SelectProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  options: SelectOption[];
  value?: string | null;
  onChange?: (value: string, option: SelectOption) => void;
  /** @default "Select…" */
  placeholder?: string;
  /** @default "Search…" */
  searchPlaceholder?: string;
  /** Default true. Turn off for five or fewer plain options. @default true */
  searchable?: boolean;
  /** Uppercase field label, wired to the control. */
  label?: string;
  hint?: React.ReactNode;
  /** Replaces the hint and turns the border red. */
  error?: React.ReactNode;
  /** @default false */
  disabled?: boolean;
  /** Shown with the query when the search has no results. Default "Nothing matches". @default "Nothing matches" */
  emptyMessage?: string;
  /** Popover width; defaults to the trigger's width (min 220px). */
  menuWidth?: number | string;
  /** Scroll height of the option list. Default 280. @default 280 */
  maxHeight?: number;
  /** Pinned under the list — an "Add entity" action, a link to manage the list. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): React.JSX.Element;
