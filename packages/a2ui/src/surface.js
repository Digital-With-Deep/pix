// The React renderer: walks a surface's adjacency list from "root", resolves bindings against the data model,
// renders each component through its catalog, and reports user actions as renderer-to-agent action messages.
import * as React from "react";
import { A2UI_VERSION } from "./catalog.js";
import { createA2UIProcessor, joinPointer, getAtPointer } from "./processor.js";
import { bindingPointer, evaluateChecks, resolveValue, toBool, toText } from "./expressions.js";
import { pixCatalogImplementation } from "./components.js";

const h = React.createElement;
const { useEffect, useReducer, useRef } = React;

const hiddenText = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };

/** Build the outbound action message for an Action of a component, or run its local function call. */
function performAction(actionDef, extra, { processor, surfaceId, componentId, scopeOf, onAction, report }) {
  if (!actionDef || typeof actionDef !== "object") return;
  const surface = processor.getSurface(surfaceId);
  if (!surface) return;
  // Read the surface again at dispatch time, so context bindings see writes made by this same interaction.
  const scope = scopeOf(surface, true);
  if (actionDef.functionCall) {
    resolveValue(actionDef.functionCall, { ...scope, report: (err, key) => report({ ...err, code: "EXECUTION_ERROR" }, key) });
    return;
  }
  const event = actionDef.event;
  if (!event || typeof event.name !== "string") return;
  const context = {};
  for (const [k, v] of Object.entries(event.context || {})) {
    const r = resolveValue(v, scope);
    context[k] = r === undefined ? null : r;
  }
  Object.assign(context, extra);
  const action = { name: event.name, surfaceId, sourceComponentId: componentId, timestamp: new Date().toISOString(), context };
  if (event.userMessage !== undefined) action.userMessage = toText(resolveValue(event.userMessage, scope));
  const metadata = surface.sendDataModel ? { a2uiRendererDataModel: processor.getDataModelMetadata([surfaceId]) } : undefined;
  onAction?.({ version: A2UI_VERSION, action }, metadata);
}

/**
 * Build the React tree of one surface without hooks. A2UISurface uses it; hosts that manage their own state can too.
 * `catalogs` is an array of catalog implementations (or a Map by catalog id). Actions go to `onAction`, or to
 * `callbacks.current.onAction` when a ref is given so the latest handler is used.
 */
export function renderA2UISurface({ surface, processor, catalogs = [pixCatalogImplementation], functions, locale = "en-US", callbacks, onAction }) {
  if (Array.isArray(catalogs)) catalogs = new Map(catalogs.map((c) => [c.catalogId, c]));
  if (!functions) functions = new Map([...catalogs.values()].map((c) => [c.catalogId, c.functions || {}]));
  if (!callbacks) callbacks = { current: { onAction } };
  const report = (error, key) => processor.reportError(error, key);
  const baseScope = { surface, functions, locale, report };

  function renderNode(id, basePath, indices, ancestors) {
    const def = surface.components.get(id);
    if (!def) return null; // Not arrived yet: progressive rendering shows nothing in its place.
    if (ancestors.includes(id)) {
      report({ code: "VALIDATION_FAILED", surfaceId: surface.id, path: `/components/${id}`, message: `Component ${id} contains itself.` }, `cycle:${surface.id}:${id}`);
      return null;
    }
    const catalogId = def["@catalogId"] ?? surface.catalogId;
    if (!catalogId) {
      report({ code: "VALIDATION_FAILED", surfaceId: surface.id, path: `/components/${id}/@catalogId`, message: `Component ${id} names no catalog and the surface has no default catalog.` }, `nocat:${surface.id}:${id}`);
      return null;
    }
    const impl = catalogs.get(catalogId)?.components?.[def.component];
    if (typeof impl !== "function") {
      report({ code: "VALIDATION_FAILED", surfaceId: surface.id, path: `/components/${id}/component`, message: `Unknown component type ${def.component} in catalog ${catalogId}.` }, `type:${surface.id}:${id}:${def.component}`);
      return null;
    }
    const scope = { ...baseScope, basePath, indices };
    const path = [...ancestors, id];
    const scopeOf = (fresh, userActivation) => ({ ...scope, surface: fresh, userActivation });
    const renderList = (list) => {
      if (Array.isArray(list)) return list.map((cid) => renderKeyed(cid, basePath, indices, path));
      if (list && typeof list === "object" && typeof list.componentId === "string" && typeof list.path === "string") {
        const listPath = joinPointer(basePath, list.path);
        const items = getAtPointer(surface.dataModel, listPath);
        if (!Array.isArray(items)) return [];
        return items.map((_, i) => renderKeyed(list.componentId, `${listPath === "/" ? "" : listPath}/${i}`, [...indices, i], path));
      }
      return [];
    };
    const ctx = {
      id,
      surfaceId: surface.id,
      definition: def,
      has: (name) => def[name] !== undefined,
      get: (name) => resolveValue(def[name], scope),
      bool: (name) => toBool(resolveValue(def[name], scope)),
      resolve: (value) => resolveValue(value, scope),
      bound: (name) => bindingPointer(def[name], scope),
      render: (componentId) => (typeof componentId === "string" ? renderKeyed(componentId, basePath, indices, path) : null),
      child: (name) => (typeof def[name] === "string" ? renderKeyed(def[name], basePath, indices, path) : null),
      children: (name) => renderList(def[name]),
      checks: () => evaluateChecks(def["@checks"], scope),
      setBound: (name, value) => {
        const pointer = bindingPointer(def[name], scope);
        if (pointer) processor.setData(surface.id, pointer, value);
      },
      setData: (pointer, value) => processor.setData(surface.id, joinPointer(basePath, pointer), value),
      dispatch: (name, extra) => performAction(def[name], extra, {
        processor, surfaceId: surface.id, componentId: id, scopeOf, onAction: callbacks.current.onAction, report,
      }),
    };
    let node = impl(ctx);
    const a11y = def["@accessibility"];
    if (a11y && typeof a11y === "object") {
      const label = a11y.label !== undefined ? toText(resolveValue(a11y.label, scope)) : undefined;
      const description = a11y.description !== undefined ? toText(resolveValue(a11y.description, scope)) : undefined;
      const descId = description ? `a2ui-${surface.id}-${id}${basePath.replace(/\//g, "-")}-desc` : undefined;
      node = h("div", {
        role: label ? "group" : undefined,
        "aria-label": label || undefined,
        "aria-describedby": descId,
        "aria-live": a11y.live && a11y.live !== "off" ? a11y.live : undefined,
        "aria-hidden": a11y.hidden !== undefined && toBool(resolveValue(a11y.hidden, scope)) ? true : undefined,
        style: { display: "contents" },
      }, node, description ? h("span", { id: descId, style: hiddenText }, description) : null);
    }
    return node;
  }

  function renderKeyed(id, basePath, indices, ancestors) {
    const node = renderNode(id, basePath, indices, ancestors);
    return node === null ? null : h(React.Fragment, { key: `${id}@${basePath}` }, node);
  }

  return h("div", { "data-a2ui-surface": surface.id, style: { display: "contents" } }, renderKeyed("root", "", [], []));
}

function SurfaceView({ rendering, ...rest }) {
  rendering.current = true;
  const tree = renderA2UISurface(rest);
  rendering.current = false;
  return tree;
}

/**
 * Renders A2UI surfaces with PIX components. Pass the agent's messages in arrival order (append new ones as they
 * stream), or a processor you feed yourself. User actions arrive at onAction as A2UI action messages.
 */
export function A2UISurface({ messages, processor: external, surfaceId, catalogs = [pixCatalogImplementation], onAction, onError, onFunctionResponse, locale = "en-US", style }) {
  const callbacks = useRef({});
  callbacks.current = { onAction, onError, onFunctionResponse };
  const queue = useRef([]);
  const rendering = useRef(false);
  const deliver = (kind, msg) => {
    // Errors found while rendering are delivered after commit, so handlers may set state.
    if (rendering.current) queue.current.push([kind, msg]);
    else callbacks.current[kind]?.(msg);
  };
  const catalogMap = new Map(catalogs.map((c) => [c.catalogId, c]));
  const functions = new Map(catalogs.map((c) => [c.catalogId, c.functions || {}]));

  const own = useRef(null);
  const fed = useRef({ list: null, count: 0 });
  rendering.current = true;
  let processor = external;
  if (!processor) {
    const fresh = () => createA2UIProcessor({
      catalogIds: [...catalogMap.keys()],
      onError: (m) => deliver("onError", m),
      onFunctionResponse: (m) => deliver("onFunctionResponse", m),
    });
    if (!own.current) own.current = fresh();
    const list = Array.isArray(messages) ? messages : [];
    const prev = fed.current;
    const extends_ = prev.list && list.length >= prev.count && (prev.count === 0 || list[prev.count - 1] === prev.list[prev.count - 1]);
    if (prev.list && !extends_) { own.current = fresh(); prev.count = 0; }
    if (list.length > prev.count) own.current.process(list.slice(prev.count));
    fed.current = { list, count: list.length };
    processor = own.current;
  }

  const [, force] = useReducer((n) => n + 1, 0);
  const seen = processor.getVersion();
  useEffect(() => {
    const unsubscribe = processor.subscribe(force);
    if (processor.getVersion() !== seen) force();
    return unsubscribe;
  }, [processor]);
  useEffect(() => {
    const pending = queue.current.splice(0);
    for (const [kind, msg] of pending) callbacks.current[kind]?.(msg);
  });

  const list = surfaceId ? [processor.getSurface(surfaceId)].filter(Boolean) : processor.getSurfaces();
  const out = h("div", { className: "pix-a2ui", style }, list.map((s) => h(SurfaceView, {
    key: s.id, surface: s, processor, catalogs: catalogMap, functions, locale, callbacks, rendering,
  })));
  rendering.current = false;
  return out;
}
