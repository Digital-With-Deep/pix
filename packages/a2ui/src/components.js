// React implementations of the PIX catalog: each A2UI (Agent-to-User Interface) component type maps to a PIX component.
// An implementation receives a render context (see A2UIRenderContext in index.d.ts) and returns a React node.
import * as React from "react";
import {
  AIResponse, Alert, ApprovalCard, Badge, Button, Callout, Conversation, DataTable, Grid, Markdown, MetricCard, Stack, ToolCall,
} from "@pix-ui/react";
import { PIX_CATALOG_ID } from "./catalog.js";
import { pixFunctions, toText } from "./expressions.js";

const h = React.createElement;
const JUSTIFY = { start: "start", center: "center", end: "end", spaceBetween: "between", spaceAround: "around" };

/** Agent-supplied links are limited to http, https, mailto and relative URLs, matching the PIX Markdown component. */
export function safeHref(href) {
  if (typeof href !== "string") return undefined;
  const s = href.trim();
  if (/^(https?:|mailto:)/i.test(s)) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith("//")) return undefined;
  return s || undefined;
}
function withSafeLinks(list) {
  if (!Array.isArray(list)) return [];
  return list.map((x) => (x && typeof x === "object" ? { ...x, label: toText(x.label), href: safeHref(x.href) } : toText(x)));
}
const arr = (v) => (Array.isArray(v) ? v : []);
const opt = (v) => (v === undefined || v === null ? undefined : v);
const optText = (v) => (v === undefined || v === null ? undefined : toText(v));
const oneOf = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);

const text = {
  body: { margin: 0, font: "400 14px/1.55 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg1, #18181b)" },
  caption: { margin: 0, font: "400 12px/1.5 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg3, #71717a)" },
  heading: { margin: 0, font: "600 16px/1.35 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg1, #18181b)", letterSpacing: "-0.01em" },
  label: { margin: 0, font: "600 11px/1.4 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg3, #71717a)", textTransform: "uppercase", letterSpacing: "0.06em" },
  code: { margin: 0, font: "500 13px/1.5 var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)", color: "var(--fg1, #18181b)" },
};
const textTag = { body: "p", caption: "p", heading: "h3", label: "span", code: "code" };

export const pixComponents = {
  Column: (c) => h(Stack, { direction: "col", gap: c.get("gap") ?? 12, align: c.get("align") || "stretch", justify: JUSTIFY[c.get("justify")] }, c.children("children")),
  Row: (c) => h(Stack, { direction: "row", gap: c.get("gap") ?? 12, align: c.get("align") || "center", justify: JUSTIFY[c.get("justify")], wrap: c.get("wrap") !== false }, c.children("children")),
  Grid: (c) => h(Grid, { min: c.get("min") ?? 240, cols: opt(c.get("cols")), gap: c.get("gap") ?? 12 }, c.children("children")),
  Card: (c) => h("div", { className: "pix-card", style: { background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 12, padding: 16 } }, c.child("child")),
  Divider: () => h("hr", { style: { border: 0, borderTop: "1px solid var(--border, #e4e4e7)", margin: "4px 0", width: "100%" } }),
  Text: (c) => {
    const variant = oneOf(c.get("variant"), Object.keys(text), "body");
    return h(textTag[variant], { style: text[variant] }, toText(c.get("text")));
  },
  Markdown: (c) => h(Markdown, { text: toText(c.get("text")), streaming: c.bool("streaming") }),
  Badge: (c) => h(Badge, { tone: c.get("tone") || "neutral", dot: c.get("dot") === true, size: c.get("size") || "sm" }, toText(c.get("text"))),
  Callout: (c) => h(Callout, { tone: c.get("tone") || "info", title: optText(c.get("title")), body: optText(c.get("body")), compact: c.get("compact") === true }),
  Alert: (c) => {
    const actions = c.has("actions") ? c.children("actions") : null;
    return h(Alert, { tone: c.get("tone") || "neutral", title: optText(c.get("title")), body: optText(c.get("body")), citation: optText(c.get("citation")), actions: actions && actions.length ? actions : undefined });
  },
  MetricCard: (c) => {
    const v = c.get("value");
    const progress = c.get("progress");
    return h(MetricCard, {
      label: toText(c.get("label")),
      value: typeof v === "number" ? v : toText(v),
      delta: optText(c.get("delta")),
      deltaType: oneOf(c.get("deltaType"), ["up", "down", "neutral"], "neutral"),
      hint: optText(c.get("hint")),
      valueTone: oneOf(c.get("valueTone"), ["default", "danger", "warning", "success"], "default"),
      progress: typeof progress === "number" ? progress : undefined,
    });
  },
  DataTable: (c) => {
    const columns = arr(c.get("columns")).filter((col) => col && typeof col.key === "string").map((col) => ({
      key: col.key, label: toText(col.label ?? col.key), align: col.align, sortable: col.sortable === true, numeric: col.numeric === true, strong: col.strong === true,
    }));
    const rows = arr(c.get("rows")).filter((r) => r && typeof r === "object");
    return h(DataTable, {
      columns,
      rows,
      caption: optText(c.get("caption")),
      searchable: c.get("searchable") !== false,
      emptyMessage: optText(c.get("emptyMessage")),
      onRowClick: c.has("rowAction") ? (row) => c.dispatch("rowAction", { row }) : undefined,
    });
  },
  AIResponse: (c) => h(AIResponse, {
    status: oneOf(c.get("status"), ["generating", "streaming", "done", "error"], "done"),
    text: optText(c.get("text")),
    model: optText(c.get("model")),
    duration: optText(c.get("duration")),
    tokens: optText(c.get("tokens")),
    stage: optText(c.get("stage")),
    error: optText(c.get("error")),
    thinking: optText(c.get("thinking")),
    citations: withSafeLinks(c.get("citations")),
    onStop: c.has("stopAction") ? () => c.dispatch("stopAction") : undefined,
    onRetry: c.has("retryAction") ? () => c.dispatch("retryAction") : undefined,
    onFeedback: c.has("feedbackAction") ? (vote) => c.dispatch("feedbackAction", { vote: vote ?? null }) : undefined,
  }),
  ToolCall: (c) => h(ToolCall, {
    name: toText(c.get("name")),
    status: oneOf(c.get("status"), ["queued", "running", "done", "failed", "approval"], "done"),
    description: optText(c.get("description")),
    input: opt(c.get("input")),
    output: opt(c.get("output")),
    error: optText(c.get("error")),
    duration: optText(c.get("duration")),
    onRetry: c.has("retryAction") ? () => c.dispatch("retryAction") : undefined,
  }, c.has("child") ? c.child("child") : undefined),
  ApprovalCard: (c) => {
    // The decision is recorded locally when status is bound to the data model, as input components do with
    // two-way binding, so the card shows the outcome at once. The agent's next updateDataModel has the last word.
    const decide = (status, extra) => {
      c.setBound("status", status);
      if (extra && typeof extra.reason === "string") c.setBound("rejectReason", extra.reason);
    };
    const reversible = c.get("reversible");
    return h(ApprovalCard, {
      title: optText(c.get("title")),
      action: optText(c.get("summary")),
      agent: optText(c.get("agent")),
      target: optText(c.get("target")),
      reason: optText(c.get("reason")),
      changes: arr(c.get("changes")).filter((x) => x && typeof x === "object").map((x) => ({ ...x, field: toText(x.field) })),
      risk: oneOf(c.get("risk"), ["low", "medium", "high", "critical"], "medium"),
      reversible: reversible === undefined || reversible === null ? undefined : c.bool("reversible"),
      evidence: withSafeLinks(c.get("evidence")),
      expiresAt: optText(c.get("expiresAt")),
      status: oneOf(c.get("status"), ["pending", "approved", "rejected", "expired"], "pending"),
      decidedBy: optText(c.get("decidedBy")),
      decidedAt: optText(c.get("decidedAt")),
      rejectReason: optText(c.get("rejectReason")),
      requireRejectReason: c.get("requireRejectReason") === true,
      approveLabel: optText(c.get("approveLabel")),
      onApprove: () => { decide("approved"); c.dispatch("approveAction"); },
      onReject: (reason) => { decide("rejected", { reason }); c.dispatch("rejectAction", { reason: reason ?? null }); },
      onEdit: c.has("editAction") ? (edits) => { decide("approved"); c.dispatch("editAction", { edits: edits || {} }); } : undefined,
    });
  },
  Conversation: (c) => {
    const messages = arr(c.get("messages")).filter((m) => m && typeof m === "object").map((m, i) => ({
      id: m.id === undefined ? String(i) : toText(m.id),
      role: oneOf(m.role, ["user", "assistant", "system"], "assistant"),
      content: toText(m.content),
      author: optText(m.author),
      time: optText(m.time),
      streaming: m.streaming === true,
    }));
    const height = c.get("height");
    const extra = c.has("children") ? c.children("children") : null;
    return h(Conversation, { messages, label: optText(c.get("label")), height: typeof height === "number" ? height : undefined }, extra && extra.length ? extra : undefined);
  },
  Button: (c) => {
    const variants = { default: "secondary", borderless: "ghost" };
    const raw = c.get("variant") || "primary";
    const variant = variants[raw] || oneOf(raw, ["primary", "filled", "secondary", "outline", "destructive", "ghost"], "primary");
    const checks = c.checks();
    const label = c.has("child") ? c.child("child") : toText(c.get("label"));
    return h(Button, {
      variant,
      size: oneOf(c.get("size"), ["sm", "md", "lg"], "md"),
      disabled: c.bool("disabled") || !checks.valid,
      title: checks.messages.length ? checks.messages.join(" ") : undefined,
      onClick: () => c.dispatch("action"),
    }, label);
  },
};

/** Group component implementations and catalog functions under a catalog id, for the `catalogs` prop. */
export function defineCatalog(catalogId, components, functions = {}) {
  return { catalogId, components, functions };
}

/** The PIX catalog, ready to pass to A2UISurface. It is the default. */
export const pixCatalogImplementation = defineCatalog(PIX_CATALOG_ID, pixComponents, pixFunctions);
