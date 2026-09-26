import type React from "react";
export interface DisclosureProps {
  title: React.ReactNode;
  /** Monospace detail on the right, e.g. "3 settings". */
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onChange?: (open: boolean) => void;
  /** `row` is a bordered bar (Advanced, Install the SDK); `plain` is a bare text toggle. */
  variant?: "row" | "plain";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Disclosure(props: DisclosureProps): React.JSX.Element;
