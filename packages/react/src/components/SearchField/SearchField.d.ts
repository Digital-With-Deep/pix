import type React from "react";
export interface SavedSearchItem {
  /** Display name shown in the dropdown and as the active chip. */
  name: string;
  /** The query string this saved search stands for. */
  query?: string;
  /** Optional result count shown right-aligned. */
  count?: number;
}

export interface SearchFieldProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Controlled query. Omit to let the field manage its own state. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fired on Enter. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** Saved searches listed in the dropdown — strings or `SavedSearchItem` objects. */
  savedSearches?: (string | SavedSearchItem)[];
  /** Name of the currently applied saved search; renders as an emerald chip. */
  activeSaved?: string;
  onSelectSaved?: (saved: SavedSearchItem) => void;
  /** Enables the "Save this search" row. Omit to hide it. */
  onSaveSearch?: (query: string) => void;
  /** Enables per-row remove buttons. Omit to hide them. */
  onDeleteSaved?: (saved: SavedSearchItem) => void;
  /** Keyboard hint shown when the field is empty. Pass `null` to hide. */
  shortcut?: string | null;
  width?: number | string;
  style?: React.CSSProperties;
}
export declare function SearchField(props: SearchFieldProps): React.JSX.Element;
