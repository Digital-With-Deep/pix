import type React from "react";
export interface ButtonProps {
  /** Visual treatment. `primary` = solid zinc-900, `filled` = emerald action. */
  variant?: "primary" | "filled" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  /** SVG path `d` for a leading 2px-stroke outline icon (Heroicons outline). */
  iconPath?: string;
  /** Label. Omit for an icon-only square button. */
  children?: React.ReactNode;
  /** In-flight: swaps the leading icon for a spinner and blocks clicks. */
  loading?: boolean;
  /** Label to show while `loading`, e.g. "Saving…". Defaults to the normal label. */
  loadingLabel?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): React.JSX.Element;
