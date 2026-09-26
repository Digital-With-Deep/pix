import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState: alState, useMemo: alMemo, useRef: alRef, useEffect: alEffect, useCallback: alCb } = React;

const alFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const alMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const AL_ROW = 30;
const AL_RANGES = [["15m", "Last 15 min", 9e5], ["1h", "Last hour", 36e5], ["24h", "Last 24 hours", 864e5], ["7d", "Last 7 days", 6048e5], ["30d", "Last 30 days", 2592e6], ["all", "All time", 0]];
const AL_ICONS = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  x: "M6 6l12 12M18 6L6 18",
  link: "M13.8 10.2a4 4 0 010 5.6l-2.8 2.8a4 4 0 01-5.6-5.6l1.4-1.4m3-3l1.4-1.4a4 4 0 015.6 5.6l-1.4 1.4",
  down: "M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3",
  plus: "M12 5v14m7-7H5", minus: "M5 12h14",
  up: "M5 15l7-7 7 7", dn: "M19 9l-7 7-7-7",
  help: "M8.2 9a3.8 3.8 0 117.4 1.3c0 2.4-3.6 2.7-3.6 5M12 19h.01",
};
const AL_KINDS = { read: "R", write: "W", decision: "D", tool_call: "T", auth: "A", escalation: "E" };
const AL_OUTCOMES = {
  ok: { ink: "var(--truth, #047857)", bg: "var(--truth-bg, #ecfdf5)" },
  flagged: { ink: "var(--fault, #b45309)", bg: "var(--fault-bg, #fffbeb)" },
  denied: { ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)" },
  error: { ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)" },
};
const AL_DEFAULT_FACETS = [
  { key: "agent", label: "Agent" }, { key: "kind", label: "Event kind" }, { key: "system", label: "System" },
  { key: "outcome", label: "Outcome" }, { key: "entity", label: "Entity" }, { key: "control", label: "Control" },
];
const AL_DEFAULT_COLUMNS = [
  { key: "agent", label: "Agent", width: 150 }, { key: "kind", label: "Kind", width: 92 },
  { key: "system", label: "System", width: 130 }, { key: "message", label: "Event", flex: true },
  { key: "outcome", label: "Outcome", width: 84 }, { key: "latency_ms", label: "Latency", width: 70, align: "right" },
];

function AlIcon({ name, size = 13, width = 2 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 }, "aria-hidden": true },
    React.createElement("path", { d: AL_ICONS[name] }));
}

/* ── Query language ─────────────────────────────────────────────────────────
   term            free text, matched against every field
   "a phrase"      exact phrase
   field:value     field equals value (case-insensitive); * is a wildcard
   field:(a OR b)  any of
   -term / NOT     negation
   field>n  >= < <= numeric comparison
   _exists_:field  the field is present                                      */
function alTokenize(q) {
  const out = []; let i = 0;
  while (i < q.length) {
    if (/\s/.test(q[i])) { i++; continue; }
    let j = i, depth = 0, quote = false;
    while (j < q.length && (quote || depth > 0 || !/\s/.test(q[j]))) {
      if (q[j] === '"') quote = !quote; else if (!quote && q[j] === "(") depth++; else if (!quote && q[j] === ")") depth--;
      j++;
    }
    out.push(q.slice(i, j)); i = j;
  }
  return out;
}
function alMatcher(v) {
  const s = String(v).replace(/^"|"$/g, "").toLowerCase();
  if (s.indexOf("*") === -1) return { exact: s };
  return { re: new RegExp("^" + s.split("*").map(p => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$") };
}
export function parseAuditQuery(q) {
  const terms = []; let negNext = false;
  alTokenize(q || "").forEach(tok => {
    if (tok === "AND") return;
    if (tok === "NOT") { negNext = true; return; }
    let neg = negNext; negNext = false;
    if (tok[0] === "-" && tok.length > 1) { neg = !neg; tok = tok.slice(1); }
    let m = /^([A-Za-z_][\w.]*)(>=|<=|>|<)(-?\d+(?:\.\d+)?)$/.exec(tok);
    if (m) { terms.push({ type: "cmp", field: m[1], op: m[2], n: parseFloat(m[3]), neg }); return; }
    m = /^([A-Za-z_][\w.]*):(.+)$/.exec(tok);
    if (m && m[1] === "_exists_") { terms.push({ type: "exists", field: m[2], neg }); return; }
    if (m) {
      const raw = m[2], vals = /^\(.*\)$/.test(raw) ? raw.slice(1, -1).split(/\s+OR\s+/) : [raw];
      terms.push({ type: "field", field: m[1], match: vals.filter(Boolean).map(alMatcher), neg }); return;
    }
    terms.push({ type: "text", text: tok.replace(/^"|"$/g, "").toLowerCase(), neg });
  });
  return terms;
}
function alTest(ev, t) {
  let hit;
  if (t.type === "text") hit = ev._hay.indexOf(t.text) !== -1;
  else if (t.type === "exists") hit = ev[t.field] !== undefined && ev[t.field] !== null && ev[t.field] !== "";
  else if (t.type === "cmp") { const v = Number(ev[t.field]); hit = !isNaN(v) && (t.op === ">" ? v > t.n : t.op === ">=" ? v >= t.n : t.op === "<" ? v < t.n : v <= t.n); }
  else { const v = ev[t.field] === undefined || ev[t.field] === null ? "" : String(ev[t.field]).toLowerCase(); hit = t.match.some(m => m.re ? m.re.test(v) : m.exact === v); }
  return t.neg ? !hit : hit;
}

/* ── URL state: q, f=field:is:a|b (repeatable), t, from, to, s, e ─────────── */
export const AuditLogParams = {
  encode(state) {
    const p = new URLSearchParams();
    if (state.query) p.set("q", state.query);
    (state.filters || []).forEach(f => p.append("f", f.field + ":" + (f.op || "is") + ":" + f.values.map(v => String(v).replace(/[%|]/g, encodeURIComponent)).join("|")));
    if (state.range && state.range !== "24h") p.set("t", state.range);
    if (state.range === "custom" && state.from != null) { p.set("from", String(state.from)); p.set("to", String(state.to)); }
    if (state.sort === "asc") p.set("s", "asc");
    if (state.event) p.set("e", state.event);
    return p.toString();
  },
  parse(search) {
    const p = new URLSearchParams(search || "");
    const filters = p.getAll("f").map(s => { const m = /^([^:]+):(is|is_not):(.*)$/.exec(s); return m ? { field: m[1], op: m[2], values: m[3].split("|").map(decodeURIComponent) } : null; }).filter(Boolean);
    const out = { query: p.get("q") || "", filters, range: p.get("t") || "24h", sort: p.get("s") === "asc" ? "asc" : "desc", event: p.get("e") || undefined };
    if (p.get("from")) { out.from = Number(p.get("from")); out.to = Number(p.get("to")); }
    return out;
  },
};

function alFmtTime(ms) {
  const d = new Date(ms), z = (n, w = 2) => String(n).padStart(w, "0");
  return z(d.getUTCMonth() + 1) + "-" + z(d.getUTCDate()) + " " + z(d.getUTCHours()) + ":" + z(d.getUTCMinutes()) + ":" + z(d.getUTCSeconds()) + "." + z(d.getUTCMilliseconds(), 3);
}
function alFmtBucket(ms, step) {
  const d = new Date(ms), z = n => String(n).padStart(2, "0");
  return step >= 864e5 ? z(d.getUTCMonth() + 1) + "-" + z(d.getUTCDate()) : z(d.getUTCHours()) + ":" + z(d.getUTCMinutes());
}
const alBtn = { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 9px", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3, background: "var(--surface, #fff)", font: `500 11px ${alFont}`, color: "var(--fg2, #52525b)", cursor: "pointer", whiteSpace: "nowrap" };
const alCap = { font: `600 10px ${alFont}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3, #71717a)" };

function AlOutcome({ value }) {
  const t = AL_OUTCOMES[value]; if (!t) return React.createElement("span", { style: { color: "var(--fg-muted, #a1a1aa)" } }, value || "—");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "1px 6px", borderRadius: 2, background: t.bg, color: t.ink, font: `600 10px ${alMono}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor" }} />{value}
    </span>
  );
}
function AlKind({ value }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `400 11px ${alMono}`, color: "var(--fg2, #52525b)" }}>
      <span style={{ width: 15, height: 15, borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", background: value === "write" || value === "decision" ? "var(--zinc-900, #18181b)" : "var(--zinc-100, #f4f4f5)", color: value === "write" || value === "decision" ? "var(--fg-inverse, #fff)" : "var(--fg2, #52525b)", font: `700 9px ${alMono}` }}>{AL_KINDS[value] || "·"}</span>
      {value}
    </span>
  );
}

function AuditLogBase({
  events = [], facets = AL_DEFAULT_FACETS, columns = AL_DEFAULT_COLUMNS,
  defaultQuery = "", defaultFilters = [], defaultRange = "24h", defaultSort = "desc", defaultEvent,
  now, height = 680, title = "Audit log", syncUrl = false, baseUrl,
  onStateChange, onCopyLink, onExport, onOpenEvent, loading = false, style,
}) {
  const boot = alMemo(() => {
    if (syncUrl && typeof location !== "undefined" && location.search) { try { return AuditLogParams.parse(location.search); } catch (e) { /* fall through */ } }
    return { query: defaultQuery, filters: defaultFilters, range: defaultRange, sort: defaultSort, event: defaultEvent };
  }, []);
  const [draft, setDraft] = alState(boot.query);
  const [query, setQuery] = alState(boot.query);
  const [filters, setFilters] = alState(boot.filters);
  const [range, setRange] = alState(boot.range);
  const [custom, setCustom] = alState(boot.from != null ? [boot.from, boot.to] : null);
  const [sort, setSort] = alState(boot.sort);
  const [selId, setSelId] = alState(boot.event);
  const [tab, setTab] = alState("fields");
  const [help, setHelp] = alState(false);
  const [openFacets, setOpenFacets] = alState({});
  const [scrollTop, setScrollTop] = alState(0);
  const [copied, setCopied] = alState(false);
  const [hover, setHover] = alState(null);
  const listRef = alRef(null), inputRef = alRef(null), timer = alRef(null), rootRef = alRef(null);
  const [rootW, setRootW] = alState(1200);
  alEffect(() => {
    const el = rootRef.current; if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(entries => setRootW(entries[0].contentRect.width));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  // Index once per data set: numeric time + one lowercase haystack per event.
  const index = alMemo(() => {
    const rows = events.map(e => {
      const t = typeof e.ts === "number" ? e.ts : Date.parse(e.ts);
      let hay = ""; for (const k in e) { const v = e[k]; if (v !== null && v !== undefined && typeof v !== "object") hay += " " + v; }
      return Object.assign({}, e, { _t: t, _hay: hay.toLowerCase() });
    });
    rows.sort((a, b) => b._t - a._t);
    return rows;
  }, [events]);
  const nowMs = now !== undefined ? (typeof now === "number" ? now : Date.parse(now)) : (index.length ? index[0]._t : Date.now());

  const window_ = alMemo(() => {
    if (range === "custom" && custom) return custom;
    const r = AL_RANGES.find(x => x[0] === range) || AL_RANGES[2];
    if (r[0] === "all") return index.length ? [index[index.length - 1]._t, nowMs] : [nowMs - 864e5, nowMs];
    return [nowMs - r[2], nowMs];
  }, [range, custom, index, nowMs]);

  const parsed = alMemo(() => { try { return { terms: parseAuditQuery(query) }; } catch (e) { return { terms: [], error: "Could not read that query — check the wildcard or brackets." }; } }, [query]);

  const result = alMemo(() => {
    const t0 = typeof performance !== "undefined" ? performance.now() : 0;
    const [from, to] = window_, terms = parsed.terms;
    const fl = filters.map(f => ({ field: f.field, not: f.op === "is_not", set: new Set(f.values.map(String)) }));
    const hits = [];
    for (let i = 0; i < index.length; i++) {
      const ev = index[i];
      if (ev._t < from || ev._t > to) continue;
      let ok = true;
      for (let k = 0; k < fl.length && ok; k++) { const has = fl[k].set.has(String(ev[fl[k].field])); ok = fl[k].not ? !has : has; }
      for (let k = 0; k < terms.length && ok; k++) ok = alTest(ev, terms[k]);
      if (ok) hits.push(ev);
    }
    if (sort === "asc") hits.reverse();
    // facets over the hits
    const counts = {}; facets.forEach(f => { counts[f.key] = new Map(); });
    for (let i = 0; i < hits.length; i++) for (let k = 0; k < facets.length; k++) {
      const v = hits[i][facets[k].key]; if (v === undefined || v === null || v === "") continue;
      const m = counts[facets[k].key]; m.set(v, (m.get(v) || 0) + 1);
    }
    // histogram
    const N = 48, span = Math.max(1, to - from), step = span / N, buckets = new Array(N).fill(0), bad = new Array(N).fill(0);
    for (let i = 0; i < hits.length; i++) { const b = Math.min(N - 1, Math.floor((hits[i]._t - from) / step)); buckets[b]++; if (hits[i].outcome && hits[i].outcome !== "ok") bad[b]++; }
    const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
    return { hits, counts, buckets, bad, step, from, to, ms };
  }, [index, window_, parsed, filters, sort, facets]);

  const state = { query, filters, range, sort, event: selId, from: custom ? custom[0] : undefined, to: custom ? custom[1] : undefined };
  const params = AuditLogParams.encode(state);
  alEffect(() => {
    if (syncUrl && typeof history !== "undefined") { try { history.replaceState(null, "", (params ? "?" + params : location.pathname)); } catch (e) { /* sandboxed frame */ } }
    if (onStateChange) onStateChange(Object.assign({}, state, { params, hits: result.hits.length }));
  }, [params, result.hits.length]);

  const commit = alCb(v => { setQuery(v); setScrollTop(0); if (listRef.current) listRef.current.scrollTop = 0; }, []);
  const onDraft = v => { setDraft(v); clearTimeout(timer.current); timer.current = setTimeout(() => commit(v), 140); };
  const addFilter = (field, value, op = "is") => {
    setFilters(list => {
      const same = list.find(f => f.field === field && (f.op || "is") === op);
      if (same) return list.map(f => f === same ? (f.values.indexOf(String(value)) === -1 ? Object.assign({}, f, { values: f.values.concat(String(value)) }) : f) : f);
      return list.concat({ field, op, values: [String(value)] });
    });
    setScrollTop(0); if (listRef.current) listRef.current.scrollTop = 0;
  };
  const dropFilter = i => setFilters(list => list.filter((_, k) => k !== i));
  const selIndex = selId ? result.hits.findIndex(h => String(h.id) === String(selId)) : -1;
  const sel = selIndex >= 0 ? result.hits[selIndex] : (selId ? index.find(h => String(h.id) === String(selId)) : null);
  const select = ev => { setSelId(ev ? String(ev.id) : undefined); if (ev && onOpenEvent) onOpenEvent(ev); };
  const onKey = e => {
    if (e.key === "Escape") { select(null); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = Math.max(0, Math.min(result.hits.length - 1, (selIndex < 0 ? -1 : selIndex) + (e.key === "ArrowDown" ? 1 : -1)));
    const ev = result.hits[next]; if (!ev) return; select(ev);
    const el = listRef.current; if (el) { const top = next * AL_ROW; if (top < el.scrollTop) el.scrollTop = top; else if (top + AL_ROW > el.scrollTop + el.clientHeight) el.scrollTop = top + AL_ROW - el.clientHeight; }
  };
  const copyLink = () => {
    const base = baseUrl || (typeof location !== "undefined" ? location.origin + location.pathname : "");
    const url = base + (params ? "?" + params : "");
    try { if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {}); } catch (e) { /* no clipboard */ }
    if (onCopyLink) onCopyLink(url);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  const viewH = Math.max(120, height - 250);
  const first = Math.max(0, Math.floor(scrollTop / AL_ROW) - 8);
  const last = Math.min(result.hits.length, Math.ceil((scrollTop + viewH) / AL_ROW) + 8);
  const maxB = Math.max(1, ...result.buckets);
  const minW = 152 + columns.reduce((n, c) => n + (c.flex ? 220 : (c.width || 110)), 0);
  const grid = "128px " + columns.map(c => c.flex ? "minmax(180px,1fr)" : (c.width || 110) + "px").join(" ");
  const cell = (ev, c) => {
    const v = ev[c.key];
    if (c.render) return c.render(ev);
    if (c.key === "outcome") return <AlOutcome value={v} />;
    if (c.key === "kind") return <AlKind value={v} />;
    if (c.key === "latency_ms") return v === undefined || v === null ? "—" : v + " ms";
    return v === undefined || v === null ? "—" : String(v);
  };

  return (
    <div ref={rootRef} onKeyDown={onKey} style={{ display: "flex", flexDirection: "column", height, minWidth: 0, background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: alFont, color: "var(--fg1, #18181b)", ...style }}>
      {/* query bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <span style={alCap}>{title}</span>
        <label style={{ flex: "1 1 320px", minWidth: 0, display: "flex", alignItems: "center", gap: 7, padding: "0 9px", height: 30, border: `1px solid ${parsed.error ? "var(--red-500, #ef4444)" : "var(--border, #e4e4e7)"}`, borderRadius: 3, background: "var(--surface, #fff)", color: "var(--fg-muted, #a1a1aa)" }}>
          <AlIcon name="search" />
          <input ref={inputRef} value={draft} onChange={e => onDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { clearTimeout(timer.current); commit(draft); } e.stopPropagation(); if (e.key === "Escape") e.currentTarget.blur(); }}
            placeholder='kind:write system:"SAP S/4HANA" -outcome:ok latency_ms>200' aria-label="Search the audit log" spellCheck={false}
            style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", font: `400 12px ${alMono}`, color: "var(--fg1, #18181b)" }} />
          {draft && <button type="button" onClick={() => { setDraft(""); commit(""); inputRef.current && inputRef.current.focus(); }} aria-label="Clear query" style={{ display: "flex", border: 0, background: "transparent", color: "inherit", cursor: "pointer", padding: 2 }}><AlIcon name="x" size={12} /></button>}
        </label>
        <select value={range} onChange={e => { setRange(e.target.value); setCustom(null); }} aria-label="Time range" style={{ ...alBtn, height: 30, padding: "0 8px" }}>
          {AL_RANGES.map(r => <option key={r[0]} value={r[0]}>{r[1]}</option>)}
          {range === "custom" && <option value="custom">Custom window</option>}
        </select>
        <button type="button" onClick={() => setHelp(h => !h)} aria-expanded={help} style={alBtn}><AlIcon name="help" />Syntax</button>
        <button type="button" onClick={copyLink} style={alBtn}><AlIcon name="link" />{copied ? "Link copied" : "Copy link"}</button>
        {onExport && <button type="button" onClick={() => onExport(result.hits)} style={alBtn}><AlIcon name="down" />Export</button>}
      </div>
      {help && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", padding: "9px 12px", borderBottom: "1px solid var(--border, #e4e4e7)", background: "var(--zinc-50, #fafafa)", font: `400 11px ${alMono}`, color: "var(--fg2, #52525b)" }}>
          {[["agent:AP-Resolver*", "field match, * wildcard"], ["kind:(read OR write)", "any of"], ["-outcome:ok", "exclude"], ['"cert_valid_to"', "exact phrase"], ["latency_ms>=200", "numeric compare"], ["_exists_:rationale", "field present"]].map(([q, d]) => (
            <button key={q} type="button" onClick={() => { const v = (draft ? draft + " " : "") + q; setDraft(v); commit(v); }} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", font: "inherit", color: "inherit", textAlign: "left" }}>
              <span style={{ color: "var(--fg1, #18181b)", fontWeight: 600 }}>{q}</span> <span style={{ fontFamily: alFont, color: "var(--fg3, #71717a)" }}>{d}</span>
            </button>
          ))}
        </div>
      )}
      {(filters.length > 0 || parsed.error) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "7px 12px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
          {parsed.error && <span style={{ font: `400 11px ${alFont}`, color: "var(--claim, #b91c1c)" }}>{parsed.error}</span>}
          {filters.map((f, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 4px 2px 8px", borderRadius: 3, boxShadow: "inset 0 0 0 1px var(--zinc-200, #e4e4e7)", background: f.op === "is_not" ? "var(--claim-bg, #fef2f2)" : "var(--surface, #fff)", font: `400 11px ${alMono}`, color: f.op === "is_not" ? "var(--claim, #b91c1c)" : "var(--fg2, #52525b)" }}>
              {f.op === "is_not" ? "NOT " : ""}{f.field}: <strong style={{ fontWeight: 600, color: f.op === "is_not" ? "inherit" : "var(--fg1, #18181b)" }}>{f.values.join(" | ")}</strong>
              <button type="button" onClick={() => setFilters(list => list.map((x, k) => k === i ? Object.assign({}, x, { op: x.op === "is_not" ? "is" : "is_not" }) : x))} title="Invert" aria-label={"Invert filter " + f.field} style={{ border: 0, background: "transparent", cursor: "pointer", color: "inherit", padding: "0 2px", font: `600 10px ${alMono}` }}>≠</button>
              <button type="button" onClick={() => dropFilter(i)} aria-label={"Remove filter " + f.field} style={{ display: "flex", border: 0, background: "transparent", cursor: "pointer", color: "inherit", padding: 2 }}><AlIcon name="x" size={10} width={3} /></button>
            </span>
          ))}
          {filters.length > 0 && <button type="button" onClick={() => setFilters([])} style={{ border: 0, background: "transparent", cursor: "pointer", font: `500 11px ${alFont}`, color: "var(--fg3, #71717a)" }}>Clear all</button>}
        </div>
      )}

      {/* histogram */}
      <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
          <span style={{ font: `700 15px ${alFont}`, letterSpacing: "-0.01em" }}>{result.hits.length.toLocaleString()} <span style={{ font: `400 12px ${alFont}`, color: "var(--fg3, #71717a)" }}>{result.hits.length === 1 ? "event" : "events"} of {index.length.toLocaleString()}</span></span>
          <span style={{ font: `400 11px ${alMono}`, color: "var(--fg-muted, #a1a1aa)" }}>{loading ? "loading…" : result.ms.toFixed(1) + " ms"}</span>
          <span style={{ marginLeft: "auto", font: `400 11px ${alMono}`, color: "var(--fg3, #71717a)" }}>
            {hover !== null ? alFmtBucket(result.from + hover * result.step, result.step) + " · " + result.buckets[hover] + " events" + (result.bad[hover] ? " · " + result.bad[hover] + " not ok" : "") : alFmtTime(result.from).slice(0, 11) + " → " + alFmtTime(result.to).slice(0, 11) + " UTC"}
          </span>
          {range === "custom" && <button type="button" onClick={() => { setRange(boot.range === "custom" ? "24h" : boot.range); setCustom(null); }} style={{ ...alBtn, padding: "2px 7px" }}>Reset zoom</button>}
        </div>
        <div role="img" aria-label={"Events over time, " + result.hits.length + " events"} style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 56 }} onMouseLeave={() => setHover(null)}>
          {result.buckets.map((n, b) => (
            <button key={b} type="button" tabIndex={-1} onMouseEnter={() => setHover(b)}
              onClick={() => { if (!n) return; setCustom([Math.floor(result.from + b * result.step), Math.ceil(result.from + (b + 1) * result.step)]); setRange("custom"); }}
              title={n ? "Zoom to this bucket" : undefined}
              style={{ flex: 1, minWidth: 0, height: "100%", padding: 0, border: 0, background: hover === b ? "var(--zinc-100, #f4f4f5)" : "transparent", display: "flex", flexDirection: "column", justifyContent: "flex-end", cursor: n ? "zoom-in" : "default" }}>
              {n > 0 && <span style={{ display: "block", height: Math.max(2, (n / maxB) * 100) + "%", borderRadius: "2px 2px 0 0", background: "var(--emerald-500, #10b981)", position: "relative", overflow: "hidden" }}>
                {result.bad[b] > 0 && <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: (result.bad[b] / n) * 100 + "%", background: "var(--amber-500, #f59e0b)", borderTop: "2px solid var(--surface, #fff)" }} />}
              </span>}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5, font: `400 10px ${alFont}`, color: "var(--fg3, #71717a)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--emerald-500, #10b981)" }} />ok</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--amber-500, #f59e0b)" }} />flagged, denied or error</span>
          <span style={{ marginLeft: "auto" }}>Click a bar to zoom</span>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* Below ~1020px an open event takes the facet rail's room; below ~640px the rail goes entirely. */}
        <div style={{ display: rootW < 640 || (sel && rootW < 1020) ? "none" : "block", width: 208, flexShrink: 0, overflowY: "auto", borderRight: "1px solid var(--border, #e4e4e7)", padding: "8px 0" }}>
          {facets.map(f => {
            const all = Array.from(result.counts[f.key] || []).sort((a, b) => b[1] - a[1]);
            const open = openFacets[f.key], shown = open ? all : all.slice(0, 5);
            return (
              <div key={f.key} style={{ padding: "6px 12px 8px" }}>
                <div style={{ ...alCap, display: "flex", marginBottom: 4 }}>{f.label}<span style={{ marginLeft: "auto", fontFamily: alMono, fontWeight: 400, letterSpacing: 0, color: "var(--fg-muted, #a1a1aa)" }}>{all.length}</span></div>
                {shown.length === 0 && <div style={{ font: `400 11px ${alFont}`, color: "var(--fg-muted, #a1a1aa)" }}>No values</div>}
                {shown.map(([v, n]) => (
                  <div key={String(v)} className="al-facet" style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, height: 22 }}>
                    <span style={{ position: "absolute", left: -4, top: 2, bottom: 2, width: `calc(${(n / Math.max(1, result.hits.length)) * 100}% + 4px)`, background: "var(--zinc-100, #f4f4f5)", borderRadius: 2 }} />
                    <button type="button" onClick={() => addFilter(f.key, v)} title={"Filter for " + v} style={{ position: "relative", flex: 1, minWidth: 0, border: 0, background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", font: `400 11px ${alMono}`, color: "var(--fg1, #18181b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(v)}</button>
                    <span style={{ position: "relative", font: `400 10px ${alMono}`, color: "var(--fg3, #71717a)" }}>{n.toLocaleString()}</span>
                    <button type="button" onClick={() => addFilter(f.key, v, "is_not")} title={"Exclude " + v} aria-label={"Exclude " + v} style={{ position: "relative", display: "flex", border: 0, background: "transparent", padding: 2, cursor: "pointer", color: "var(--fg-muted, #a1a1aa)" }}><AlIcon name="minus" size={11} width={2.5} /></button>
                  </div>
                ))}
                {all.length > 5 && <button type="button" onClick={() => setOpenFacets(o => Object.assign({}, o, { [f.key]: !open }))} style={{ border: 0, background: "transparent", padding: "3px 0 0", cursor: "pointer", font: `500 11px ${alFont}`, color: "var(--accent-fg, #047857)" }}>{open ? "Show fewer" : "Show all " + all.length}</button>}
              </div>
            );
          })}
        </div>

        <div ref={listRef} tabIndex={0} role="listbox" aria-label="Events" onScroll={e => setScrollTop(Math.max(0, e.currentTarget.scrollTop))} style={{ flex: 1, minWidth: 0, overflow: "auto", outline: "none", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 1, display: "grid", gridTemplateColumns: grid, gap: 0, padding: "0 12px", height: 28, minWidth: minW, boxSizing: "border-box", alignItems: "center", borderBottom: "1px solid var(--border, #e4e4e7)", background: "var(--zinc-50, #fafafa)" }}>
            <button type="button" onClick={() => setSort(s => s === "desc" ? "asc" : "desc")} style={{ ...alCap, display: "inline-flex", alignItems: "center", gap: 4, border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "var(--fg1, #18181b)" }} aria-label={"Sort by time, " + (sort === "desc" ? "newest first" : "oldest first")}>Time (UTC)<AlIcon name={sort === "desc" ? "dn" : "up"} size={10} width={3} /></button>
            {columns.map(c => <span key={c.key} style={{ ...alCap, textAlign: c.align || "left", paddingRight: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>)}
          </div>
          <div style={{ minWidth: minW }}>
            {result.hits.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <div style={{ font: `600 13px ${alFont}` }}>No events match</div>
                <div style={{ marginTop: 4, font: `400 12px ${alFont}`, color: "var(--fg3, #71717a)" }}>Widen the time range or remove a filter. Nothing is hidden — the log is append-only.</div>
              </div>
            ) : (
              <div style={{ height: result.hits.length * AL_ROW, position: "relative" }}>
                {result.hits.slice(first, last).map((ev, k) => {
                  const i = first + k, on = String(ev.id) === String(selId), bad = ev.outcome && ev.outcome !== "ok";
                  return (
                    <div key={ev.id} role="option" aria-selected={on} onClick={() => select(on ? null : ev)}
                      style={{ position: "absolute", top: i * AL_ROW, left: 0, right: 0, height: AL_ROW, boxSizing: "border-box", display: "grid", gridTemplateColumns: grid, alignItems: "center", padding: "0 12px", cursor: "pointer", borderBottom: "1px solid var(--divider, #f4f4f5)", background: on ? "var(--accent-bg, #ecfdf5)" : "transparent", boxShadow: on ? "inset 2px 0 0 var(--emerald-500, #10b981)" : bad ? "inset 2px 0 0 var(--amber-500, #f59e0b)" : "none" }}>
                      <span style={{ font: `400 11px ${alMono}`, color: "var(--fg3, #71717a)", whiteSpace: "nowrap" }}>{alFmtTime(ev._t)}</span>
                      {columns.map(c => <span key={c.key} style={{ minWidth: 0, paddingRight: 10, textAlign: c.align || "left", font: `400 12px ${c.key === "message" ? alFont : alMono}`, color: c.key === "message" ? "var(--fg1, #18181b)" : "var(--fg2, #52525b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cell(ev, c)}</span>)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {sel && (
          <div style={{ width: rootW < 1020 ? 320 : 360, maxWidth: "60%", flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border, #e4e4e7)", background: "var(--surface, #fff)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
              <span style={{ font: `600 12px ${alMono}` }}>{String(sel.id)}</span><AlOutcome value={sel.outcome} />
              <button type="button" onClick={() => select(null)} aria-label="Close event" style={{ marginLeft: "auto", display: "flex", border: 0, background: "transparent", cursor: "pointer", color: "var(--fg3, #71717a)", padding: 3 }}><AlIcon name="x" /></button>
            </div>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--divider, #f4f4f5)" }}>
              <div style={{ font: `500 13px/1.45 ${alFont}` }}>{sel.message}</div>
              <div style={{ marginTop: 4, font: `400 11px ${alMono}`, color: "var(--fg3, #71717a)" }}>{alFmtTime(sel._t)} UTC</div>
              {sel.rationale && (
                <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 3, border: "1px solid var(--border, #e4e4e7)", background: "var(--zinc-50, #fafafa)" }}>
                  <div style={alCap}>Decision rationale</div>
                  <div style={{ marginTop: 4, font: `400 12px/1.55 ${alFont}`, color: "var(--fg2, #52525b)" }}>{sel.rationale}</div>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {sel.run_id && <button type="button" style={alBtn} onClick={() => { setFilters([{ field: "run_id", op: "is", values: [String(sel.run_id)] }]); setDraft(""); commit(""); setSort("asc"); }}>Show the whole run</button>}
                {sel.trace_id && <button type="button" style={alBtn} onClick={() => addFilter("trace_id", sel.trace_id)}>Same trace</button>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 2, padding: "6px 12px 0", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
              {[["fields", "Fields"], ["json", "JSON"]].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} style={{ border: 0, background: "transparent", padding: "5px 8px 7px", cursor: "pointer", font: `${tab === k ? 600 : 500} 12px ${alFont}`, color: tab === k ? "var(--fg1, #18181b)" : "var(--fg3, #71717a)", boxShadow: tab === k ? "inset 0 -2px 0 var(--zinc-900, #18181b)" : "none" }}>{l}</button>
              ))}
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {tab === "json" ? (
                <pre style={{ margin: 0, padding: 12, background: "transparent", borderRadius: 0, font: `400 11px/1.6 ${alMono}`, color: "var(--fg1, #18181b)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(Object.fromEntries(Object.entries(sel).filter(([k]) => k[0] !== "_")), null, 2)}</pre>
              ) : (
                Object.entries(sel).filter(([k, v]) => k[0] !== "_" && k !== "message" && k !== "rationale" && v !== undefined && v !== null).map(([k, v]) => {
                  const flat = typeof v !== "object";
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "5px 12px", borderBottom: "1px solid var(--divider, #f4f4f5)" }}>
                      <span style={{ width: 96, flexShrink: 0, font: `400 11px ${alMono}`, color: "var(--fg3, #71717a)", paddingTop: 1 }}>{k}</span>
                      <span style={{ flex: 1, minWidth: 0, font: `400 11px/1.5 ${alMono}`, color: "var(--fg1, #18181b)", wordBreak: "break-word" }}>{flat ? String(v) : JSON.stringify(v)}</span>
                      {flat && <span style={{ display: "flex", flexShrink: 0 }}>
                        <button type="button" title={"Filter for " + k} aria-label={"Filter for " + k + " " + v} onClick={() => addFilter(k, v)} style={{ display: "flex", border: 0, background: "transparent", padding: 3, cursor: "pointer", color: "var(--fg-muted, #a1a1aa)" }}><AlIcon name="plus" size={11} width={2.5} /></button>
                        <button type="button" title={"Exclude " + k} aria-label={"Exclude " + k + " " + v} onClick={() => addFilter(k, v, "is_not")} style={{ display: "flex", border: 0, background: "transparent", padding: 3, cursor: "pointer", color: "var(--fg-muted, #a1a1aa)" }}><AlIcon name="minus" size={11} width={2.5} /></button>
                      </span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function AuditLog(props) {
  if (props.loading && !(props.events || []).length) return <Skeleton label="Loading audit log" style={{ height: props.height || 680, display: "flex", flexDirection: "column", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", ...props.style }}><div style={{ display: "flex", gap: 8, padding: 10, borderBottom: "1px solid var(--border, #e4e4e7)" }}><Skeleton height={32} /><Skeleton width={120} height={32} /></div><div style={{ padding: 10 }}><Skeleton.Chart bars={48} height={70} style={{ border: 0, padding: 0 }} /></div><div style={{ flex: 1 }}><Skeleton.Table columns={5} rows={12} caption={false} style={{ border: 0, borderRadius: 0 }} /></div></Skeleton>;
  return <AuditLogBase {...props} />;
}
