import type React from "react";
export interface GettingStartedStep {
  key?: string;
  /** Written as an action: "Add the legal entities in scope". */
  label: string;
  /** Derive this from real state on the server, never from a click on the card. */
  done: boolean;
  /** Anything else you need back in `onOpen`, e.g. an href. */
  [extra: string]: unknown;
}
export interface GettingStartedProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  steps: GettingStartedStep[];
  /** Heading while steps remain. Defaults to "Finish setting up". */
  title?: string;
  /** Called with the step when an unfinished row is activated. Route to where the work is done. */
  onOpen?: (step: GettingStartedStep) => void;
  /** Shows "Hide for now". Offer a way back (Settings) when you use it. */
  onDismiss?: () => void;
  style?: React.CSSProperties;
}
export declare function GettingStarted(props: GettingStartedProps): React.JSX.Element;
