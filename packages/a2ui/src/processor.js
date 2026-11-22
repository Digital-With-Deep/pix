// Message processing for A2UI (Agent-to-User Interface) protocol version 1.0: turns the agent-to-renderer message
// stream into surfaces (a component map plus a data model) and reports problems as renderer-to-agent error messages.
import { A2UI_VERSION } from "./catalog.js";

const MESSAGE_KEYS = ["createSurface", "updateComponents", "updateDataModel", "deleteSurface", "callRendererFunction", "agentFunctionResponse"];
// UAX #31 identifier, as required for component ids by the v1.0 catalog entity naming rules.
const IDENTIFIER = /^[\p{XID_Start}_][\p{XID_Continue}]*$/u;

/** Split a JSON Pointer (RFC 6901) into its reference tokens. "" and "/" both mean the whole document. */
export function parsePointer(pointer) {
  if (pointer === undefined || pointer === null || pointer === "" || pointer === "/") return [];
  const p = String(pointer);
  return (p.startsWith("/") ? p.slice(1) : p).split("/").map((t) => t.replace(/~1/g, "/").replace(/~0/g, "~"));
}

/** Join a base pointer and a pointer that may be relative (no leading slash). */
export function joinPointer(base, pointer) {
  const p = String(pointer ?? "");
  if (p.startsWith("/")) return p;
  if (!p) return base || "/";
  return `${base && base !== "/" ? base : ""}/${p}`;
}

const isObj = (v) => v !== null && typeof v === "object";

export function getAtPointer(doc, pointer) {
  let cur = doc;
  for (const token of parsePointer(pointer)) {
    if (!isObj(cur)) return undefined;
    cur = Array.isArray(cur) ? cur[Number(token)] : cur[token];
  }
  return cur;
}

/**
 * Upsert semantics from the updateDataModel message: replace the value at the pointer, create missing parents,
 * and remove the key when the value is null. Returns a new root; the input is not mutated, so React can compare by reference.
 */
export function setAtPointer(doc, pointer, value) {
  const tokens = parsePointer(pointer);
  if (tokens.length === 0) return value === null || value === undefined ? {} : value;
  const write = (node, i) => {
    const token = tokens[i];
    const last = i === tokens.length - 1;
    const base = isObj(node) ? node : (/^\d+$/.test(token) ? [] : {});
    const copy = Array.isArray(base) ? base.slice() : { ...base };
    const key = Array.isArray(copy) ? (token === "-" ? copy.length : Number(token)) : token;
    if (last) {
      if (value === null || value === undefined) {
        if (Array.isArray(copy)) copy.splice(key, 1); else delete copy[key];
      } else copy[key] = value;
    } else {
      copy[key] = write(copy[key], i + 1);
    }
    return copy;
  };
  return write(doc, 0);
}

/**
 * Create a processor. It holds every surface the agent created and notifies subscribers after each change.
 * `onError` receives renderer-to-agent `error` messages; `onFunctionResponse` receives `rendererFunctionResponse` messages.
 */
export function createA2UIProcessor(options = {}) {
  const catalogIds = new Set(options.catalogIds || []);
  const listeners = new Set();
  let surfaces = new Map();
  let version = 0;
  let created = 0;
  const reported = new Set();

  const emitError = (error, onceKey) => {
    if (onceKey) { if (reported.has(onceKey)) return; reported.add(onceKey); }
    options.onError?.({ version: A2UI_VERSION, error });
  };
  const changed = () => { version++; for (const l of [...listeners]) l(); };

  const validationError = (surfaceId, path, message) => emitError({ code: "VALIDATION_FAILED", surfaceId, path, message });

  function storeComponents(surface, list, path) {
    if (!Array.isArray(list)) return validationError(surface.id, path, "components must be an array.");
    const next = new Map(surface.components);
    list.forEach((c, i) => {
      if (!isObj(c) || typeof c.id !== "string" || !IDENTIFIER.test(c.id)) {
        return validationError(surface.id, `${path}/${i}/id`, "Component id must be a Unicode identifier (UAX #31), such as order_card.");
      }
      if (typeof c.component !== "string" || c.component === "Surface") {
        return validationError(surface.id, `${path}/${i}/component`, "component must name a catalog component other than Surface.");
      }
      // updateComponents replaces a component definition in full.
      next.set(c.id, c);
    });
    return next;
  }

  function process(message) {
    if (!isObj(message)) return emitError({ code: "VALIDATION_FAILED", surfaceId: "", path: "/", message: "A message must be a JSON object." });
    const keys = MESSAGE_KEYS.filter((k) => k in message);
    const body = keys.length === 1 ? message[keys[0]] : undefined;
    const surfaceId = isObj(body) && typeof body.surfaceId === "string" ? body.surfaceId : "";
    if (message.version !== A2UI_VERSION) {
      return validationError(surfaceId, "/version", `Unsupported protocol version ${JSON.stringify(message.version)}; this renderer speaks ${A2UI_VERSION}.`);
    }
    if (keys.length !== 1 || !isObj(body)) {
      return validationError(surfaceId, "/", `A message must hold exactly one of ${MESSAGE_KEYS.join(", ")}.`);
    }
    const kind = keys[0];

    if (kind === "callRendererFunction") {
      // This renderer exposes no agent-callable functions: every function in the PIX catalog is rendererOnly.
      const id = body.functionCallId;
      const name = body.callFunction?.["@call"];
      options.onFunctionResponse?.({
        version: A2UI_VERSION,
        rendererFunctionResponse: { functionCallId: id, error: { code: "INVALID_FUNCTION_CALL", message: `Function ${JSON.stringify(name)} cannot be called by the agent.` } },
      });
      return;
    }
    if (kind === "agentFunctionResponse") return; // No callAgentFunction is ever sent, so there is nothing to match.

    if (kind === "createSurface") {
      if (!surfaceId) return validationError("", "/createSurface/surfaceId", "surfaceId is required.");
      if (surfaces.has(surfaceId)) {
        return emitError({ code: "INTEGRITY_ERROR", surfaceId, message: `Surface ${surfaceId} already exists. Delete it before creating it again.` });
      }
      if (body.catalogId !== undefined && catalogIds.size && !catalogIds.has(body.catalogId)) {
        emitError({ code: "VALIDATION_FAILED", surfaceId, path: "/createSurface/catalogId", message: `Catalog ${body.catalogId} is not supported by this renderer.` });
      }
      const surface = {
        id: surfaceId,
        catalogId: body.catalogId,
        sendDataModel: body.sendDataModel === true,
        metadata: body.metadata,
        // A createSurface that carries both applies dataModel first, so components bind against it on first resolution.
        dataModel: isObj(body.dataModel) ? body.dataModel : {},
        components: new Map(),
        order: created++,
      };
      if (body.components !== undefined) surface.components = storeComponents(surface, body.components, "/createSurface/components") || surface.components;
      surfaces = new Map(surfaces).set(surfaceId, surface);
      return changed();
    }

    const surface = surfaces.get(surfaceId);
    if (!surface) {
      return emitError({ code: "INTEGRITY_ERROR", surfaceId, message: `Surface ${surfaceId || "(none)"} does not exist. Send createSurface first.` });
    }
    if (kind === "deleteSurface") {
      surfaces = new Map(surfaces);
      surfaces.delete(surfaceId);
      return changed();
    }
    if (kind === "updateComponents") {
      const next = storeComponents(surface, body.components, "/updateComponents/components");
      if (!next) return;
      surfaces = new Map(surfaces).set(surfaceId, { ...surface, components: next });
      return changed();
    }
    if (kind === "updateDataModel") {
      if (!("value" in body)) return validationError(surfaceId, "/updateDataModel/value", "value is required. Send null to delete.");
      surfaces = new Map(surfaces).set(surfaceId, { ...surface, dataModel: setAtPointer(surface.dataModel, body.path, body.value) });
      return changed();
    }
  }

  return {
    /** Apply one agent-to-renderer message, or an array of them in order. */
    process(messages) {
      if (Array.isArray(messages)) messages.forEach(process); else process(messages);
    },
    /** Write to a surface's data model from the renderer side (two-way binding). */
    setData(surfaceId, pointer, value) {
      const s = surfaces.get(surfaceId);
      if (!s) return;
      surfaces = new Map(surfaces).set(surfaceId, { ...s, dataModel: setAtPointer(s.dataModel, pointer, value) });
      changed();
    },
    getSurface: (id) => surfaces.get(id),
    getSurfaces: () => [...surfaces.values()].sort((a, b) => a.order - b.order),
    /** The renderer data model object for transport metadata, covering surfaces created with sendDataModel. */
    getDataModelMetadata(surfaceIds) {
      const out = {};
      for (const s of surfaces.values()) if (s.sendDataModel && (!surfaceIds || surfaceIds.includes(s.id))) out[s.id] = s.dataModel;
      return { version: A2UI_VERSION, surfaces: out };
    },
    reportError: emitError,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getVersion: () => version,
  };
}
