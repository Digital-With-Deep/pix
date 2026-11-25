// Unit tests for @pix-ui/a2ui. Run with `node --test test/` after `pnpm build` (they import @pix-ui/react from dist).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { ApprovalCard, Button } from "@pix-ui/react";
import {
  A2UISurface, A2UI_VERSION, PIX_CATALOG_ID, createA2UIProcessor, pixCatalog, pixFunctions, renderA2UISurface, rendererCapabilities, setAtPointer, getAtPointer, formatString,
} from "../src/index.js";
import { refundStream, SURFACE } from "./fixtures/refund-stream.js";

const h = React.createElement;

/** Depth-first search of an unrendered React element tree for elements of a given type. */
function findAll(node, type, out = []) {
  if (Array.isArray(node)) { node.forEach((n) => findAll(n, type, out)); return out; }
  if (!node || typeof node !== "object" || !node.props) return out;
  if (node.type === type) out.push(node);
  findAll(node.props.children, type, out);
  return out;
}

function setup(messages = refundStream) {
  const errors = [];
  const processor = createA2UIProcessor({ catalogIds: [PIX_CATALOG_ID], onError: (m) => errors.push(m) });
  processor.process(messages);
  const actions = [];
  const tree = () => renderA2UISurface({ surface: processor.getSurface(SURFACE), processor, onAction: (m, meta) => actions.push({ m, meta }) });
  return { processor, errors, actions, tree };
}

test("catalog: well-formed v1.0 catalog definition", () => {
  assert.equal(pixCatalog.catalogId, PIX_CATALOG_ID);
  assert.equal(pixCatalog.$id, PIX_CATALOG_ID);
  assert.equal(pixCatalog.protocolVersion, "1.0");
  const allowedKeys = ["$schema", "$id", "protocolVersion", "title", "description", "catalogId", "instructions", "metadata", "components", "functions", "$defs"];
  for (const k of Object.keys(pixCatalog)) assert.ok(allowedKeys.includes(k), `top-level key ${k}`);
  const ident = /^[\p{XID_Start}_][\p{XID_Continue}]*$/u;
  const names = Object.keys(pixCatalog.components);
  for (const name of names) {
    assert.match(name, ident);
    assert.notEqual(name, "Surface");
    const def = pixCatalog.components[name];
    const props = def.properties || def.allOf.find((x) => x.properties).properties;
    assert.deepEqual(props.component, { const: name }, `${name} discriminator`);
    assert.equal(def.oneOf, undefined);
    assert.equal(def.anyOf, undefined);
  }
  assert.deepEqual(pixCatalog.$defs.anyComponent.oneOf.map((r) => r.$ref), names.map((n) => `#/components/${n}`));
  for (const [name, f] of Object.entries(pixCatalog.functions)) {
    assert.equal(f.properties["@call"].const, name);
    assert.ok(["string", "number", "boolean", "array", "object", "validationResult", "any", "void"].includes(f.returnType));
  }
  const allowed = new Set(["ComponentId", "Child", "ChildList", "DynamicString", "DynamicNumber", "DynamicBoolean", "DynamicStringList", "DynamicValue", "AccessibilityAttributes", "CheckRule", "Checkable", "Action", "DataBinding", "FunctionCall"]);
  const refs = JSON.stringify(pixCatalog).match(/"\$ref":"[^"]+"/g);
  for (const r of refs) {
    const target = r.slice(8, -1);
    if (target.startsWith("common_types.json#/$defs/")) assert.ok(allowed.has(target.split("/").pop()), target);
    else assert.match(target, /^#\/(\$defs|components|functions)\//, target);
  }
  for (const c of ["Text", "Markdown", "Button", "Badge", "Callout", "Alert", "MetricCard", "DataTable", "AIResponse", "ToolCall", "ApprovalCard", "Conversation", "Column", "Row", "Grid"]) {
    assert.ok(names.includes(c), `covers ${c}`);
  }
});

test("capabilities advertise the PIX catalog", () => {
  assert.deepEqual(rendererCapabilities(), { "1.0": { supportedCatalogIds: [PIX_CATALOG_ID] } });
  assert.equal(rendererCapabilities({ inline: true })["1.0"].inlineCatalogs[0], pixCatalog);
});

test("processor: surfaces, upserts, deletes and data model semantics", () => {
  const { processor, errors } = setup();
  assert.deepEqual(errors, []);
  const s = processor.getSurface(SURFACE);
  assert.equal(s.components.size, 9);
  assert.equal(s.dataModel.answer.status, "done");
  assert.equal(s.dataModel.order.lines.length, 2);

  assert.deepEqual(setAtPointer({ a: { b: 1, c: 2 } }, "/a/b", null), { a: { c: 2 } });
  assert.deepEqual(setAtPointer({}, "/x/y", 3), { x: { y: 3 } });
  assert.deepEqual(setAtPointer({ a: 1 }, "/", { b: 2 }), { b: 2 });
  assert.equal(getAtPointer({ "a/b": { "m~n": 7 } }, "/a~1b/m~0n"), 7);

  processor.process({ version: "1.0", deleteSurface: { surfaceId: SURFACE } });
  assert.equal(processor.getSurface(SURFACE), undefined);
});

test("processor: reports protocol errors as renderer-to-agent messages", () => {
  const errors = [];
  const responses = [];
  const p = createA2UIProcessor({ catalogIds: [PIX_CATALOG_ID], onError: (m) => errors.push(m.error), onFunctionResponse: (m) => responses.push(m) });
  p.process({ version: "1.0", createSurface: { surfaceId: "a", catalogId: PIX_CATALOG_ID } });
  p.process({ version: "1.0", createSurface: { surfaceId: "a", catalogId: PIX_CATALOG_ID } });
  p.process({ version: "1.0", updateDataModel: { surfaceId: "missing", value: {} } });
  p.process({ version: "0.9", updateComponents: { surfaceId: "a", components: [] } });
  p.process({ version: "1.0", updateComponents: { surfaceId: "a", components: [{ id: "bad-id", component: "Text", text: "x" }] } });
  p.process({ version: "1.0", callRendererFunction: { functionCallId: "call_1", callFunction: { "@call": "formatString", catalogId: PIX_CATALOG_ID, args: { value: "x" } } } });
  assert.deepEqual(errors.map((e) => e.code), ["INTEGRITY_ERROR", "INTEGRITY_ERROR", "VALIDATION_FAILED", "VALIDATION_FAILED"]);
  assert.equal(errors[3].path, "/updateComponents/components/0/id");
  assert.deepEqual(responses, [{ version: A2UI_VERSION, rendererFunctionResponse: { functionCallId: "call_1", error: { code: "INVALID_FUNCTION_CALL", message: 'Function "formatString" cannot be called by the agent.' } } }]);
});

test("renders the recorded stream with PIX components", () => {
  const html = renderToString(h(A2UISurface, { messages: refundStream }));
  assert.match(html, /data-a2ui-surface="refund_review"/);
  assert.match(html, /Refund review for ORD-20417/); // formatString with an absolute path
  assert.match(html, /\$184\.50/); // formatCurrency in a MetricCard
  assert.match(html, /orders\.lookup/); // ToolCall
  assert.match(html, /Issue a refund/); // ApprovalCard nested as the ToolCall child
  assert.match(html, /support-agent/);
  assert.match(html, /<strong[^>]*>damaged<\/strong>/); // AIResponse renders streamed text as Markdown
  assert.match(html, /1\. Ceramic mug x2/); // list template, @index and relative paths
  assert.match(html, /2\. Linen towel x1/);
  assert.match(html, /https:\/\/support\.example\.com\/tickets\/5531/);
  assert.doesNotMatch(html, /javascript:/); // agent links are limited to safe schemes
});

test("progressive rendering: nothing until root, then partial trees", () => {
  const empty = renderToString(h(A2UISurface, { messages: [{ version: "1.0", createSurface: { surfaceId: SURFACE, catalogId: PIX_CATALOG_ID } }] }));
  assert.match(empty, /<div data-a2ui-surface="refund_review" style="display:contents"><\/div>/);
  const html = renderToString(h(A2UISurface, { messages: refundStream.slice(0, 1) }));
  assert.match(html, /Refund review for ORD-20417/);
  assert.doesNotMatch(html, /orders\.lookup/);
});

test("approving sends the approve action with resolved context and records the decision", () => {
  const { processor, actions, tree } = setup();
  const [card] = findAll(tree(), ApprovalCard);
  assert.ok(card, "ApprovalCard rendered");
  assert.equal(card.props.status, "pending");
  card.props.onApprove();

  assert.equal(actions.length, 1);
  const { m, meta } = actions[0];
  assert.equal(m.version, "1.0");
  assert.equal(m.action.name, "refund.approve");
  assert.equal(m.action.surfaceId, SURFACE);
  assert.equal(m.action.sourceComponentId, "refund_approval");
  assert.equal(m.action.userMessage, "Approved the refund");
  assert.deepEqual(m.action.context, { orderId: "ORD-20417", amount: 184.5 });
  assert.ok(!Number.isNaN(Date.parse(m.action.timestamp)));
  // sendDataModel: the surface's data model rides along as transport metadata, including the local decision.
  assert.equal(meta.a2uiRendererDataModel.version, "1.0");
  assert.equal(meta.a2uiRendererDataModel.surfaces[SURFACE].approval.status, "approved");

  assert.equal(processor.getSurface(SURFACE).dataModel.approval.status, "approved");
  assert.equal(findAll(tree(), ApprovalCard)[0].props.status, "approved");
});

test("rejecting adds the reason; editing adds the edits", () => {
  const { actions, tree } = setup();
  findAll(tree(), ApprovalCard)[0].props.onReject("Photos do not show damage");
  assert.deepEqual(actions[0].m.action.context, { orderId: "ORD-20417", reason: "Photos do not show damage" });
  assert.equal(actions[0].m.action.name, "refund.reject");

  const second = setup();
  second.tree();
  findAll(second.tree(), ApprovalCard)[0].props.onEdit({ amount: "$90.00" });
  assert.equal(second.actions[0].m.action.name, "refund.edit");
  assert.deepEqual(second.actions[0].m.action.context, { orderId: "ORD-20417", edits: { amount: "$90.00" } });
});

test("buttons dispatch actions and are disabled by failing checks", () => {
  const messages = [{
    version: "1.0",
    createSurface: {
      surfaceId: SURFACE, catalogId: PIX_CATALOG_ID, dataModel: { note: "" },
      components: [
        { id: "root", component: "Row", children: ["send", "skip"] },
        { id: "send", component: "Button", label: "Send note", action: { event: { name: "note.send", context: { note: { "@path": "/note" } } } }, "@checks": [{ condition: { "@call": "required", args: { value: { "@path": "/note" } } }, message: "Write a note first" }] },
        { id: "skip", component: "Button", variant: "borderless", label: "Skip", action: { event: { name: "note.skip" } } },
      ],
    },
  }];
  const { processor, actions, tree } = setup(messages);
  let [send, skip] = findAll(tree(), Button);
  assert.equal(send.props.disabled, true);
  assert.equal(send.props.title, "Write a note first");
  assert.equal(skip.props.variant, "ghost");
  skip.props.onClick();
  assert.deepEqual(actions[0].m.action.context, {});
  assert.equal(actions[0].meta, undefined); // no sendDataModel on this surface

  processor.setData(SURFACE, "/note", "Left with the front desk");
  [send] = findAll(tree(), Button);
  assert.equal(send.props.disabled, false);
  send.props.onClick();
  assert.deepEqual(actions[1].m.action.context, { note: "Left with the front desk" });
});

test("unknown components and missing catalogs are reported, siblings still render", () => {
  const errors = [];
  const html = renderToString(h(A2UISurface, {
    messages: [{
      version: "1.0",
      createSurface: {
        surfaceId: SURFACE, catalogId: PIX_CATALOG_ID,
        components: [
          { id: "root", component: "Column", children: ["chart", "ok", "foreign"] },
          { id: "chart", component: "Sparkline" },
          { id: "ok", component: "Badge", text: "Still here", tone: "success" },
          { id: "foreign", component: "Text", "@catalogId": "https://example.com/other/catalog.json", text: "x" },
        ],
      },
    }],
    onError: (m) => errors.push(m),
  }));
  assert.match(html, /Still here/);
  // Errors found during render are delivered after commit, which server rendering never reaches; use a processor.
  const p = createA2UIProcessor({ onError: (m) => errors.push(m.error) });
  p.process({ version: "1.0", createSurface: { surfaceId: "s", catalogId: PIX_CATALOG_ID, components: [{ id: "root", component: "Sparkline" }] } });
  renderToString(renderA2UISurface({ surface: p.getSurface("s"), processor: p }));
  assert.equal(errors.at(-1).code, "VALIDATION_FAILED");
  assert.match(errors.at(-1).message, /Unknown component type Sparkline/);
});

test("formatString: escapes, nested calls and type conversion", () => {
  const scope = { surface: { id: "s", catalogId: PIX_CATALOG_ID, dataModel: { n: 1234.5, o: { a: 1 }, z: null } }, basePath: "", indices: [], functions: new Map([[PIX_CATALOG_ID, pixFunctions]]), locale: "en-US" };
  assert.equal(formatString("\\${literal} ${/z}|${/o}", scope), "${literal} |{\"a\":1}");
  assert.equal(formatString("Total ${formatNumber(value:${/n}, decimals:1)}", scope), "Total 1,234.5");
});

