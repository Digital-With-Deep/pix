import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState: useSS, useEffect: useSSEffect, useRef: useSSRef } = React;

const ssFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const SS_ICONS = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  close: "M6 18L18 6M6 6l12 12",
  back: "M15 19l-7-7 7-7",
  plus: "M12 5v14M5 12h14",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  link: "M13.5 10.5a4 4 0 010 5.66l-2.83 2.83a4 4 0 01-5.66-5.66l1.42-1.41M10.5 13.5a4 4 0 010-5.66l2.83-2.83a4 4 0 015.66 5.66l-1.42 1.41",
  check: "M5 13l4 4L19 7",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0119 7a4 4 0 01-3 3.87",
};

function SSIcon({ name, size = 14, color = "currentColor", width = 2 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, display: "block" } },
    React.createElement("path", { d: SS_ICONS[name] }));
}

/* ---- URL serialization ---------------------------------------------- */
export const SavedSearchParams = {
  encode({ query = "", filters = [], view } = {}) {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (view) p.set("view", view);
    if (filters.length) p.set("f", filters.map(f => `${f.field}:${f.op || "is"}:${(f.values || []).join("|")}`).join(";"));
    return p.toString();
  },
  parse(search) {
    const p = new URLSearchParams((search || "").replace(/^[?#]/, ""));
    const raw = p.get("f");
    const filters = !raw ? [] : raw.split(";").filter(Boolean).map(seg => {
      const [field, op, values] = seg.split(":");
      return { field, op: op === "is_not" ? "is_not" : "is", values: (values || "").split("|").filter(Boolean) };
    });
    return { query: p.get("q") || "", view: p.get("view") || undefined, filters };
  },
};

function labelFor(fields, key) { const f = fields.find(x => x.key === key); return f ? f.label : key; }
function optLabel(fields, key, v) {
  const f = fields.find(x => x.key === key); if (!f) return v;
  const o = (f.options || []).find(x => (typeof x === "string" ? x : x.value) === v);
  return !o ? v : typeof o === "string" ? o : o.label;
}

/* ---- pieces ---------------------------------------------------------- */
function FilterChip({ fields, filter, onEdit, onRemove }) {
  const vals = (filter.values || []).map(v => optLabel(fields, filter.field, v)).join(", ");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%", padding: "3px 4px 3px 8px", background: "var(--surface, #fff)",
      border: "1px solid var(--border, #e4e4e7)", borderRadius: 3, font: `500 12px ${ssFont}`, color: "var(--fg2, #3f3f46)" }}>
      <button onClick={onEdit} style={{ display: "inline-flex", alignItems: "baseline", gap: 5, border: 0, background: "transparent", padding: 0, cursor: "pointer",
        font: `500 12px ${ssFont}`, color: "var(--fg2, #3f3f46)", minWidth: 0 }}>
        <span style={{ whiteSpace: "nowrap" }}>{labelFor(fields, filter.field)}</span>
        <span style={{ color: "var(--fg3, #71717a)", font: `400 12px ${ssFont}` }}>{filter.op === "is_not" ? "is not" : "is"}</span>
        <span style={{ font: `600 12px ${ssFont}`, color: "var(--emerald-700, #047857)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vals || "any"}</span>
      </button>
      <button onClick={onRemove} title="Remove filter" style={{ border: 0, background: "transparent", padding: 2, cursor: "pointer", color: "var(--fg-muted, #a1a1aa)", display: "flex", borderRadius: 2 }}>
        <SSIcon name="close" size={12} />
      </button>
    </span>
  );
}

function FieldPopover({ fields, draft, onPick, onBack, onToggleValue, onSetOp, onClose }) {
  const field = draft ? fields.find(f => f.key === draft.field) : null;
  const row = { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", border: 0, background: "transparent", cursor: "pointer", font: `400 13px ${ssFont}`, color: "var(--fg1, #18181b)", textAlign: "left" };
  return (
    <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 220, background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3,
      boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1))", zIndex: 50, padding: "4px 0" }}>
      {!field && fields.map(f => (
        <button key={f.key} onClick={() => onPick(f.key)} style={row}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--zinc-50, #fafafa)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{f.label}</button>
      ))}
      {field && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px 8px" }}>
            <button onClick={onBack} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "var(--fg3, #71717a)", display: "flex" }}><SSIcon name="back" size={13} /></button>
            <span style={{ font: `600 12px ${ssFont}`, color: "var(--fg1, #18181b)" }}>{field.label}</span>
          </div>
          <div style={{ display: "flex", gap: 0, margin: "0 10px 8px", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3, overflow: "hidden" }}>
            {[["is", "Is"], ["is_not", "Is not"]].map(([op, lbl]) => (
              <button key={op} onClick={() => onSetOp(op)} style={{ flex: 1, padding: "5px 0", border: 0, cursor: "pointer", font: `600 12px ${ssFont}`,
                background: draft.op === op ? "var(--fg1, #18181b)" : "var(--surface, #fff)", color: draft.op === op ? "var(--fg-inverse, #fff)" : "var(--fg2, #3f3f46)" }}>{lbl}</button>
            ))}
          </div>
          <div style={{ maxHeight: 190, overflowY: "auto", paddingBottom: 4 }}>
            {(field.options || []).map(o => {
              const val = typeof o === "string" ? o : o.value;
              const lbl = typeof o === "string" ? o : o.label;
              const on = (draft.values || []).includes(val);
              return (
                <button key={val} onClick={() => onToggleValue(val)} style={{ ...row, padding: "7px 10px" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--zinc-50, #fafafa)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <span style={{ width: 14, height: 14, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${on ? "var(--emerald-600, #059669)" : "var(--border-strong, #d4d4d8)"}`, background: on ? "var(--emerald-600, #059669)" : "var(--surface, #fff)" }}>
                    {on && <SSIcon name="check" size={10} color="#fff" width={3} />}
                  </span>
                  <span style={{ font: `400 12px ${ssFont}` }}>{lbl}</span>
                </button>
              );
            })}
          </div>
          <div style={{ borderTop: "1px solid var(--divider, #f4f4f5)", padding: "6px 10px" }}>
            <button onClick={onClose} style={{ width: "100%", padding: "5px 0", border: 0, borderRadius: 3, cursor: "pointer", background: "var(--emerald-600, #059669)", color: "#fff", font: `600 12px ${ssFont}` }}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewPill({ view, active, onClick, onCopyLink, onDelete }) {
  const [menu, setMenu] = useSS(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 2, padding: "3px 4px 3px 9px", borderRadius: 3,
      background: active ? "var(--zinc-100, #f4f4f5)" : "transparent", font: `${active ? 600 : 500} 12px ${ssFont}` }}>
      <button onClick={onClick} style={{ border: 0, background: "transparent", padding: "1px 0", cursor: "pointer", font: "inherit", color: active ? "var(--fg1, #18181b)" : "var(--fg2, #3f3f46)", whiteSpace: "nowrap" }}>{view.name}</button>
      {view.shared && <span title="Shared with organization" style={{ color: "var(--fg3, #71717a)", display: "flex", marginLeft: 3 }}><SSIcon name="users" size={11} width={2.2} /></span>}
      {(onCopyLink || onDelete) && (
        <button onClick={() => setMenu(m => !m)} title="View options" style={{ border: 0, background: "transparent", padding: "2px 1px", cursor: "pointer", color: "var(--fg-muted, #a1a1aa)", display: "flex" }}>
          <SSIcon name="dots" size={13} width={2.5} />
        </button>
      )}
      {menu && (
        <div onMouseLeave={() => setMenu(false)} style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: 150, background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)",
          borderRadius: 3, boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1))", zIndex: 50, padding: "4px 0" }}>
          {onCopyLink && <button onClick={() => { onCopyLink(); setMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "7px 10px", border: 0, background: "transparent", cursor: "pointer", font: `400 12px ${ssFont}`, color: "var(--fg1, #18181b)", textAlign: "left" }}><SSIcon name="link" size={12} />Copy link</button>}
          {onDelete && <button onClick={() => { onDelete(); setMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "7px 10px", border: 0, background: "transparent", cursor: "pointer", font: `400 12px ${ssFont}`, color: "var(--red-600, #dc2626)", textAlign: "left" }}><SSIcon name="close" size={12} />Delete view</button>}
        </div>
      )}
    </span>
  );
}

function SaveDialog({ url, onCancel, onSave }) {
  const [name, setName] = useSS("");
  const [shared, setShared] = useSS(false);
  const [copied, setCopied] = useSS(false);
  const copy = () => { try { navigator.clipboard.writeText(url); } catch (e) { /* noop */ } setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(24,24,27,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ width: 420, maxWidth: "calc(100vw - 32px)", background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, boxShadow: "0 20px 40px -12px rgb(0 0 0 / 0.3)", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ font: `600 15px ${ssFont}`, color: "var(--fg1, #18181b)" }}>Save view</span>
          <button onClick={onCancel} style={{ border: 0, background: "transparent", padding: 2, cursor: "pointer", color: "var(--fg3, #71717a)", display: "flex" }}><SSIcon name="close" size={15} /></button>
        </div>
        <label style={{ display: "block", font: `500 12px ${ssFont}`, color: "var(--fg2, #3f3f46)", marginBottom: 6 }}>View name</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Open imports"
          onKeyDown={e => { if (e.key === "Enter" && name.trim()) onSave({ name: name.trim(), shared }); }}
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid var(--border-strong, #d4d4d8)", borderRadius: 3, outline: "none", font: `400 13px ${ssFont}`, color: "var(--fg1, #18181b)" }} />
        <button onClick={() => setShared(s => !s)} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, border: 0, background: "transparent", padding: 0, cursor: "pointer" }}>
          <span style={{ width: 14, height: 14, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${shared ? "var(--emerald-600, #059669)" : "var(--border-strong, #d4d4d8)"}`, background: shared ? "var(--emerald-600, #059669)" : "var(--surface, #fff)" }}>
            {shared && <SSIcon name="check" size={10} color="#fff" width={3} />}
          </span>
          <span style={{ font: `400 13px ${ssFont}`, color: "var(--fg1, #18181b)" }}>Share with organization</span>
        </button>
        <div style={{ marginTop: 14, padding: "8px 10px", background: "var(--zinc-50, #fafafa)", border: "1px solid var(--divider, #f4f4f5)", borderRadius: 3, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, minWidth: 0, font: `400 11px ui-monospace, monospace`, color: "var(--fg3, #71717a)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
          <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid var(--border, #e4e4e7)", background: "var(--surface, #fff)", borderRadius: 3, padding: "4px 8px", cursor: "pointer", font: `500 11px ${ssFont}`, color: "var(--fg1, #18181b)", whiteSpace: "nowrap" }}>
            <SSIcon name={copied ? "check" : "link"} size={11} />{copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button onClick={onCancel} style={{ padding: "7px 14px", border: "1px solid var(--border-strong, #d4d4d8)", background: "var(--surface, #fff)", borderRadius: 3, cursor: "pointer", font: `500 13px ${ssFont}`, color: "var(--fg1, #18181b)" }}>Cancel</button>
          <button disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), shared })}
            style={{ padding: "7px 16px", border: 0, borderRadius: 3, cursor: name.trim() ? "pointer" : "not-allowed", font: `600 13px ${ssFont}`,
              background: name.trim() ? "var(--emerald-600, #059669)" : "var(--zinc-200, #e4e4e7)", color: name.trim() ? "#fff" : "var(--fg-muted, #a1a1aa)" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---- main ------------------------------------------------------------ */
function SavedSearchBase({
  fields = [], filters, defaultFilters = [], onFiltersChange,
  query, defaultQuery = "", onQueryChange, onSubmit,
  views = [], activeView, onSelectView, onSaveView, onDeleteView,
  placeholder = "Search orders, refs, customer",
  baseUrl, syncUrl = true, onCopyLink, action, style,
}) {
  const [iFilters, setIFilters] = useSS(defaultFilters);
  const [iQuery, setIQuery] = useSS(defaultQuery);
  const [open, setOpen] = useSS(false);
  const [draft, setDraft] = useSS(null);
  const [dialog, setDialog] = useSS(false);
  const [toast, setToast] = useSS("");
  const rootRef = useSSRef(null);

  const fs = filters !== undefined ? filters : iFilters;
  const q = query !== undefined ? query : iQuery;
  const setFs = next => { if (filters === undefined) setIFilters(next); if (onFiltersChange) onFiltersChange(next); };
  const setQ = v => { if (query === undefined) setIQuery(v); if (onQueryChange) onQueryChange(v); };

  const search = SavedSearchParams.encode({ query: q, filters: fs, view: activeView });
  const url = `${baseUrl || (typeof location !== "undefined" ? location.origin + location.pathname : "")}${search ? "?" + search : ""}`;

  useSSEffect(() => {
    if (!syncUrl || typeof history === "undefined") return;
    try { history.replaceState(null, "", search ? "?" + search : location.pathname); } catch (e) { /* sandboxed */ }
  }, [search, syncUrl]);

  useSSEffect(() => {
    const away = e => { if (rootRef.current && !rootRef.current.contains(e.target)) { setOpen(false); setDraft(null); } };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const commitDraft = d => {
    const next = fs.some(f => f.field === d.field) ? fs.map(f => (f.field === d.field ? d : f)) : [...fs, d];
    setFs(next.filter(f => (f.values || []).length));
  };
  const copyLink = u => {
    try { navigator.clipboard.writeText(u || url); } catch (e) { /* noop */ }
    if (onCopyLink) onCopyLink(u || url);
    setToast("Link copied"); setTimeout(() => setToast(""), 1600);
  };
  const dirty = fs.length > 0 || q.trim().length > 0;
  const remaining = fields.filter(f => !fs.some(x => x.field === f.key) || (draft && draft.field === f.key));

  return (
    <div ref={rootRef} style={{ position: "relative", font: `400 13px ${ssFont}`, color: "var(--fg1, #18181b)", ...style }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div onClick={() => { if (!open) setOpen(true); }}
          style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "7px 9px", background: "var(--surface, #fff)",
            border: `1px solid ${open ? "var(--emerald-500, #10b981)" : "var(--border-strong, #d4d4d8)"}`, borderRadius: 3,
            boxShadow: open ? "0 0 0 3px rgba(16,185,129,0.12)" : "none", transition: "border-color 150ms, box-shadow 150ms", cursor: "text" }}>
          <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex", padding: "0 1px" }}><SSIcon name="search" size={14} /></span>
          {fs.map(f => (
            <FilterChip key={f.field} fields={fields} filter={f}
              onEdit={() => { setOpen(true); setDraft({ ...f }); }}
              onRemove={() => { setFs(fs.filter(x => x.field !== f.field)); if (draft && draft.field === f.field) setDraft(null); }} />
          ))}
          <input value={q} placeholder={placeholder} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && onSubmit) onSubmit({ query: q, filters: fs, url }); if (e.key === "Escape") { setOpen(false); setDraft(null); } }}
            style={{ flex: 1, minWidth: 140, border: 0, outline: "none", padding: "1px 0", font: `400 13px ${ssFont}`, color: "var(--fg1, #18181b)", background: "transparent" }} />
        </div>
        {action}
      </div>

      {open && (
        <FieldPopover fields={remaining} draft={draft}
          onPick={key => setDraft({ field: key, op: "is", values: [] })}
          onBack={() => setDraft(null)}
          onSetOp={op => { const d = { ...draft, op }; setDraft(d); commitDraft(d); }}
          onToggleValue={v => {
            const vals = (draft.values || []).includes(v) ? draft.values.filter(x => x !== v) : [...(draft.values || []), v];
            const d = { ...draft, values: vals }; setDraft(d); commitDraft(d);
          }}
          onClose={() => { setDraft(null); setOpen(false); }} />
      )}

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
        <ViewPill view={{ name: "All" }} active={!activeView} onClick={() => { if (onSelectView) onSelectView(null); setFs([]); setQ(""); }} />
        {views.map(v => (
          <ViewPill key={v.name} view={v} active={v.name === activeView}
            onClick={() => { if (onSelectView) onSelectView(v); if (v.filters) setFs(v.filters); setQ(v.query || ""); }}
            onCopyLink={() => copyLink(`${baseUrl || (typeof location !== "undefined" ? location.origin + location.pathname : "")}?${SavedSearchParams.encode({ query: v.query, filters: v.filters || [], view: v.name })}`)}
            onDelete={onDeleteView ? () => onDeleteView(v) : undefined} />
        ))}
        {dirty && onSaveView && (
          <button onClick={() => setDialog(true)} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 4, padding: "4px 9px", border: "1px solid var(--border, #e4e4e7)",
            background: "var(--surface, #fff)", borderRadius: 3, cursor: "pointer", font: `600 12px ${ssFont}`, color: "var(--fg1, #18181b)" }}>
            <SSIcon name="plus" size={12} />Save view
          </button>
        )}
        {dirty && (
          <button onClick={() => copyLink()} title="Copy a bookmarkable link to this search"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", border: 0, background: "transparent", cursor: "pointer", font: `500 12px ${ssFont}`, color: "var(--fg3, #71717a)" }}>
            <SSIcon name="link" size={12} />Share
          </button>
        )}
        {toast && <span style={{ font: `500 11px ${ssFont}`, color: "var(--emerald-700, #047857)", marginLeft: 2 }}>{toast}</span>}
      </div>

      {dialog && (
        <SaveDialog url={url}
          onCancel={() => setDialog(false)}
          onSave={({ name, shared }) => { if (onSaveView) onSaveView({ name, shared, query: q, filters: fs, url }); setDialog(false); }} />
      )}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function SavedSearch(props) {
  if (props.loading) return <Skeleton label="Loading search" style={props.style}><Skeleton height={36} /><div style={{ display: "flex", gap: 6, marginTop: 8 }}><Skeleton width={40} height={22} /><Skeleton width={96} height={22} /><Skeleton width={80} height={22} /></div></Skeleton>;
  return <SavedSearchBase {...props} />;
}
