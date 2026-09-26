import type React from "react";
export interface ChainRung {
  /** Uppercase kicker naming the layer, e.g. "Agent" or "Control objective". */
  label?: string;
  /** The identifier at this layer. Monospace. */
  value: string;
  /** Supporting clause, e.g. "type = agentic". */
  meta?: string;
}

export interface InferenceChainProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** Card label. Default "Inference chain". */
  title?: string;
  /** Ordered rungs, indented one level each: agent → control → objective → assertions. */
  chain: ChainRung[];
  /** Run observations that bear on the conclusion. Rendered as amber findings. */
  findings?: string[];
  /** Assertion names affected, e.g. ["accuracy_valuation", "completeness"]. */
  assertions?: string[];
  /** Annualised exception volume, e.g. "1,240 exceptions / yr". */
  exceptions?: string;
  /** How the volume sits against thresholds. */
  materiality?: string;
  /** Compensating control, or the statement that none was identified. */
  compensating?: string;
  /** Conclusion. Drives the footer colour. */
  deficiency?: "none" | "control_deficiency" | "significant_deficiency" | "material_weakness";
  /** Replaces the default footer sentence. */
  deficiencyNote?: string;
  style?: React.CSSProperties;
}
/**
 * Renders the chain from an agent to the assertions it touches, and the
 * deficiency the run's findings add up to. The rungs stay visible so the
 * conclusion can be traced back to what produced it.
 */
export declare function InferenceChain(props: InferenceChainProps): React.JSX.Element;
