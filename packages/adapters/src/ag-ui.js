// AG-UI (Agent-User Interaction protocol) events.
// https://docs.ag-ui.com/sdk/js/core/events
import { role } from "./core.js";

const str = (v) => (typeof v === "string" && v !== "" ? v : undefined);

export function translateAgUi(event, state) {
  const tc = str(event.toolCallId);
  const mid = str(event.messageId);
  switch (event.type) {
    case "RUN_STARTED":
      return [{ op: "run-start", runId: str(event.runId) }];
    case "RUN_FINISHED": {
      const ops = [];
      // Interrupt-aware runs end with outcome { type: "interrupt", interrupts: [...] }.
      const outcome = event.outcome;
      if (outcome && outcome.type === "interrupt" && Array.isArray(outcome.interrupts)) {
        for (const it of outcome.interrupts) {
          if (!it || !str(it.id)) continue;
          ops.push({ op: "approval", approvalId: it.id, toolCallId: str(it.toolCallId), message: str(it.message), expiresAt: str(it.expiresAt), metadata: it.metadata });
        }
      }
      ops.push({ op: "run-finish" });
      return ops;
    }
    case "RUN_ERROR":
      return [{ op: "run-error", message: str(event.message) }];
    case "TEXT_MESSAGE_START":
      return mid ? [{ op: "text-start", id: mid, role: role(event.role) }] : [];
    case "TEXT_MESSAGE_CONTENT":
      return mid ? [{ op: "text-delta", id: mid, delta: event.delta }] : [];
    case "TEXT_MESSAGE_END":
      return mid ? [{ op: "text-end", id: mid }] : [];
    case "TEXT_MESSAGE_CHUNK": {
      // Convenience event: messageId is required on the first chunk only.
      const id = mid || state.agui.lastText;
      return id ? [{ op: "text-delta", id, delta: event.delta, role: role(event.role) }] : [];
    }
    case "TOOL_CALL_START":
      return tc ? [{ op: "tool-start", toolCallId: tc, name: str(event.toolCallName) }] : [];
    case "TOOL_CALL_ARGS":
      return tc ? [{ op: "tool-input-delta", toolCallId: tc, delta: event.delta }] : [];
    case "TOOL_CALL_CHUNK": {
      const id = tc || state.agui.lastTool;
      return id ? [{ op: "tool-input-delta", toolCallId: id, name: str(event.toolCallName), delta: typeof event.delta === "string" ? event.delta : "" }] : [];
    }
    case "TOOL_CALL_END": {
      if (!tc) return [];
      const ops = [{ op: "tool-input", toolCallId: tc }];
      const tool = state.messages.find((m) => m.id === `tool:${tc}`);
      const approvalTools = state.options.approvalTools || [];
      if (tool && approvalTools.includes(tool.props.name)) ops.push({ op: "approval", approvalId: tc, toolCallId: tc });
      return ops;
    }
    case "TOOL_CALL_RESULT":
      return tc ? [{ op: "tool-output", toolCallId: tc, output: event.content }] : [];
    default:
      // STATE_*, MESSAGES_SNAPSHOT, STEP_*, REASONING_*, ACTIVITY_*, CUSTOM, RAW and newer events are ignored.
      return [];
  }
}

/** Remember the last chunk ids so TEXT_MESSAGE_CHUNK and TOOL_CALL_CHUNK can omit them after the first. */
export function trackAgUi(event, agui) {
  if (event.type === "TEXT_MESSAGE_CHUNK" && str(event.messageId)) return { ...agui, lastText: event.messageId };
  if (event.type === "TOOL_CALL_CHUNK" && str(event.toolCallId)) return { ...agui, lastTool: event.toolCallId };
  if (event.type === "RUN_FINISHED" || event.type === "RUN_ERROR") return {};
  return agui;
}
