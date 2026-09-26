import type React from "react";
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  /** Stable key used in the URL (`f=<key>:is:a|b`). */
  key: string;
  /** Label shown in the field list and on the chip. */
  label: string;
  /** Selectable values — strings or `FilterOption` objects. */
  options?: (string | FilterOption)[];
}

export interface AppliedFilter {
  field: string;
  op?: "is" | "is_not";
  values: string[];
}

export interface SavedView {
  name: string;
  /** Renders the shared-with-org glyph on the pill. */
  shared?: boolean;
  query?: string;
  filters?: AppliedFilter[];
}

export interface SavedSearchProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Filterable fields and their options. */
  fields: FilterField[];
  /** Controlled applied filters. Omit to let the component own them. */
  filters?: AppliedFilter[];
  defaultFilters?: AppliedFilter[];
  onFiltersChange?: (filters: AppliedFilter[]) => void;
  /** Controlled free-text query. */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Fired on Enter with the full search state and its bookmarkable URL. */
  onSubmit?: (state: { query: string; filters: AppliedFilter[]; url: string }) => void;
  /** Saved views rendered as pills after "All". */
  views?: SavedView[];
  /** Name of the active view; `undefined` selects "All". */
  activeView?: string;
  onSelectView?: (view: SavedView | null) => void;
  /** Enables the "Save view" button and dialog. Omit to hide it. */
  onSaveView?: (view: SavedView & { url: string }) => void;
  /** Enables "Delete view" in each pill's menu. */
  onDeleteView?: (view: SavedView) => void;
  placeholder?: string;
  /** Origin + path used when building shareable URLs. Defaults to the current page. */
  baseUrl?: string;
  /** Mirror the search state into the address bar via replaceState. Default true. */
  syncUrl?: boolean;
  onCopyLink?: (url: string) => void;
  /** Node rendered to the right of the field — typically a primary button. */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function SavedSearch(props: SavedSearchProps): React.JSX.Element;

/** Encode/decode search state as URL query params (`q`, `view`, `f`). */
export declare const SavedSearchParams: {
  encode(state: { query?: string; filters?: AppliedFilter[]; view?: string }): string;
  parse(search: string): { query: string; view?: string; filters: AppliedFilter[] };
};
