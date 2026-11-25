/**
 * @pix-ui/adapters: turn agent event streams into plain data for PIX components.
 * No React and no runtime dependencies. Text maps to Conversation messages, tool calls to ToolCall props
 * and approval requests to ApprovalCard props.
 */

export type AdapterName = "ai-sdk" | "ag-ui" | "adk";

/** Mirrors the data props of ToolCall in @pix-ui/react. */
export interface ToolCallData {
  name: string;
  status: "queued" | "running" | "done" | "failed" | "approval";
  input?: unknown;
  output?: unknown;
  error?: string;
}

/** Mirrors ApprovalChange in @pix-ui/react. */
export interface ApprovalChangeData {
  field: string;
  key?: string;
  before?: unknown;
  after?: unknown;
  editable?: boolean;
}

/** Mirrors the data props of ApprovalCard in @pix-ui/react. Add onApprove, onReject and onEdit when you render it. */
export interface ApprovalData {
  title?: string;
  action?: string;
  agent?: string;
  target?: string;
  reason?: string;
  changes?: ApprovalChangeData[];
  risk?: "low" | "medium" | "high" | "critical";
  reversible?: boolean;
  evidence?: (string | { label: string; href?: string })[];
  expiresAt?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  decidedBy?: string;
  decidedAt?: string;
  rejectReason?: string;
  requireRejectReason?: boolean;
  approveLabel?: string;
}

interface MessageBase {
  /** Stable key, prefixed by kind: "text:…", "tool:…", "approval:…", "user:…". */
  id: string;
  role: "user" | "assistant" | "system";
  /** Set from `assistantName` on assistant messages. */
  author?: string;
}

/** A user or assistant text turn. Assignable to ConversationMessage as it is. */
export interface TextMessage extends MessageBase {
  kind: "text";
  content: string;
  /** True while deltas are still arriving. */
  streaming: boolean;
}

/** One tool call. Spread `props` into <ToolCall>. */
export interface ToolMessage extends MessageBase {
  kind: "tool";
  role: "assistant";
  toolCallId: string;
  /** Raw argument text as it streamed, before parsing. */
  inputText: string;
  props: ToolCallData;
}

/** One approval request. Spread `props` into <ApprovalCard> and wire its callbacks to `resolveApproval`. */
export interface ApprovalMessage extends MessageBase {
  kind: "approval";
  role: "assistant";
  approvalId: string;
  /** The held tool call, when the protocol links one. */
  toolCallId?: string;
  props: ApprovalData;
}

export type ThreadMessage = TextMessage | ToolMessage | ApprovalMessage;
export type PartMessage = ToolMessage | ApprovalMessage;

export interface ApprovalRequestInfo {
  approvalId: string;
  toolCallId?: string;
  toolName?: string;
  input?: unknown;
  /** Text the agent sent with the request (AG-UI interrupt message, ADK confirmation hint, AI SDK reason). */
  message?: string;
  metadata?: unknown;
}

export interface ThreadOptions {
  /** Which protocol the events follow. @default "ai-sdk" */
  adapter?: AdapterName;
  /** Author shown on assistant messages. */
  assistantName?: string;
  /** Agent name shown on approval cards. */
  agent?: string;
  /** Fill in approval card fields (title, risk, target, reason, reversible, changes) from the request. Merged over the defaults. */
  describeApproval?: (request: ApprovalRequestInfo) => Partial<Omit<ApprovalData, "status">> | undefined;
  /** AG-UI only: tool names whose calls are held for approval once their arguments finish (frontend tool pattern). @default [] */
  approvalTools?: string[];
  /** ADK only: treat calls listed in longRunningToolIds as waiting on a person. @default true */
  longRunningAsApproval?: boolean;
}

export interface ThreadState {
  options: ThreadOptions & { adapter: AdapterName };
  /** `running` from the first event, `done` at the end of a run, `error` after a run error. */
  status: "idle" | "running" | "done" | "error";
  /** Error text from the agent, for PromptInput's `error` or an Alert. */
  error?: string;
  runId?: string;
  /** Turns in order, ready for `toConversationMessages`. */
  messages: ThreadMessage[];
  /** Internal bookkeeping. Treat as opaque. */
  openText: Record<string, string>;
  seq: number;
  agui: Record<string, string>;
}

/** Events your app dispatches itself. */
export type PixEvent =
  | { type: "pix:user-message"; text: string; id?: string }
  | { type: "pix:approval-decision"; approvalId: string; approved: boolean; reason?: string; decidedBy?: string; decidedAt?: string; edits?: Record<string, string> }
  | { type: "pix:run-started"; runId?: string }
  | { type: "pix:run-finished" }
  | { type: "pix:run-error"; message?: string };

/** Any protocol event. Unknown types are ignored, so this stays loose on purpose. */
export type AgentEvent = PixEvent | AiSdkChunk | AgUiEvent | AdkEvent | { [key: string]: unknown };

/** Vercel AI SDK UI message stream parts handled by the "ai-sdk" adapter. */
export type AiSdkChunk =
  | { type: "start"; messageId?: string }
  | { type: "text-start" | "text-end"; id: string }
  | { type: "text-delta"; id: string; delta: string }
  | { type: "tool-input-start"; toolCallId: string; toolName: string }
  | { type: "tool-input-delta"; toolCallId: string; inputTextDelta: string }
  | { type: "tool-input-available"; toolCallId: string; toolName: string; input: unknown }
  | { type: "tool-input-error"; toolCallId: string; toolName: string; input: unknown; errorText: string }
  | { type: "tool-approval-request"; approvalId: string; toolCallId: string; reason?: string }
  | { type: "tool-approval-response"; approvalId: string; approved: boolean; reason?: string }
  | { type: "tool-output-available"; toolCallId: string; output: unknown; preliminary?: boolean }
  | { type: "tool-output-error"; toolCallId: string; errorText: string }
  | { type: "tool-output-denied"; toolCallId: string }
  | { type: "finish"; finishReason?: string }
  | { type: "abort"; reason?: string }
  | { type: "error"; errorText: string };

/** AG-UI events handled by the "ag-ui" adapter. */
export type AgUiEvent =
  | { type: "RUN_STARTED"; threadId: string; runId: string }
  | { type: "RUN_FINISHED"; threadId: string; runId: string; result?: unknown; outcome?: { type: "success" } | { type: "interrupt"; interrupts: { id: string; reason?: string; message?: string; toolCallId?: string; expiresAt?: string; metadata?: unknown }[] } }
  | { type: "RUN_ERROR"; message: string; code?: string }
  | { type: "TEXT_MESSAGE_START"; messageId: string; role?: string }
  | { type: "TEXT_MESSAGE_CONTENT"; messageId: string; delta: string }
  | { type: "TEXT_MESSAGE_END"; messageId: string }
  | { type: "TEXT_MESSAGE_CHUNK"; messageId?: string; role?: string; delta?: string }
  | { type: "TOOL_CALL_START"; toolCallId: string; toolCallName: string; parentMessageId?: string }
  | { type: "TOOL_CALL_ARGS"; toolCallId: string; delta: string }
  | { type: "TOOL_CALL_CHUNK"; toolCallId?: string; toolCallName?: string; delta?: string }
  | { type: "TOOL_CALL_END"; toolCallId: string }
  | { type: "TOOL_CALL_RESULT"; messageId: string; toolCallId: string; content: string; role?: "tool" };

/** A Google ADK event. camelCase (JSON) and snake_case (Python) field names are both read. */
export interface AdkEvent {
  id?: string;
  author?: string;
  invocationId?: string;
  partial?: boolean;
  turnComplete?: boolean;
  longRunningToolIds?: string[];
  errorCode?: string;
  errorMessage?: string;
  content?: {
    role?: string;
    parts?: {
      text?: string;
      thought?: boolean;
      functionCall?: { id?: string; name: string; args?: Record<string, unknown> };
      functionResponse?: { id?: string; name: string; response?: unknown };
    }[];
  };
  [key: string]: unknown;
}

/** Start an empty thread for one protocol. */
export declare function createThread(options?: ThreadOptions): ThreadState;
/** Pure reducer: a new state with one event applied. Works as a React `useReducer` reducer. */
export declare function applyEvent(state: ThreadState, event: AgentEvent): ThreadState;
/** Apply events in order. */
export declare function applyEvents(state: ThreadState, events: Iterable<AgentEvent>): ThreadState;
/** Add the person's own turn. */
export declare function addUserMessage(state: ThreadState, text: string, id?: string): ThreadState;
/** Record a reviewer's decision: marks the ApprovalCard approved or rejected and moves its ToolCall to running or failed. */
export declare function resolveApproval(
  state: ThreadState,
  approvalId: string,
  decision: { approved: boolean; reason?: string; decidedBy?: string; decidedAt?: string; edits?: Record<string, string> },
): ThreadState;
/** Approvals still waiting on a person. */
export declare function pendingApprovals(state: ThreadState): ApprovalMessage[];

/** A Conversation message: `content` is a string for text, or whatever `renderPart` returns. */
export interface ConversationMessageData<N> {
  id: string;
  role: "user" | "assistant" | "system";
  author?: string;
  content: string | N;
  streaming?: boolean;
}
/** Map thread messages to Conversation messages, rendering tool and approval messages with `renderPart`. */
export declare function toConversationMessages<N>(messages: ThreadMessage[], renderPart: (message: PartMessage) => N): ConversationMessageData<N>[];

/** Yield each JSON `data:` payload of a server-sent events body (a fetch Response, a ReadableStream or an async iterable). Skips `[DONE]`. */
export declare function readEventStream(source: Response | ReadableStream<Uint8Array | string> | AsyncIterable<Uint8Array | string>): AsyncGenerator<AgentEvent>;
