// Dynamic value resolution for A2UI (Agent-to-User Interface) v1.0: literals, {"@path"} data bindings (absolute,
// or relative inside list templates), {"@call"} function calls, the @index system function, and the coercion rules.
import { getAtPointer, joinPointer } from "./processor.js";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isBinding = (v) => isObj(v) && typeof v["@path"] === "string";
const isCall = (v) => isObj(v) && typeof v["@call"] === "string";
export { isBinding, isCall };

/** Plain objects escape literal keys that start with "@" by doubling it: "@@type" means "@type". */
function unescapeLiteral(v) {
  if (Array.isArray(v)) return v.map(unescapeLiteral);
  if (!isObj(v)) return v;
  const out = {};
  for (const [k, val] of Object.entries(v)) out[k.startsWith("@@") ? k.slice(1) : k] = unescapeLiteral(val);
  return out;
}

/** Interpolation rule: null and undefined become "", objects and arrays become JSON, everything else String(). */
export function toText(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** DynamicBoolean coercion table from the v1.0 protocol. */
export function toBool(v) {
  if (typeof v === "boolean") return v;
  if (isObj(v) && typeof v.valid === "boolean") return v.valid;
  if (typeof v === "string") return v.toLowerCase() === "true";
  if (typeof v === "number") return v !== 0;
  return false;
}

/**
 * Resolve any Dynamic* value in a scope.
 * scope: { surface, basePath, indices, functions, locale, report, userActivation }
 */
export function resolveValue(v, scope) {
  if (isBinding(v)) return getAtPointer(scope.surface.dataModel, joinPointer(scope.basePath, v["@path"]));
  if (isCall(v)) return callFunction(v, scope);
  return unescapeLiteral(v);
}

/** Absolute data model pointer of a {"@path"} binding, or undefined for any other value. */
export function bindingPointer(v, scope) {
  return isBinding(v) ? joinPointer(scope.basePath, v["@path"]) : undefined;
}

function resolveArgs(args, scope) {
  const out = {};
  if (!isObj(args)) return out;
  for (const [k, v] of Object.entries(args)) out[k] = Array.isArray(v) ? v.map((x) => resolveValue(x, scope)) : resolveValue(v, scope);
  return out;
}

export function callFunction(call, scope, resolvedArgs) {
  const name = call["@call"];
  const fail = (message) => {
    scope.report?.({ code: "EXPRESSION_ERROR", surfaceId: scope.surface.id, message }, `expr:${scope.surface.id}:${name}:${message}`);
    return null;
  };
  const args = resolvedArgs || resolveArgs(call.args, scope);
  if (name === "@index") {
    if (!scope.indices?.length) return fail("@index is only available inside a list template.");
    return scope.indices[scope.indices.length - 1] + (Number(args.offset) || 0);
  }
  const catalogId = call.catalogId ?? scope.callCatalogId ?? scope.surface.catalogId;
  if (!catalogId) return fail(`Function ${name} has no catalogId and the surface has no default catalog.`);
  const impl = scope.functions?.get(catalogId)?.[name];
  if (typeof impl !== "function") return fail(`Function ${name} is not available in catalog ${catalogId}.`);
  try {
    return impl(args, { ...scope, callCatalogId: catalogId });
  } catch (e) {
    return fail(`Function ${name} failed: ${e && e.message ? e.message : String(e)}`);
  }
}

// ---- formatString -------------------------------------------------------------------------------------------

/** Find the index of the "}" that closes a "${" opened just before `start`, honouring nesting and quotes. */
function closeOf(s, start) {
  let depth = 1, quote = null;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"') quote = c;
    else if (c === "$" && s[i + 1] === "{") { depth++; i++; }
    else if (c === "}" && --depth === 0) return i;
  }
  return -1;
}

function splitTopLevel(s) {
  const parts = [];
  let depth = 0, quote = null, cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) { cur += c; if (c === "\\") cur += s[++i] ?? ""; else if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"') quote = c;
    else if (c === "{" || c === "(") depth++;
    else if (c === "}" || c === ")") depth--;
    else if (c === "," && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

function evalArg(raw, scope) {
  const s = raw.trim();
  if (/^'(.*)'$/s.test(s) || /^"(.*)"$/s.test(s)) return s.slice(1, -1).replace(/\\(.)/g, "$1");
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s === "true" || s === "false") return s === "true";
  if (s === "null") return null;
  if (s.startsWith("${") && closeOf(s, 2) === s.length - 1) return evalExpression(s.slice(2, -1), scope);
  return evalExpression(s, scope);
}

function evalExpression(expr, scope) {
  const e = expr.trim();
  const m = /^(@?[\p{XID_Start}_][\p{XID_Continue}]*)\s*\(([\s\S]*)\)$/u.exec(e);
  if (m) {
    const args = {};
    for (const part of splitTopLevel(m[2])) {
      const colon = part.indexOf(":");
      if (colon < 0) continue;
      args[part.slice(0, colon).trim()] = evalArg(part.slice(colon + 1), scope);
    }
    return callFunction({ "@call": m[1] }, scope, args);
  }
  return getAtPointer(scope.surface.dataModel, joinPointer(scope.basePath, e));
}

export function formatString(template, scope) {
  const s = toText(template);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && s[i + 1] === "$" && s[i + 2] === "{") { out += "${"; i += 2; continue; }
    if (s[i] === "$" && s[i + 1] === "{") {
      const end = closeOf(s, i + 2);
      if (end < 0) { out += s.slice(i); break; }
      out += toText(evalExpression(s.slice(i + 2, end), scope));
      i = end;
      continue;
    }
    out += s[i];
  }
  return out;
}

// ---- Functions of the PIX catalog ---------------------------------------------------------------------------

const isEmpty = (v) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

export const pixFunctions = {
  formatString: ({ value }, scope) => formatString(value, scope),
  formatNumber: ({ value, decimals, grouping }, scope) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    const d = decimals === undefined || decimals === null ? undefined : Number(decimals);
    return new Intl.NumberFormat(scope.locale, { minimumFractionDigits: d, maximumFractionDigits: d ?? 3, useGrouping: grouping === undefined ? true : toBool(grouping) }).format(n);
  },
  formatCurrency: ({ value, currency, decimals }, scope) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    const d = decimals === undefined || decimals === null ? undefined : Number(decimals);
    return new Intl.NumberFormat(scope.locale, { style: "currency", currency: String(currency), minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  },
  required: ({ value }) => ({ valid: !isEmpty(value) }),
  regex: ({ value, pattern }) => ({ valid: new RegExp(String(pattern)).test(toText(value)) }),
  length: ({ value, min, max }) => {
    const n = [...toText(value)].length; // code points, so an emoji counts once
    return { valid: (min === undefined || min === null || n >= Number(min)) && (max === undefined || max === null || n <= Number(max)) };
  },
  numeric: ({ value, min, max }) => {
    const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
    if (!Number.isFinite(n)) return { valid: false };
    return { valid: (min === undefined || min === null || n >= Number(min)) && (max === undefined || max === null || n <= Number(max)) };
  },
  email: ({ value }) => ({ valid: /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(toText(value).trim()) }),
  and: ({ values }) => (values || []).every(toBool),
  or: ({ values }) => (values || []).some(toBool),
  not: ({ value }) => !toBool(value),
};

/** Evaluate a component's @checks. Returns { valid, messages }. A failed condition disables a Button. */
export function evaluateChecks(checks, scope) {
  const messages = [];
  let valid = true;
  for (const rule of Array.isArray(checks) ? checks : []) {
    const r = resolveValue(rule?.condition, scope);
    const ok = toBool(r);
    if (!ok) {
      valid = false;
      const msg = (isObj(r) && r.message) || rule?.message;
      if (msg) messages.push(String(msg));
    }
  }
  return { valid, messages };
}
