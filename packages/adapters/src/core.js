// The protocol-neutral thread reducer. Each adapter turns one wire event into a list of small
// operations ("ops"); this file applies them to an immutable thread state. No React, no I/O.

/** @typedef {import("./index").ThreadState} ThreadState */

const ROLES = new Set(["user", "assistant", "system"]);

export function role(value, fallback = "assistant") {
  if (value === "developer") return "system";
  return ROLES.has(value) ? value : fallback;
}

/** Parse a JSON string when it is complete; otherwise return the string as given. */
export function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  const t = value.trim();
  if (!t || !/^[[{"]|^-?\d|^(true|false|null)$/.test(t)) return value;
  try { return JSON.parse(t); } catch { return value; }
}

export function isRecord(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function display(v) {
  if (v === undefined || v === null) return v;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}

/** Default before/after rows for an approval: one row per top-level input field. */
export function inputToChanges(input) {
  if (!isRecord(input)) return input === undefined ? [] : [{ field: "input", after: display(input) }];
  return Object.keys(input).map((k) => ({ field: k, key: k, after: display(input[k]) }));
}

export function initialState(options) {
  return { options, status: "idle", error: undefined, runId: undefined, messages: [], openText: {}, seq: 0 };
}

const textId = (state, src) => {
  // A protocol may reuse a text id after it ended (some providers number text parts per step).
  const base = `text:${src}`;
  return state.messages.some((m) => m.id === base) ? `${base}:${state.seq}` : base;
};

function replace(state, id, fn) {
  const i = state.messages.findIndex((m) => m.id === id);
  if (i < 0) return state;
  const next = fn(state.messages[i]);
  if (next === state.messages[i]) return state;
  const messages = state.messages.slice();
  messages[i] = next;
  return { ...state, messages };
}

function push(state, message) {
  return { ...state, messages: [...state.messages, message], seq: state.seq + 1 };
}

const find = (state, id) => state.messages.find((m) => m.id === id);
const toolKey = (toolCallId) => `tool:${toolCallId}`;
const approvalKey = (approvalId) => `approval:${approvalId}`;

function author(state, r) {
  return r === "assistant" && state.options.assistantName ? { author: state.options.assistantName } : {};
}

function startText(state, src, r) {
  if (state.openText[src]) return state;
  const id = textId(state, src);
  const next = push(state, { id, role: r, kind: "text", content: "", streaming: true, ...author(state, r) });
  return { ...next, openText: { ...next.openText, [src]: id } };
}

function endText(state, src) {
  const id = state.openText[src];
  if (!id) return state;
  const openText = { ...state.openText };
  delete openText[src];
  return replace({ ...state, openText }, id, (m) => (m.streaming ? { ...m, streaming: false } : m));
}

function closeAllText(state) {
  let s = state;
  for (const src of Object.keys(state.openText)) s = endText(s, src);
  return s;
}

function ensureTool(state, toolCallId, name) {
  const id = toolKey(toolCallId);
  const existing = find(state, id);
  if (existing) {
    return name && existing.props.name !== name ? replace(state, id, (m) => ({ ...m, props: { ...m.props, name } })) : state;
  }
  return push(state, { id, role: "assistant", kind: "tool", toolCallId, inputText: "", props: { name: name || "tool", status: "queued" }, ...author(state, "assistant") });
}

function setTool(state, toolCallId, patch) {
  return replace(state, toolKey(toolCallId), (m) => {
    const props = { ...m.props, ...patch };
    for (const k of Object.keys(props)) if (props[k] === undefined) delete props[k];
    return { ...m, props };
  });
}

const hasPendingApproval = (state, toolCallId) =>
  state.messages.some((m) => m.kind === "approval" && m.toolCallId === toolCallId && m.props.status === "pending");

function requestApproval(state, op) {
  const key = approvalKey(op.approvalId);
  let s = state;
  let tool;
  if (op.toolCallId) {
    s = ensureTool(s, op.toolCallId, op.toolName);
    if (op.input !== undefined && find(s, toolKey(op.toolCallId)).props.input === undefined) s = setTool(s, op.toolCallId, { input: op.input });
    tool = find(s, toolKey(op.toolCallId));
    s = setTool(s, op.toolCallId, { status: "approval" });
  }
  const toolName = op.toolName || tool?.props.name;
  const input = op.input !== undefined ? op.input : tool?.props.input;
  const base = {
    title: op.message || (toolName ? `Allow ${toolName} to run` : "Approve this action"),
    action: op.message && toolName ? toolName : undefined,
    agent: state.options.agent,
    changes: inputToChanges(input),
    risk: "medium",
    expiresAt: op.expiresAt,
    status: "pending",
  };
  const custom = typeof state.options.describeApproval === "function"
    ? state.options.describeApproval({ approvalId: op.approvalId, toolCallId: op.toolCallId, toolName, input, message: op.message, metadata: op.metadata }) || {}
    : {};
  const props = { ...base, ...custom, status: "pending" };
  for (const k of Object.keys(props)) if (props[k] === undefined) delete props[k];
  if (find(s, key)) return replace(s, key, (m) => (m.props.status === "pending" ? { ...m, props } : m));
  return push(s, { id: key, role: "assistant", kind: "approval", approvalId: op.approvalId, toolCallId: op.toolCallId, props, ...author(state, "assistant") });
}

function decide(state, op) {
  const key = approvalKey(op.approvalId);
  const approval = find(state, key);
  if (!approval) return state;
  let s = replace(state, key, (m) => {
    const props = { ...m.props, status: op.approved ? "approved" : "rejected" };
    if (op.decidedBy) props.decidedBy = op.decidedBy;
    if (op.decidedAt) props.decidedAt = op.decidedAt;
    if (!op.approved && op.reason) props.rejectReason = op.reason;
    if (op.approved && isRecord(op.edits)) {
      props.changes = (props.changes || []).map((c) => {
        const k = c.key || c.field;
        return Object.prototype.hasOwnProperty.call(op.edits, k) ? { ...c, before: c.after, after: op.edits[k] } : c;
      });
    }
    return { ...m, props };
  });
  const tc = approval.toolCallId;
  const tool = tc && find(s, toolKey(tc));
  if (tool) {
    if (op.approved) {
      const input = isRecord(op.edits) && isRecord(tool.props.input) ? { ...tool.props.input, ...op.edits } : tool.props.input;
      s = setTool(s, tc, { status: tool.props.output !== undefined && tool.props.status === "done" ? "done" : "running", input });
    } else {
      s = setTool(s, tc, { status: "failed", error: op.reason ? `Rejected: ${op.reason}` : "Rejected by the reviewer." });
    }
  }
  return s;
}

/** Apply one normalised op. Unknown ops leave the state unchanged. */
export function applyOp(state, op) {
  switch (op.op) {
    case "run-start":
      return { ...state, status: "running", error: undefined, runId: op.runId ?? state.runId };
    case "run-finish":
      return { ...closeAllText(state), status: state.status === "error" ? "error" : "done" };
    case "run-error":
      return { ...closeAllText(state), status: "error", error: op.message || "The agent run failed." };
    case "user": {
      // A new turn from the person clears the previous run's error.
      const s = push(state, { id: op.id || `user:${state.seq}`, role: "user", kind: "text", content: op.text, streaming: false });
      return s.status === "error" ? { ...s, status: "idle", error: undefined } : s;
    }
    case "text-start":
      return startText(running(state), op.id, role(op.role));
    case "text-delta": {
      if (typeof op.delta !== "string" || op.delta === "") return state;
      const s = startText(running(state), op.id, role(op.role));
      return replace(s, s.openText[op.id], (m) => ({ ...m, content: m.content + op.delta }));
    }
    case "text-set": {
      const s = startText(running(state), op.id, role(op.role));
      const next = replace(s, s.openText[op.id], (m) => ({ ...m, content: op.text }));
      return op.final ? endText(next, op.id) : next;
    }
    case "text-end":
      return endText(state, op.id);
    case "tool-start":
      return ensureTool(running(state), op.toolCallId, op.name);
    case "tool-input-delta": {
      if (typeof op.delta !== "string") return state;
      const s = ensureTool(running(state), op.toolCallId, op.name);
      return replace(s, toolKey(op.toolCallId), (m) => {
        const inputText = m.inputText + op.delta;
        return { ...m, inputText, props: { ...m.props, input: parseMaybeJson(inputText) } };
      });
    }
    case "tool-input": {
      let s = ensureTool(running(state), op.toolCallId, op.name);
      const tool = find(s, toolKey(op.toolCallId));
      const input = op.input !== undefined ? parseMaybeJson(op.input) : parseMaybeJson(tool.inputText || undefined);
      const status = tool.props.status === "queued" ? "running" : tool.props.status;
      s = setTool(s, op.toolCallId, { input, status });
      return s;
    }
    case "tool-output": {
      let s = ensureTool(state, op.toolCallId, op.name);
      const output = parseMaybeJson(op.output);
      const status = hasPendingApproval(s, op.toolCallId) ? "approval" : op.preliminary ? "running" : "done";
      s = setTool(s, op.toolCallId, { output, status, error: undefined });
      return s;
    }
    case "tool-error": {
      const s = ensureTool(state, op.toolCallId, op.name);
      return setTool(s, op.toolCallId, { status: "failed", error: op.error || "The tool failed." });
    }
    case "tool-denied": {
      const tool = find(state, toolKey(op.toolCallId));
      if (!tool) return state;
      return setTool(state, op.toolCallId, { status: "failed", error: tool.props.error || "Not run: the reviewer rejected it." });
    }
    case "approval":
      return requestApproval(state, op);
    case "approval-decision":
      return decide(state, op);
    default:
      return state;
  }
}

function running(state) {
  return state.status === "running" ? state : { ...state, status: "running", error: state.status === "error" ? state.error : undefined };
}

/** PIX-local events (dispatched by your app, not by an agent). */
export function localOps(event) {
  switch (event.type) {
    case "pix:user-message":
      return typeof event.text === "string" ? [{ op: "user", text: event.text, id: event.id }] : [];
    case "pix:approval-decision":
      return event.approvalId ? [{ op: "approval-decision", approvalId: String(event.approvalId), approved: !!event.approved, reason: event.reason, decidedBy: event.decidedBy, decidedAt: event.decidedAt, edits: event.edits }] : [];
    case "pix:run-started":
      return [{ op: "run-start", runId: event.runId }];
    case "pix:run-finished":
      return [{ op: "run-finish" }];
    case "pix:run-error":
      return [{ op: "run-error", message: event.message }];
    default:
      return null;
  }
}
