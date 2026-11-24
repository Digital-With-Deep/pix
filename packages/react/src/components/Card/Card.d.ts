import type React from "react";
export interface CardProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** Heading in the card header. Also names the card (`role="group"`, `aria-labelledby`). */
  title?: React.ReactNode;
  /** Supporting line under the title. */
  description?: React.ReactNode;
  /** Trailing control in the header: a small Button, Menu or Badge. */
  action?: React.ReactNode;
  /** The card body. */
  children?: React.ReactNode;
  /** Right-aligned row under the body on a subtle background, usually Buttons. */
  footer?: React.ReactNode;
  /** Heading level for `title`, so the card fits the page outline. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Body padding. `none` lets a table or list run edge to edge; the header and footer keep their gutter. @default "md" */
  padding?: "none" | "sm" | "md" | "lg";
  /** Overrides the derived role (for example `"region"` for a landmark). */
  role?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): React.JSX.Element;
