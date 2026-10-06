import type React from "react";
export interface TabItem {
  /** Stable value reported to `onChange`. Falls back to `label`. */
  value?: string;
  label: string;
  /** Optional count pill trailing the label. */
  count?: number;
  /** Small emerald status dot (underline variant only). */
  dot?: boolean;
  disabled?: boolean;
}

export interface TabsProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Tab set — plain strings or `TabItem` objects. */
  tabs: (string | TabItem)[];
  /** Controlled active value. Omit to let Tabs manage its own state. */
  value?: string;
  /** Initial value when uncontrolled. Defaults to the first tab. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** `underline` for page-level section nav; `segmented` for in-card view toggles. @default "underline" */
  variant?: "underline" | "segmented";
  /** @default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): React.JSX.Element;
