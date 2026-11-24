import type React from "react";
import type { Pattern, PatternSeverity } from "../PatternList/PatternList";

export interface PatternAlertDestination {
  /** Stable id, used as the key and when removing. */
  id: string;
  type: "slack" | "webhook" | "pagerduty";
  /** A Slack channel, a webhook URL or a PagerDuty integration key. Webhook URLs render as their host and keys as their last four characters. */
  target: string;
  /** Overrides the text shown on the pill. */
  label?: string;
  /** PagerDuty only: the severity sent with each alert. */
  severity?: "critical" | "error" | "warning" | "info";
}
export interface PatternMention {
  /** Reply to each Slack alert with a mention. Needs a Slack destination. */
  enabled: boolean;
  /** The workspace member or agent to mention. */
  who: string;
  /** Instructions for whoever is mentioned, up to 2,000 characters. `{{pattern}}` becomes the pattern link and is required. */
  prompt: string;
}
export interface PatternAlertConfig {
  /** Every destination receives every alert. An empty list turns alerts off. */
  destinations: PatternAlertDestination[];
  /** The lowest severity that sends an alert. @default "medium" */
  minSeverity: "low" | "medium" | "high";
  /** Informational patterns alert whichever minimum is chosen. @default true */
  informational: boolean;
  mention?: PatternMention;
}
export interface PatternAlertSettingsProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). @default false */
  loading?: boolean;
  /** The config, when controlled. Pair with `onChange`. */
  value?: PatternAlertConfig;
  /** The starting config, when uncontrolled. Defaults to no destinations, "medium" and informational on. */
  defaultValue?: Partial<PatternAlertConfig>;
  /** Called with the full config on every change. */
  onChange?: (config: PatternAlertConfig) => void;
  /** Shows a Save button; called with the config. Omit when each change is saved as it is made. */
  onSave?: (config: PatternAlertConfig) => void;
  /** Slack channels to choose from. Without them the channel is typed in. */
  channels?: string[];
  /** Workspace members and agents that can be mentioned. Without them the name is typed in. */
  members?: string[];
  /** A pattern to preview the alert with; the preview says whether it would alert under the current config. */
  previewPattern?: Pattern;
  /** Link shown in the preview where `{{pattern}}` appears. Defaults to the pattern's name. */
  patternUrl?: string;
  /** Uppercase heading. @default "Pattern alerts" */
  title?: string;
  /** Show the settings without any editing control. @default false */
  readOnly?: boolean;
  style?: React.CSSProperties;
}
/** Settings for pattern alerts: destinations (one Slack channel alongside webhooks and PagerDuty), the minimum alert severity, and an optional Slack mention with investigation instructions. */
export declare function PatternAlertSettings(props: PatternAlertSettingsProps): React.JSX.Element;
/** Whether a pattern of this severity sends an alert under a config: needs a destination, informational follows its own switch, and a missing severity counts as low. */
export declare function patternAlerts(severity: PatternSeverity | undefined, config: PatternAlertConfig): boolean;
/** The text a destination pill shows, with webhook URLs cut to their host and keys to their last four characters. */
export declare function patternDestinationLabel(destination: PatternAlertDestination): string;
/** Longest mention prompt, in characters. */
export declare const PATTERN_MENTION_MAX: number;
