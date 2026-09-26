import type React from "react";
export interface EmptyStateProps {
  /** One of the built-in glyphs, or your own node. */
  icon?: "plus" | "search" | "lock" | "inbox" | "plug" | "warn" | "check" | "file" | React.ReactNode;
  /** Tile color. `accent` for a first-use invitation, `fault` for “not available”, `claim` for an error, `neutral` otherwise. */
  tone?: "neutral" | "accent" | "fault" | "claim";
  /** States the situation, not the absence: “No model providers yet”, not “Empty”. */
  title: React.ReactNode;
  /** Why it is empty and what happens next. One or two sentences. */
  body?: React.ReactNode;
  /** Buttons. A first-use state has exactly one primary action; a no-results state offers “Clear filters”. */
  actions?: React.ReactNode;
  /** Monospace line for a code or count. */
  meta?: React.ReactNode;
  /** Row layout for inside a card or a table body. */
  compact?: boolean;
  /** Dashed border. Default true; turn off inside another bordered container. */
  bordered?: boolean;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): React.JSX.Element;
