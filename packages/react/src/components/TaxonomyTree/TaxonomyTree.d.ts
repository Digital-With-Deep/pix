import type React from "react";
export interface TaxonomyNode {
  /** Node name. */
  label: string;
  /** Indent level, 0 for a root. */
  depth?: number;
  /** Source-system code shown next to the label, rendered monospace and muted. */
  code?: string;
  /** Extension marker for tenant-loaded nodes, e.g. "ext · US01" — rendered in violet. */
  ext?: string;
  /** Right-aligned target the node maps to, e.g. a control objective code. */
  objective?: string;
}

export interface TaxonomyTreeProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Flat list in display order; nesting comes from `depth`. */
  nodes: TaxonomyNode[];
  /** Small uppercase header label. */
  caption?: string;
  /** Right-aligned monospace qualifier in the header. */
  hint?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function TaxonomyTree(props: TaxonomyTreeProps): React.JSX.Element;
