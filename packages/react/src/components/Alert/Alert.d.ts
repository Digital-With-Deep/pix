import type React from "react";
export interface AlertProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /**
   * `inverse` — the dark bar carrying the reading a reviewer should leave with.
   * `fault` — authored fault, benchmarking unavailable, stated scope limitation.
   * `claim` — the agent's claim or a failed verdict. `truth` — objective met.
   */
  tone?: "inverse" | "fault" | "claim" | "truth" | "neutral";
  /** Headline. Written as a finding, not a label. */
  title?: string;
  /** Body copy. `children` wins over `body`. */
  body?: React.ReactNode;
  children?: React.ReactNode;
  /**
   * `true` for the default circled alert glyph, or a name from the built-in set
   * (`alert` | `warn` | `info` | `check`), or raw SVG path data.
   */
  icon?: boolean | string;
  /** Monospace citation line under the body, e.g. a PCAOB paragraph reference. */
  citation?: React.ReactNode;
  /** Buttons, right-aligned and wrapping. Use `AlertAction` for correct styling. */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Alert(props: AlertProps): React.JSX.Element;

export interface AlertActionProps {
  /** Match the parent Alert's tone so the button reads correctly against it. */
  tone?: "inverse" | "neutral";
  onClick?: () => void;
  children?: React.ReactNode;
}
export declare function AlertAction(props: AlertActionProps): React.JSX.Element;
