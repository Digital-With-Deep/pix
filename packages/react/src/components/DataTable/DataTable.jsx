import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState: useTableState, useMemo: useTableMemo } = React;

const tblFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const T_SORT = "M8 9l4-4 4 4M8 15l4 4 4-4";
const T_UP = "M8 15l4-4 4 4";
const T_DOWN = "M8 9l4 4 4-4";
const T_FILTER = "M4 6h16M7 12h10M10 18h4";
const T_SEARCH = "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z";
const T_CLOSE = "M6 18L18 6M6 6l12 12";

function TIcon({ path, size = 13 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
    React.createElement("path", { d: path }));
}

const cell = { padding: "9px 14px", font: `400 13px ${tblFont}`, color: "var(--fg2, #52525b)", borderTop: "1px solid var(--divider, #f4f4f5)" };

function DataTableBase({
  columns = [], rows = [], searchable = true, searchPlaceholder = "Filter rows…",
  initialSort, filters = [], emptyMessage = "No rows match these filters.",
  caption, rowCount = true, onRowClick, style,
}) {
  const [sort, setSort] = useTableState(initialSort || null);
  const [q, setQ] = useTableState("");
  const [picked, setPicked] = useTableState({});

  const toggleSort = c => {
    if (!c.sortable) return;
    setSort(s => (!s || s.key !== c.key ? { key: c.key, dir: "asc" } : s.dir === "asc" ? { key: c.key, dir: "desc" } : null));
  };

  const view = useTableMemo(() => {
    let out = rows;
    const needle = q.trim().toLowerCase();
    if (needle) {
      out = out.filter(r => columns.some(c => String(r[c.key] ?? "").toLowerCase().includes(needle)));
    }
    for (const f of filters) {
      const all = f.allLabel ?? "All";
      const v = picked[f.key];
      if (v && v !== all) out = out.filter(r => String(r[f.key]) === v);
    }
    if (sort) {
      const col = columns.find(c => c.key === sort.key);
      const num = col && col.numeric;
      out = [...out].sort((a, b) => {
        const x = a[sort.key], y = b[sort.key];
        const cmp = num ? Number(x) - Number(y) : String(x ?? "").localeCompare(String(y ?? ""));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, columns, q, picked, sort, filters]);

  const anyFilter = q.trim() || filters.some(f => {
    const v = picked[f.key];
    return v && v !== (f.allLabel ?? "All");
  });

  return (
    <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", ...style }}>
      {(searchable || filters.length > 0 || caption) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
          {caption && <span style={{ font: `600 12px ${tblFont}`, color: "var(--fg1, #18181b)", marginRight: 4 }}>{caption}</span>}
          {searchable && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "1 1 180px", minWidth: 0, padding: "5px 8px", background: "var(--zinc-50, #fafafa)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3 }}>
              <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex" }}><TIcon path={T_SEARCH} /></span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={searchPlaceholder}
                style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", font: `400 12px ${tblFont}`, color: "var(--fg1, #18181b)" }} />
              {q && <button onClick={() => setQ("")} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "var(--fg-muted, #a1a1aa)", display: "flex" }}><TIcon path={T_CLOSE} size={12} /></button>}
            </div>
          )}
          {filters.map(f => (
            <label key={f.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 8px", background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3 }}>
              <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex" }}><TIcon path={T_FILTER} size={12} /></span>
              <select value={picked[f.key] ?? f.allLabel ?? "All"} onChange={e => setPicked(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ border: 0, outline: "none", background: "transparent", font: `500 12px ${tblFont}`, color: "var(--fg2, #52525b)", cursor: "pointer" }}>
                {[f.allLabel ?? "All", ...f.options].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
          {rowCount && (
            <span style={{ font: `400 11px ${tblFont}`, color: "var(--fg3, #71717a)", marginLeft: "auto", whiteSpace: "nowrap" }}>
              {view.length === rows.length ? `${rows.length} rows` : `${view.length} of ${rows.length}`}
            </span>
          )}
          {anyFilter && (
            <button onClick={() => { setQ(""); setPicked({}); }}
              style={{ border: 0, background: "transparent", font: `500 11px ${tblFont}`, color: "var(--emerald-700, #047857)", cursor: "pointer", padding: 0 }}>Clear</button>
          )}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--zinc-50, #fafafa)" }}>
              {columns.map(c => {
                const on = sort && sort.key === c.key;
                return (
                  <th key={c.key} onClick={() => toggleSort(c)}
                    style={{ textAlign: c.align || "left", padding: "8px 14px", font: `600 10px ${tblFont}`, textTransform: "uppercase", letterSpacing: "0.06em",
                      color: on ? "var(--fg1, #18181b)" : "var(--fg3, #71717a)", cursor: c.sortable ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: c.align === "right" ? "flex-end" : "flex-start" }}>
                      {c.label}
                      {c.sortable && <span style={{ color: on ? "var(--fg1, #18181b)" : "var(--zinc-300, #d4d4d8)", display: "flex" }}>
                        <TIcon path={on ? (sort.dir === "asc" ? T_UP : T_DOWN) : T_SORT} size={12} />
                      </span>}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {view.map((r, i) => (
              <tr key={r.id ?? i} onClick={() => onRowClick && onRowClick(r)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}>
                {columns.map(c => (
                  <td key={c.key} style={{ ...cell, textAlign: c.align || "left",
                    fontVariantNumeric: c.numeric ? "tabular-nums" : "normal",
                    fontWeight: c.strong ? 600 : 400,
                    color: c.strong ? "var(--fg1, #18181b)" : cell.color }}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
            {view.length === 0 && (
              <tr><td colSpan={columns.length} style={{ ...cell, textAlign: "center", color: "var(--fg3, #71717a)", padding: "28px 14px" }}>{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function DataTable(props) {
  if (props.loading) return <Skeleton.Table columns={(props.columns || []).length || 5} rows={props.skeletonRows || 5} caption={!!(props.caption || props.searchable !== false)} style={props.style} />;
  return <DataTableBase {...props} />;
}
