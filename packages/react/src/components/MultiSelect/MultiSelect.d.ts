import type React from "react";
export interface MultiSelectOption {
  value: string;
  label: string;
  /** One line under the label. Tiles show it in full; the dropdown truncates. */
  description?: React.ReactNode;
  /** Right-aligned monospace detail — a count, a version. */
  meta?: string;
  /** Section heading in the dropdown; options with the same group must be adjacent. */
  group?: string;
  /** Extra words the search matches on. */
  keywords?: string[];
  icon?: React.ReactNode;
  /** Two-letter glyph tile, or `{ text, color }`. */
  tile?: string | { text: string; color?: string };
  disabled?: boolean;
}
export interface MultiSelectProps {
  options: MultiSelectOption[];
  /** Selected values. */
  value?: string[];
  onChange?: (value: string[], toggled?: MultiSelectOption) => void;
  /**
   * `tiles` — selectable cards with a check badge, for 2–6 choices that need explaining (an onboarding screen).
   * `dropdown` — a searchable combobox with chips, for long lists (tags, agents, controls).
   */
  variant?: "tiles" | "dropdown";
  label?: string;
  hint?: React.ReactNode;
  /** Shown instead of the hint, in claim red. */
  error?: React.ReactNode;
  disabled?: boolean;
  /** Fixed tile columns; omit for auto-fill at `minTile` px. */
  columns?: number;
  minTile?: number;
  /** Selection limit; the remaining options disable once reached and the count reads `n/max`. */
  max?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  emptyMessage?: string;
  maxHeight?: number;
  /** Chips shown in the trigger before collapsing to `+N`. */
  maxChips?: number;
  /** Extra footer content in the dropdown, e.g. a "Create tag" link. */
  footer?: React.ReactNode;
  selectAllLabel?: string;
  clearLabel?: string;
  /** Skeleton in place of the control while options load. */
  loading?: boolean;
  style?: React.CSSProperties;
}
export declare function MultiSelect(props: MultiSelectProps): React.JSX.Element;
