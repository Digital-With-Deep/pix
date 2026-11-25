import type React from "react";

/** The A2UI (Agent-to-User Interface) protocol version this package speaks. */
export declare const A2UI_VERSION: "1.0";
/** Catalog id of the PIX catalog. An identifier, not a URL you need to fetch. */
export declare const PIX_CATALOG_ID: "https://pixui.digitalwithdeep.com/a2ui/catalogs/pix/v1/catalog.json";
/** The PIX catalog definition (also shipped as `@pix-ui/a2ui/catalog.json`). Put it in the agent's prompt and validate against it. */
export declare const pixCatalog: A2UICatalogDefinition;

export interface A2UICatalogDefinition {
  $schema?: string;
  $id?: string;
  protocolVersion?: string;
  title?: string;
  description?: string;
  catalogId: string;
  instructions?: string;
  components?: Record<string, Record<string, unknown>>;
  functions?: Record<string, Record<string, unknown>>;
  $defs?: Record<string, unknown>;
}

// ---- Wire types ---------------------------------------------------------------------------------------------

export type A2UIDataBinding = { "@path": string };
export type A2UIFunctionCall = { "@call": string; catalogId?: string; args?: Record<string, unknown> };
export type A2UIDynamic<T> = T | A2UIDataBinding | A2UIFunctionCall;
export type A2UIChildList = string[] | { componentId: string; path: string };

export interface A2UIAction {
  event?: { name: string; userMessage?: A2UIDynamic<string>; context?: Record<string, unknown> };
  functionCall?: A2UIFunctionCall;
}

export interface A2UIComponent {
  id: string;
  component: string;
  "@catalogId"?: string;
  "@accessibility"?: { label?: A2UIDynamic<string>; description?: A2UIDynamic<string>; live?: "off" | "polite" | "assertive"; hidden?: A2UIDynamic<boolean> };
  "@metadata"?: { extensions?: Record<string, unknown> };
  "@checks"?: { condition: A2UIDataBinding | A2UIFunctionCall; message?: string }[];
  [property: string]: unknown;
}

/** One agent-to-renderer message. */
export type A2UIAgentMessage =
  | { version: "1.0"; createSurface: { surfaceId: string; catalogId?: string; sendDataModel?: boolean; components?: A2UIComponent[]; dataModel?: Record<string, unknown>; metadata?: { extensions?: Record<string, unknown> } } }
  | { version: "1.0"; updateComponents: { surfaceId: string; components: A2UIComponent[] } }
  | { version: "1.0"; updateDataModel: { surfaceId: string; path?: string; value: unknown } }
  | { version: "1.0"; deleteSurface: { surfaceId: string } }
  | { version: "1.0"; callRendererFunction: { surfaceId?: string; functionCallId: string; callFunction: A2UIFunctionCall } }
  | { version: "1.0"; agentFunctionResponse: { functionCallId: string; value?: unknown; error?: { code: string; message: string } } };

/** The renderer-to-agent action message sent when a person acts on a component. */
export interface A2UIActionMessage {
  version: "1.0";
  action: {
    name: string;
    surfaceId: string;
    sourceComponentId: string;
    /** ISO 8601 time of the interaction. */
    timestamp: string;
    /** The event context with every binding resolved, plus keys the renderer adds (`reason`, `edits`, `vote`, `row`). */
    context: Record<string, unknown>;
    userMessage?: string;
    metadata?: { extensions?: Record<string, unknown> };
  };
}
/** Transport metadata for an action. Present only for surfaces created with `sendDataModel: true`. */
export interface A2UIActionMetadata {
  a2uiRendererDataModel: { version: "1.0"; surfaces: Record<string, Record<string, unknown>> };
}
export interface A2UIErrorMessage {
  version: "1.0";
  error: { code: string; message: string; surfaceId?: string; path?: string; functionCallId?: string };
}
export interface A2UIFunctionResponseMessage {
  version: "1.0";
  rendererFunctionResponse: { functionCallId: string; value?: unknown; error?: { code: string; message: string } };
}

// ---- Processor ----------------------------------------------------------------------------------------------

export interface A2UISurfaceState {
  id: string;
  catalogId?: string;
  sendDataModel: boolean;
  dataModel: Record<string, unknown>;
  components: Map<string, A2UIComponent>;
  metadata?: { extensions?: Record<string, unknown> };
}

export interface A2UIProcessorOptions {
  /** Catalog ids this renderer supports. A createSurface naming another catalog is reported. */
  catalogIds?: string[];
  onError?: (message: A2UIErrorMessage) => void;
  /** Receives the reply to each callRendererFunction message. */
  onFunctionResponse?: (message: A2UIFunctionResponseMessage) => void;
}

export interface A2UIProcessor {
  /** Apply one message, or several in order. */
  process(messages: A2UIAgentMessage | A2UIAgentMessage[]): void;
  /** Write to a surface's data model from the renderer side. */
  setData(surfaceId: string, pointer: string, value: unknown): void;
  getSurface(surfaceId: string): A2UISurfaceState | undefined;
  getSurfaces(): A2UISurfaceState[];
  getDataModelMetadata(surfaceIds?: string[]): A2UIActionMetadata["a2uiRendererDataModel"];
  reportError(error: A2UIErrorMessage["error"], onceKey?: string): void;
  subscribe(listener: () => void): () => void;
  getVersion(): number;
}
/** Create a message processor that holds surfaces. Use it when you feed a live stream yourself. */
export declare function createA2UIProcessor(options?: A2UIProcessorOptions): A2UIProcessor;

export declare function parsePointer(pointer?: string): string[];
export declare function getAtPointer(doc: unknown, pointer?: string): unknown;
/** Upsert at a JSON Pointer; `null` removes the key. Returns a new root. */
export declare function setAtPointer<T>(doc: T, pointer: string | undefined, value: unknown): T;

// ---- Catalog implementations --------------------------------------------------------------------------------

/** What a component implementation receives. Property names are those of the catalog schema. */
export interface A2UIRenderContext {
  id: string;
  surfaceId: string;
  /** The raw component object from the agent. */
  definition: A2UIComponent;
  has(property: string): boolean;
  /** The property with bindings and function calls resolved. */
  get(property: string): unknown;
  /** The property coerced to a boolean with the A2UI coercion rules. */
  bool(property: string): boolean;
  /** Render the component whose id is in a ComponentId property. */
  child(property: string): React.ReactNode;
  /** Render a ChildList property, including list templates. */
  children(property: string): React.ReactNode[];
  /** Evaluate the component's @checks. */
  checks(): { valid: boolean; messages: string[] };
  /** Write a value to the data model path a property is bound to. Does nothing for literal properties. */
  setBound(property: string, value: unknown): void;
  /** Write a value to the data model, relative to the current list item. */
  setData(pointer: string, value: unknown): void;
  /** Dispatch the Action in a property. `extra` keys are added to the event context. */
  dispatch(property: string, extra?: Record<string, unknown>): void;
}
export type A2UIComponentImplementation = (ctx: A2UIRenderContext) => React.ReactNode;
export type A2UIFunctionImplementation = (args: Record<string, unknown>, scope: unknown) => unknown;

export interface A2UICatalogImplementation {
  catalogId: string;
  components: Record<string, A2UIComponentImplementation>;
  functions?: Record<string, A2UIFunctionImplementation>;
}
export declare function defineCatalog(
  catalogId: string,
  components: Record<string, A2UIComponentImplementation>,
  functions?: Record<string, A2UIFunctionImplementation>,
): A2UICatalogImplementation;
/** The PIX components and functions under PIX_CATALOG_ID. */
export declare const pixCatalogImplementation: A2UICatalogImplementation;
export declare const pixComponents: Record<string, A2UIComponentImplementation>;
export declare const pixFunctions: Record<string, A2UIFunctionImplementation>;

/** Keep http, https, mailto and relative links; drop any other scheme. */
export declare function safeHref(href: unknown): string | undefined;
export declare function resolveValue(value: unknown, scope: unknown): unknown;
export declare function formatString(template: unknown, scope: unknown): string;
export declare function toBool(value: unknown): boolean;
export declare function toText(value: unknown): string;

/** The a2uiRendererCapabilities object for transport metadata. */
export declare function rendererCapabilities(options?: { catalogIds?: string[]; inline?: boolean }): {
  "1.0": { supportedCatalogIds: string[]; inlineCatalogs?: A2UICatalogDefinition[] };
};

// ---- Renderer -----------------------------------------------------------------------------------------------

export interface A2UISurfaceProps {
  /** Agent messages in arrival order. Add new ones at the end as they stream; if earlier messages change, rendering starts over. */
  messages?: A2UIAgentMessage[];
  /** Your own processor instead of `messages`. Its errors go to its own `onError` option. */
  processor?: A2UIProcessor;
  /** Render one surface. Defaults to every surface, in creation order. */
  surfaceId?: string;
  /** Catalog implementations. @default [pixCatalogImplementation] */
  catalogs?: A2UICatalogImplementation[];
  /** Called with each action message (and data model metadata when the surface asked for it). Send it to the agent. */
  onAction?: (message: A2UIActionMessage, metadata?: A2UIActionMetadata) => void;
  /** Renderer errors to report to the agent, delivered after render. */
  onError?: (message: A2UIErrorMessage) => void;
  /** Replies to callRendererFunction messages. */
  onFunctionResponse?: (message: A2UIFunctionResponseMessage) => void;
  /** Locale for formatNumber and formatCurrency. @default "en-US" */
  locale?: string;
  style?: React.CSSProperties;
}
/**
 * Build the React tree of one surface without hooks, for hosts that keep their own state. Re-render after the
 * processor notifies its subscribers.
 */
export declare function renderA2UISurface(options: {
  surface: A2UISurfaceState;
  processor: A2UIProcessor;
  catalogs?: A2UICatalogImplementation[];
  locale?: string;
  onAction?: A2UISurfaceProps["onAction"];
}): React.ReactElement;

/** Renders A2UI surfaces with PIX components and reports user actions as A2UI action messages. */
export declare function A2UISurface(props: A2UISurfaceProps): React.JSX.Element;
