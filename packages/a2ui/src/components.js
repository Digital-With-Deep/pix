// React implementations of the PIX catalog: each A2UI (Agent-to-User Interface) component type maps to a PIX component.
// An implementation receives a render context (see A2UIRenderContext in index.d.ts) and returns a React node.
import * as React from "react";
import {
  AIResponse, Alert, ApprovalCard, Badge, Button, Callout, Checkbox, Conversation, DataTable, DateField, Dialog, Grid, Markdown, MetricCard,
  MultiSelect, RadioGroup, Select, Slider, Stack, Tabs, TextField, Textarea, ToolCall,
} from "@pix-ui/react";
import { PIX_CATALOG_ID } from "./catalog.js";
import { pixFunctions, toBool, toText } from "./expressions.js";

const h = React.createElement;
const { useEffect, useState } = React;
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


/** Image sources: http, https, relative paths and base64 raster data URLs. SVG data URLs and other schemes are dropped. */
export function safeImageSrc(url) {
  if (typeof url !== "string") return undefined;
  const s = url.trim();
  if (/^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(s)) return s;
  return safeHref(s) && !/^mailto:/i.test(s) ? s : undefined;
}

const isEmptyInput = (v) => v === null || v === undefined || v === "" || v === false || (Array.isArray(v) && v.length === 0);
const sameJson = (v) => JSON.stringify(v === undefined ? null : v);
/** True when a component's @checks include a top-level `required` call, so the field shows the required marker. */
const hasRequiredCheck = (def) => Array.isArray(def["@checks"]) && def["@checks"].some((r) => r && r.condition && r.condition["@call"] === "required");

/**
 * Hosts one input component. A value bound with {"@path"} is read from and written to the data model (two-way
 * binding); a literal value is kept in local state so the field still works. Failed @checks show as the field's
 * error once the person has changed or left the field, or at once when the field already holds a value.
 */
function InputHost({ value, bound, write, checks, render }) {
  const [local, setLocal] = useState(value);
  const [touched, setTouched] = useState(false);
  const literalKey = bound ? "" : sameJson(value);
  useEffect(() => { if (!bound) setLocal(value); }, [bound, literalKey]); // the agent replaced the literal
  const current = bound ? value : local;
  const set = (next) => {
    setTouched(true);
    if (bound) write(next); else setLocal(next);
  };
  const error = !checks.valid && (touched || !isEmptyInput(current))
    ? (checks.messages.length ? checks.messages.join(" ") : "Check this value.")
    : undefined;
  return h("div", {
    style: { display: "contents" },
    onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setTouched(true); },
  }, render(current, set, error));
}

function input(c, read, renderField) {
  return h(InputHost, {
    value: read(c.get("value")),
    bound: c.bound("value") !== undefined,
    write: (v) => c.setBound("value", v),
    checks: c.checks(),
    render: renderField,
  });
}

const toNum = (v, fallback) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};
const toList = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== undefined).map(toText) : v === null || v === undefined || v === "" ? [] : [toText(v)]);

/** Tabs keep the selected index locally and render only the selected child. */
function A2UITabs({ titles, panels }) {
  const [index, setIndex] = useState(0);
  const active = Math.min(index, Math.max(0, titles.length - 1));
  return h("div", { style: { display: "flex", flexDirection: "column", gap: 12, minWidth: 0 } },
    h(Tabs, { tabs: titles.map((label, i) => ({ value: String(i), label })), value: String(active), onChange: (v) => setIndex(Number(v)) }),
    h("div", { "aria-label": titles[active] || undefined, role: "group" }, panels[active] ?? null));
}

/** Modal: the trigger opens a PIX Dialog that holds the content child. Escape, the close button and the backdrop close it. */
function A2UIModal({ trigger, content, title, label }) {
  const [open, setOpen] = useState(false);
  return h(React.Fragment, null,
    h("span", { style: { display: "inline-flex" }, onClick: () => setOpen(true) }, trigger),
    h(Dialog, { open, onOpenChange: setOpen, title: title || undefined, label: title ? undefined : label || "Details" }, content));
}

const IMAGE_SIZES = {
  icon: { width: 24, height: 24, borderRadius: "var(--radius-md, 4px)" },
  avatar: { width: 40, height: 40, borderRadius: "var(--radius-full, 9999px)" },
  smallFeature: { width: 100, height: 100, borderRadius: "var(--radius-xl, 8px)" },
  mediumFeature: { width: "100%", maxWidth: 300, height: "auto", borderRadius: "var(--radius-xl, 8px)" },
  largeFeature: { width: "100%", maxHeight: 400, height: "auto", borderRadius: "var(--radius-xl, 8px)" },
  header: { width: "100%", height: 200, borderRadius: "var(--radius-xl, 8px)" },
};
const FIT = { contain: "contain", cover: "cover", fill: "fill", none: "none", scaleDown: "scale-down" };
const LIST_ALIGN = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };

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
  TextField: (c) => {
    const variant = oneOf(c.get("variant"), ["shortText", "longText", "number", "obscured"], "shortText");
    const shared = { label: toText(c.get("label")), placeholder: optText(c.get("placeholder")), required: hasRequiredCheck(c.definition) };
    return input(c, (v) => (v === null || v === undefined ? "" : toText(v)), (value, set, error) => (variant === "longText"
      ? h(Textarea, { ...shared, value, error, onChange: set, rows: 4 })
      : h(TextField, { ...shared, value, error, onChange: set, type: variant === "number" ? "number" : variant === "obscured" ? "password" : "text", inputMode: variant === "number" ? "decimal" : undefined, autoComplete: variant === "obscured" ? "off" : undefined })));
  },
  CheckBox: (c) => input(c, toBool, (value, set, error) =>
    h(Checkbox, { label: toText(c.get("label")), checked: value === true, onChange: (checked) => set(checked === true), error, required: hasRequiredCheck(c.definition) })),
  ChoicePicker: (c) => {
    const options = arr(c.get("options")).filter((o) => o && typeof o === "object" && o.value !== undefined && o.value !== null)
      .map((o) => ({ value: toText(o.value), label: toText(c.resolve(o.label === undefined ? o.value : o.label)) }));
    const multiple = c.get("variant") === "multipleSelection";
    const style = oneOf(c.get("displayStyle"), ["checkbox", "chips", "dropdown"], "checkbox");
    const filterable = c.get("filterable") === true;
    const label = optText(c.get("label"));
    return input(c, toList, (value, set, error) => {
      if (multiple) {
        const dropdown = style === "dropdown" || filterable;
        return h(MultiSelect, { label, options, value, error, variant: dropdown ? "dropdown" : "tiles", minTile: 160, searchable: filterable, onChange: (next) => set(toList(next)) });
      }
      const pick = (v) => set([v]);
      if (style === "checkbox" && !filterable) return h(RadioGroup, { label, options, value: value[0] ?? null, error, onChange: pick });
      return h(Select, { label, options, value: value[0] ?? null, error, searchable: filterable, onChange: pick });
    });
  },
  Slider: (c) => {
    const min = toNum(c.get("min"), 0);
    const max = Math.max(min, toNum(c.get("max"), 100));
    const steps = toNum(c.get("steps"), 0);
    const step = steps >= 1 && max > min ? (max - min) / Math.floor(steps) : "any";
    return input(c, (v) => Math.min(max, Math.max(min, toNum(v, min))), (value, set, error) =>
      h(Slider, { label: optText(c.get("label")), value, min, max, step, showRange: true, error, onChange: set, required: hasRequiredCheck(c.definition) }));
  },
  DateTimeInput: (c) => {
    const date = c.get("enableDate") === true, time = c.get("enableTime") === true;
    const type = date && time ? "datetime" : time ? "time" : "date"; // neither set: a date picker
    return input(c, (v) => (v === null || v === undefined ? "" : toText(v)), (value, set, error) =>
      h(DateField, { type, label: optText(c.get("label")), value, min: optText(c.get("min")), max: optText(c.get("max")), error, onChange: set, required: hasRequiredCheck(c.definition) }));
  },
  Image: (c) => {
    const src = safeImageSrc(toText(c.get("url")));
    if (!src) return null;
    const variant = oneOf(c.get("variant"), Object.keys(IMAGE_SIZES), "mediumFeature");
    const fit = FIT[c.get("fit")] || (variant === "header" ? "cover" : "fill");
    return h("img", {
      src, alt: toText(c.get("description")), loading: "lazy", decoding: "async",
      style: { display: "block", objectFit: fit, background: "var(--bg-muted, #f5f5f4)", flexShrink: 0, ...IMAGE_SIZES[variant] },
    });
  },
  Tabs: (c) => {
    const tabs = arr(c.definition.tabs).filter((t) => t && typeof t === "object");
    return h(A2UITabs, { titles: tabs.map((t) => toText(c.resolve(t.title))), panels: tabs.map((t) => c.render(t.child)) });
  },
  Modal: (c) => {
    const a11y = c.definition["@accessibility"];
    return h(A2UIModal, {
      trigger: c.child("trigger"),
      content: c.child("content"),
      title: optText(c.get("title")),
      label: a11y && a11y.label !== undefined ? toText(c.resolve(a11y.label)) : undefined,
    });
  },
  List: (c) => {
    const horizontal = c.get("direction") === "horizontal";
    const align = LIST_ALIGN[c.get("align")] || "stretch";
    const items = c.children("children").filter(Boolean);
    return h("div", {
      role: "list",
      style: { display: "flex", flexDirection: horizontal ? "row" : "column", alignItems: align, gap: 12, minWidth: 0, ...(horizontal ? { overflowX: "auto", scrollbarWidth: "thin", paddingBottom: 4 } : null) },
    }, items.map((node, i) => h("div", { role: "listitem", key: node.key ?? i, style: horizontal ? { flex: "0 0 auto", maxWidth: 320, minWidth: 0 } : { minWidth: 0 } }, node)));
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
