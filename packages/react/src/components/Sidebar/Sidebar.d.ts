import type React from "react";

export interface SidebarItem {
  /** Stable id reported to `onNavigate` and matched against `activeKey`. Defaults to the label when it is a string. */
  key?: string;
  label: React.ReactNode;
  /** SVG path `d` for a 2px-stroke leading icon (Heroicons outline). Shown on top-level items. */
  iconPath?: string;
  /** Trailing count or pill. */
  badge?: React.ReactNode;
  /** Render a muted uppercase section label instead of a selectable row. */
  heading?: boolean;
  /** Child items — rendered as a smoothly animated, collapsible submenu. */
  items?: SidebarItem[];
  /** Start this group expanded. @default false */
  defaultOpen?: boolean;
  /** Render the leaf as a link. Ignored when the item has children (it becomes a toggle). */
  href?: string;
  disabled?: boolean;
  /** Fired when this leaf is chosen. */
  onSelect?: () => void;
}

export interface SidebarProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** The navigation tree. An item with `items` expands into an animated submenu; one with `heading` is a section label. */
  items: SidebarItem[];
  /** Brand / workspace / search area pinned to the top. */
  header?: React.ReactNode;
  /** Account / settings area pinned to the bottom, above a divider. */
  footer?: React.ReactNode;
  /** Key of the active item. Controlled — omit to let Sidebar track its own selection. */
  activeKey?: string;
  /** Initial active key when uncontrolled. */
  defaultActiveKey?: string;
  /** Fired when a leaf item is chosen, with its key and the item. */
  onNavigate?: (key: string, item: SidebarItem) => void;
  /** Fixed width in px. @default 248 */
  width?: number;
  style?: React.CSSProperties;
}

/**
 * App navigation rail: icon rows, section headings, active state, and nested
 * groups that expand into smoothly animated submenus. `header`/`footer` are
 * free slots for the brand, a search field and the account area.
 */
export declare function Sidebar(props: SidebarProps): React.JSX.Element;
