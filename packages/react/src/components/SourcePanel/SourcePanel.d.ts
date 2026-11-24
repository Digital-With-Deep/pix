import type React from "react";
export interface Source {
  /** Stable id, matched against `activeId` and reported to `onSelect`. */
  id: string;
  /** Document or page title. */
  title: string;
  /** Kind of source, such as "PDF", "Policy" or "Ledger"; shown in monospace. */
  type?: string;
  /** The passage the answer rests on, shown as a quote. */
  snippet?: string;
  /** Adds a link that opens the source in a new tab. */
  href?: string;
  /** Whether the source backs the answer. `verified` uses the truth colour, `contradicted` the claim colour, `unverified` stays neutral; the state is always written out too. */
  state: "verified" | "unverified" | "contradicted";
  /** One line on what was checked, such as where the source and the answer disagree. */
  note?: string;
}
export interface SourcePanelProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** Sources in citation order; row numbers match InlineCitation markers. @default [] */
  sources?: Source[];
  /** Uppercase heading. @default "Sources" */
  title?: string;
  /** Id of the highlighted source. Controlled: pair it with `onSelect`, or set it from InlineCitation's `onSelect`. Omit to let the panel track its own selection. */
  activeId?: string | null;
  /** Initially highlighted source when uncontrolled. */
  defaultActiveId?: string;
  /** Called when a source title is clicked, with its id and the source. */
  onSelect?: (id: string, source: Source) => void;
  /** Text shown when `sources` is empty. @default "No sources were cited for this answer." */
  emptyLabel?: string;
  style?: React.CSSProperties;
}
/** Lists the sources an answer rests on, with each one's verification state in words and colour. Selecting a citation can highlight the matching source. */
export declare function SourcePanel(props: SourcePanelProps): React.JSX.Element;
