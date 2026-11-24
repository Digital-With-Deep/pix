import type React from "react";
export type AutonomyLevel = "suggest" | "propose" | "confirm" | "autonomous";
export interface AutonomySettingProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** The chosen level. Controlled: pair it with `onChange`. Omit to let the component track its own choice. */
  value?: AutonomyLevel;
  /** Initial level when uncontrolled. @default "propose" */
  defaultValue?: AutonomyLevel;
  /** Called with the new level when the person picks one by pointer or arrow keys. */
  onChange?: (value: AutonomyLevel) => void;
  /** Uppercase group label, wired with aria-labelledby. @default "Autonomy" */
  label?: string;
  /** The task this setting applies to, shown after the label as "for {task}". */
  task?: string;
  /** Replace the plain-language summary line of any level. Keep each to one sentence. */
  descriptions?: Partial<Record<AutonomyLevel, string>>;
  /** Disable the whole control. @default false */
  disabled?: boolean;
  /** Native radio name; generated when omitted. */
  name?: string;
  style?: React.CSSProperties;
}
/** A per-task control for how much an agent may do on its own: Suggest only, Plan and propose, Act with confirmation, Act on its own. A radiogroup with a plain-language summary of the chosen level. */
export declare function AutonomySetting(props: AutonomySettingProps): React.JSX.Element;
