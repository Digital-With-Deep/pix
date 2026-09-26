import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState: useSearchState, useRef: useSearchRef } = React;

const searchFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const SEARCH_ICON = "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z";
const STAR_ICON = "M11.05 3.69c.3-.92 1.6-.92 1.9 0l1.5 4.61h4.85c.97 0 1.37 1.24.59 1.81l-3.93 2.85 1.52 4.61c.3.92-.76 1.68-1.54 1.11L12 15.83l-3.94 2.85c-.78.57-1.84-.19-1.54-1.11l1.52-4.61-3.93-2.85c-.78-.57-.38-1.81.59-1.81h4.85l1.5-4.61z";
const CLOSE_ICON = "M6 18L18 6M6 6l12 12";
const CHEVRON_ICON = "M19 9l-7 7-7-7";

function SIcon({ path, size = 14, color = "currentColor" }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
    React.createElement("path", { d: path }));
}

function SearchFieldBase({
  value, defaultValue = "", onChange, onSubmit, placeholder = "Search…",
  savedSearches = [], activeSaved, onSelectSaved, onSaveSearch, onDeleteSaved,
  shortcut = "⌘K", width = 340, style,
}) {
  const [internal, setInternal] = useSearchState(defaultValue);
  const [open, setOpen] = useSearchState(false);
  const q = value !== undefined ? value : internal;
  const set = v => { if (value === undefined) setInternal(v); if (onChange) onChange(v); };
  const inputRef = useSearchRef(null);
  const canSave = q.trim().length > 0;

  return (
    <div style={{ position: "relative", width, font: `400 13px ${searchFont}`, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", background: "var(--surface, #fff)",
        border: `1px solid ${open ? "var(--emerald-500, #10b981)" : "var(--border, #e4e4e7)"}`, borderRadius: 3,
        boxShadow: open ? "0 0 0 3px rgba(16,185,129,0.12)" : "none", transition: "border-color 150ms, box-shadow 150ms" }}>
        <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex" }}><SIcon path={SEARCH_ICON} /></span>
        <input ref={inputRef} value={q} placeholder={placeholder}
          onChange={e => set(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={e => { if (e.key === "Enter" && onSubmit) onSubmit(q); if (e.key === "Escape") setOpen(false); }}
          style={{ flex: 1, minWidth: 0, border: 0, outline: "none", font: `400 13px ${searchFont}`, color: "var(--fg1, #18181b)", background: "transparent" }} />
        {canSave && (
          <button onMouseDown={e => e.preventDefault()} onClick={() => set("")} title="Clear"
            style={{ border: 0, background: "transparent", padding: 2, cursor: "pointer", color: "var(--fg-muted, #a1a1aa)", display: "flex" }}>
            <SIcon path={CLOSE_ICON} size={13} />
          </button>
        )}
        {activeSaved && !canSave && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: `500 11px ${searchFont}`, padding: "2px 6px", borderRadius: 3,
            background: "var(--emerald-50, #ecfdf5)", color: "var(--emerald-700, #047857)", whiteSpace: "nowrap" }}>
            <SIcon path={STAR_ICON} size={11} />{activeSaved}
          </span>
        )}
        {shortcut && !canSave && !activeSaved && (
          <kbd style={{ font: `500 10px ui-monospace, monospace`, color: "var(--fg3, #71717a)", background: "var(--zinc-50, #fafafa)",
            border: "1px solid var(--border, #e4e4e7)", borderRadius: 2, padding: "2px 5px" }}>{shortcut}</kbd>
        )}
        <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex", transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
          <SIcon path={CHEVRON_ICON} size={13} />
        </span>
      </div>

      {open && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 4px)", background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)",
          borderRadius: 3, boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.08))", zIndex: 40, padding: "4px 0", maxHeight: 300, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 4px" }}>
            <span style={{ font: `600 10px ${searchFont}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>Saved searches</span>
            <span style={{ font: `500 10px ${searchFont}`, color: "var(--fg-muted, #a1a1aa)" }}>{savedSearches.length}</span>
          </div>
          {savedSearches.length === 0 && (
            <div style={{ padding: "8px 10px", font: `400 12px ${searchFont}`, color: "var(--fg3, #71717a)" }}>No saved searches yet.</div>
          )}
          {savedSearches.map(s => {
            const item = typeof s === "string" ? { name: s } : s;
            const on = item.name === activeSaved;
            return (
              <div key={item.name} onMouseDown={e => e.preventDefault()}
                onClick={() => { if (onSelectSaved) onSelectSaved(item); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", cursor: "pointer", background: on ? "var(--zinc-50, #fafafa)" : "transparent" }}>
                <span style={{ color: on ? "var(--emerald-600, #059669)" : "var(--fg-muted, #a1a1aa)", display: "flex" }}><SIcon path={STAR_ICON} size={13} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", font: `${on ? 600 : 500} 12px ${searchFont}`, color: "var(--fg1, #18181b)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                  {item.query && <span style={{ display: "block", font: `400 10px ${searchFont}`, color: "var(--fg3, #71717a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.query}</span>}
                </span>
                {item.count !== undefined && <span style={{ font: `500 10px ${searchFont}`, color: "var(--fg-muted, #a1a1aa)" }}>{item.count}</span>}
                {onDeleteSaved && (
                  <button onMouseDown={e => e.preventDefault()} onClick={e => { e.stopPropagation(); onDeleteSaved(item); }} title="Remove"
                    style={{ border: 0, background: "transparent", padding: 2, cursor: "pointer", color: "var(--fg-muted, #a1a1aa)", display: "flex" }}>
                    <SIcon path={CLOSE_ICON} size={12} />
                  </button>
                )}
              </div>
            );
          })}
          {onSaveSearch && (
            <div style={{ borderTop: "1px solid var(--divider, #f4f4f5)", marginTop: 4, paddingTop: 4 }}>
              <button onMouseDown={e => e.preventDefault()} disabled={!canSave}
                onClick={() => { onSaveSearch(q); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: 0, background: "transparent",
                  font: `500 12px ${searchFont}`, color: canSave ? "var(--emerald-700, #047857)" : "var(--fg-muted, #a1a1aa)",
                  cursor: canSave ? "pointer" : "not-allowed", textAlign: "left" }}>
                <SIcon path={STAR_ICON} size={13} />
                {canSave ? `Save “${q}” as a search` : "Type a query to save it"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function SearchField(props) {
  if (props.loading) return <Skeleton height={34} width={props.width || 340} style={props.style} />;
  return <SearchFieldBase {...props} />;
}
