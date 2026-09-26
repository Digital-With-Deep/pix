import type React from "react";
export interface FingerprintComponent {
  /** Component name, e.g. `model_version` or `H(system_prompt)`. Monospace. */
  name: string;
  /** Prior-period value. */
  from: string;
  /** Current value. Inequality with `from` marks the row as moved. */
  to: string;
}

export interface FingerprintDiffProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Card label. Default "Decision logic fingerprint". */
  title?: string;
  /** Every component of the fingerprint, in a stable order. */
  components: FingerprintComponent[];
  /** `low` renders the scope-limitation banner. Default `high`. */
  confidence?: "high" | "low";
  /** Replaces the default provider-opacity explanation. */
  confidenceNote?: string;
  /** Force the verdict. Defaults to `true` only when nothing moved and confidence is high. */
  benchmarking?: boolean;
  /** Replaces the default verdict paragraph. */
  verdictNote?: string;
  /** Column headers. Default ["Prior", "Current"]. */
  periodLabels?: [string, string];
  style?: React.CSSProperties;
}
/**
 * Component-wise fingerprint comparison and the AS 2201 verdict it implies.
 * Has no prop for a single combined hash: when the fingerprint changes, the
 * change report must name which component moved.
 */
export declare function FingerprintDiff(props: FingerprintDiffProps): React.JSX.Element;
