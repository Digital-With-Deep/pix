import type React from "react";
import type { SelectOption } from "../Select/Select";
import type { RadioOption } from "../RadioGroup/RadioGroup";

export interface ProviderAuthMethod extends RadioOption {
  /** Placeholder / accessible name for the secret input: "API key", "Client secret". */
  secretLabel?: string;
  /** `false` when the method needs no secret (workload identity, instance role). */
  secret?: boolean;
  /** Shown under the method when selected — what the admin must set up on the provider's side. */
  note?: React.ReactNode;
}
export interface ProviderField { key: string; label: string; required?: boolean; placeholder?: string; default?: string; /** "url" adds URL validation. */ type?: "text" | "url" }
export interface ProviderBehavior { key: string; label: string; description?: string; default?: boolean }
export interface ProviderDefinition extends SelectOption {
  auth?: ProviderAuthMethod[];
  fields?: ProviderField[];
  behaviors?: ProviderBehavior[];
  /** The registry models this provider type can serve. */
  models?: { name: string; id: string }[];
}
export interface ProviderConfigValue {
  provider: string; name: string; auth: string | null;
  /** Present only when the admin typed one. Never pass a stored secret back in. */
  secret?: string;
  fields: Record<string, string>;
  headers: { key: string; value: string }[];
  modelScope: "all" | "selected" | "none";
  models: string[]; customModels: string[];
  behavior: Record<string, boolean>;
}
export interface ProviderConfigProps {
  /** Provider types, each describing its own auth methods, request fields, behaviors and models. The form is generated from this. */
  providers: ProviderDefinition[];
  /** Existing configuration when `mode="edit"`. Read once on mount. */
  value?: Partial<ProviderConfigValue>;
  mode?: "create" | "edit";
  title?: string;
  /** Replaces the default line under the secret input. State how the secret is protected — and only what is true. */
  secretNote?: React.ReactNode;
  /** Names already taken, for the uniqueness check. */
  existingNames?: string[];
  /** Called with a valid configuration only. */
  onSubmit?: (value: ProviderConfigValue) => void;
  onCancel?: () => void;
  onBack?: () => void;
  /** Shows a Test button beside the secret. Resolve `{ ok, message }` or throw. */
  onTest?: (value: ProviderConfigValue) => Promise<{ ok?: boolean; message?: string } | void>;
  /** The catalog or the configuration is still loading: header and footer stay, the body is a form skeleton. */
  loading?: boolean;
  /** Rendered in the empty state when `providers` resolves to none — e.g. a link to the license page. */
  emptyAction?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function ProviderConfig(props: ProviderConfigProps): React.JSX.Element;
