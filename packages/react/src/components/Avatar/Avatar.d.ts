import type React from "react";
export interface AvatarProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Image URL. Falls back to `iconPath`, then initials. */
  src?: string;
  /** Full name — drives initials, tooltip and alt text. */
  name?: string;
  /** Override the derived initials. */
  initials?: string;
  /** SVG path `d` for a glyph fallback (a bot, an org, a system). */
  iconPath?: string;
  /** Named step or an explicit pixel diameter. Default `md` (40). */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Fill for the initials/icon fallback. */
  tone?: "neutral" | "accent" | "info" | "warning" | "danger" | "solid";
  /** Rounded square instead of a circle — use for orgs, agents and systems. */
  square?: boolean;
  /** Presence dot in the lower-right corner. */
  status?: "online" | "away" | "busy" | "offline";
  /** Accent ring — marks the active or selected identity. */
  ring?: boolean;
  /** Tooltip. Defaults to `name`. */
  title?: string;
  style?: React.CSSProperties;
}
export declare function Avatar(props: AvatarProps): React.JSX.Element;

export interface AvatarGroupProps {
  /** Members — `AvatarProps` objects or plain name strings. */
  avatars?: (AvatarProps | string)[];
  /** How many to show before collapsing into a +N tile. Default 4. */
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  square?: boolean;
  /** Overlap in px. Defaults to 30% of the avatar size. */
  overlap?: number;
  tone?: AvatarProps["tone"];
  style?: React.CSSProperties;
}
export declare function AvatarGroup(props: AvatarGroupProps): React.JSX.Element;
