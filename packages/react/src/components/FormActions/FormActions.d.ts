import type React from "react";
export interface FormActionsProps {
  /** The buttons — primary last. */
  children: React.ReactNode;
  /** Left-hand text: "3 fields need attention", "Unsaved changes", "Saved 2 minutes ago". */
  summary?: React.ReactNode;
  /** Alias of `summary`. */
  status?: React.ReactNode;
  /** `claim` renders the summary as an alert in red; `truth` in green. */
  tone?: "neutral" | "claim" | "truth";
  /** `auto` (default) pins the row to whichever viewport edge the form's end is beyond; `static` never pins. */
  position?: "auto" | "static";
  style?: React.CSSProperties;
}
/**
 * The action row of a long form. Renders once at the form's end; while that end is scrolled out of view the same row is
 * pinned to the bottom edge (end still below) or the top edge (reader went past it), inside the nearest scrolling container.
 */
export declare function FormActions(props: FormActionsProps): React.JSX.Element;
