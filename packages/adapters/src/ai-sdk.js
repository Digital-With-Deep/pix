// Vercel AI SDK UI message stream parts (the `data:` payloads of a UI message stream response).
// https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
import { role } from "./core.js";

const str = (v) => (typeof v === "string" && v !== "" ? v : undefined);

export function translateAiSdk(event) {
  const id = str(event.id);
  const tc = str(event.toolCallId);
  switch (event.type) {
    case "start":
      return [{ op: "run-start", runId: str(event.messageId) }];
    case "text-start":
      return id ? [{ op: "text-start", id, role: role(event.role) }] : [];
    case "text-delta":
      return id ? [{ op: "text-delta", id, delta: event.delta }] : [];
    case "text-end":
      return id ? [{ op: "text-end", id }] : [];
    case "tool-input-start":
      return tc ? [{ op: "tool-start", toolCallId: tc, name: str(event.toolName) }] : [];
    case "tool-input-delta":
      return tc ? [{ op: "tool-input-delta", toolCallId: tc, delta: event.inputTextDelta }] : [];
    case "tool-input-available":
      return tc ? [{ op: "tool-input", toolCallId: tc, name: str(event.toolName), input: event.input }] : [];
    case "tool-input-error":
      return tc ? [
        { op: "tool-input", toolCallId: tc, name: str(event.toolName), input: event.input },
        { op: "tool-error", toolCallId: tc, error: str(event.errorText) },
      ] : [];
    case "tool-approval-request":
      return tc && str(event.approvalId) ? [{ op: "approval", approvalId: event.approvalId, toolCallId: tc, message: str(event.reason) }] : [];
    case "tool-approval-response":
      return str(event.approvalId) ? [{ op: "approval-decision", approvalId: event.approvalId, approved: !!event.approved, reason: str(event.reason) }] : [];
    case "tool-output-available":
      return tc ? [{ op: "tool-output", toolCallId: tc, output: event.output, preliminary: event.preliminary === true }] : [];
    case "tool-output-error":
      return tc ? [{ op: "tool-error", toolCallId: tc, error: str(event.errorText) }] : [];
    case "tool-output-denied":
      return tc ? [{ op: "tool-denied", toolCallId: tc }] : [];
    case "finish":
    case "abort":
      return [{ op: "run-finish" }];
    case "error":
      return [{ op: "run-error", message: str(event.errorText) }];
    default:
      // reasoning-*, source-*, file, data-*, start-step, finish-step, message-metadata and newer parts are ignored.
      return [];
  }
}
