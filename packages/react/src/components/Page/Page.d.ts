import type React from "react";
import type { AvatarProps } from "../Avatar/Avatar";

export interface PageProps {
  /** Avatar element, `AvatarProps` object, or a name string. */
  avatar?: React.ReactNode | AvatarProps | string;
  title?: React.ReactNode;
  /** Secondary line under the title. */
  secondary?: React.ReactNode;
  /** Right-aligned action row — wraps under the title on narrow viewports. */
  actions?: React.ReactNode;
  /** Badges or small facts rendered under the secondary line. */
  meta?: React.ReactNode;
  /** Full-width slot at the bottom of the header — tabs, search, filters. */
  below?: React.ReactNode;
  /** Content column width. Default 1200. */
  maxWidth?: number | string;
  /** Header + content padding. Default 24. */
  padding?: number;
  /** Pin the header while the page scrolls. */
  sticky?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Page(props: PageProps): React.JSX.Element;
