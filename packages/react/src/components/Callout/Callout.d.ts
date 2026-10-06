import type React from "react";
export interface CalloutProps {
  /** `info` teaches (cost, what a field expects); `note` is neutral context; `warn`/`claim` need attention; `truth` confirms. @default "info" */
  tone?: "info" | "note" | "warn" | "truth" | "claim";
  /** `false` hides the glyph; a name (`info` | `note` | `warn` | `check` | `spark`) overrides the tone's default. */
  icon?: false | "info" | "note" | "warn" | "check" | "spark";
  title?: React.ReactNode;
  children?: React.ReactNode;
  body?: React.ReactNode;
  /** A trailing link or small button. */
  action?: React.ReactNode;
  /** @default false */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function Callout(props: CalloutProps): React.JSX.Element;
