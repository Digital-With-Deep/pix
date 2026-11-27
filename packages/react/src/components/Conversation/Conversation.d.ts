import type React from "react";
export interface ConversationMessage {
  /** Stable key. Falls back to the index. */
  id?: string;
  /** `user` turns sit on the right in a bubble; `assistant` turns on the left; `system` renders as a centred note. */
  role: "user" | "assistant" | "system";
  /** A string (user turns as plain text, assistant turns as Markdown), or any node such as an AIResponse, ToolCall or ApprovalCard. */
  content: React.ReactNode;
  /** Display name above the turn. */
  author?: string;
  /** Time shown next to the author, as given. */
  time?: string;
  /** Image URL or a node. Defaults to initials. */
  avatar?: string | React.ReactNode;
  /** For string assistant content still arriving: hides half-written Markdown syntax. */
  streaming?: boolean;
  /** A row under the turn, usually a MessageActions. Hidden while `streaming` is set. */
  actions?: React.ReactNode;
}
export interface ConversationProps {
  /** Render the skeleton for this component in its footprint (see Skeleton). */
  loading?: boolean;
  /** The turns, oldest first. @default [] */
  messages?: ConversationMessage[];
  /** Extra content after the last turn, e.g. a typing indicator or a pending ApprovalCard. */
  children?: React.ReactNode;
  /** Shown when there are no messages. */
  empty?: React.ReactNode;
  /** Fixed height of the thread. The log scrolls inside it. */
  height?: number | string;
  maxHeight?: number | string;
  /** @default true */
  showAvatars?: boolean;
  /** Keep the newest content in view as it grows, until the reader scrolls up. @default true */
  follow?: boolean;
  /** Accessible name of the log region. @default "Conversation" */
  label?: string;
  /** Pinned under the thread, usually a PromptInput. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
/** A chat thread that keeps the latest message in view while text streams, with a jump back when the reader scrolls up. */
export declare function Conversation(props: ConversationProps): React.JSX.Element;
