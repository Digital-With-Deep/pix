import type React from "react";
export interface BadgeProps {
  /** Semantic tone. Default `neutral` (zinc) — accent/success reserved for real state. */
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "outline";
  /** Show a leading status dot in the current text color. */
  dot?: boolean;
  /** `sm` (default) — 11px status pill. `md` — 12px entity chip; pair with `outline` for the bordered chip. */
  size?: "sm" | "md";
  /** Cap the width — the label ellipses and the full text becomes the tooltip. */
  maxWidth?: number | string;
  /** Explicit tooltip. Defaults to the label text when `maxWidth` is set. */
  title?: string;
  /** Renders a trailing × — makes the chip closeable. */
  onRemove?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): React.JSX.Element;
