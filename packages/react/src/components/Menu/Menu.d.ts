import type React from "react";
export interface MenuItem {
  label?: string;
  /** SVG path `d` for a leading outline icon. */
  iconPath?: string;
  /** Right-aligned keyboard hint, e.g. "⌘K". */
  shortcut?: string;
  onSelect?: () => void;
  disabled?: boolean;
  /** `danger` renders destructive red. */
  tone?: "default" | "danger";
  /** Nested items — turns the row into a submenu that opens on hover. Nest up to three levels. */
  items?: MenuItem[];
  /** Renders a divider instead of an item. */
  separator?: boolean;
  /** Renders a small uppercase group heading instead of an item. */
  heading?: string;
}

export interface MenuProps {
  /** The clickable element — typically an icon-only `Button`. */
  trigger?: React.ReactNode;
  items?: MenuItem[];
  /** Which edge the panel aligns to. Default `end` (right). */
  align?: "start" | "end";
  /** Minimum panel width. Default 200. */
  width?: number;
  /** Controlled open state. Leave unset for self-managed. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: React.CSSProperties;
}
export declare function Menu(props: MenuProps): React.JSX.Element;
