import type React from "react";
import type { Source } from "../SourcePanel/SourcePanel";
export interface InlineCitationProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** The number shown in the marker, matching the source's position in the SourcePanel. @default 1 */
  index?: number | string;
  /** Source id reported to `onSelect`. Falls back to `source.id`, then to `index`. */
  id?: string;
  /** Source title shown in the tooltip and in the accessible name ("Source 2: Vendor master record"). */
  title?: string;
  /** The passage the answer rests on, shown under the title in the tooltip. */
  snippet?: string;
  /** Makes the marker a link to the source. Without it the marker is a button. */
  href?: string;
  /** Kind of source, such as "PDF" or "Policy", shown in the tooltip. */
  type?: string;
  /** Verification state, stated in words in the tooltip. */
  state?: "verified" | "unverified" | "contradicted";
  /** Pass a whole source object instead of the separate fields; explicit props win. */
  source?: Source;
  /** Draw the marker as selected, typically when its source is the active row in a SourcePanel. @default false */
  active?: boolean;
  /** Called with the source id when the marker is clicked or activated with Enter or Space. Wire it to SourcePanel's `activeId` to highlight the matching source. */
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}
/** A small numbered marker inside answer text. Hover or focus shows the source's title and snippet in a tooltip; Escape hides it. */
export declare function InlineCitation(props: InlineCitationProps): React.JSX.Element;
