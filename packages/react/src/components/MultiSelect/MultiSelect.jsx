import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const msSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const msMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
let msSeq = 0;

const MsCheckBadge = ({ on, size = 18 }) => (
  <span aria-hidden="true" style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1.5px solid ${on ? "var(--emerald-600, #059669)" : "var(--border-strong, #d4d4d8)"}`, background: on ? "var(--emerald-600, #059669)" : "var(--surface, #fff)", color: "#fff", transition: "background 120ms, border-color 120ms" }}>
    <svg viewBox="0 0 24 24" width={size - 7} height={size - 7} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ visibility: on ? "visible" : "hidden" }}><path d="M5 13l4 4L19 7" /></svg>
  </span>
);
const MsBox = ({ on, mixed }) => (
  <span aria-hidden="true" style={{ width: 15, height: 15, borderRadius: 3, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1.5px solid ${on || mixed ? "var(--fg1, #18181b)" : "var(--border-strong, #d4d4d8)"}`, background: on || mixed ? "var(--fg1, #18181b)" : "var(--surface, #fff)", color: "var(--fg-inverse, #fff)" }}>
    {mixed && !on ? <span style={{ width: 7, height: 2, background: "currentColor", borderRadius: 1 }} /> :
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ visibility: on ? "visible" : "hidden" }}><path d="M5 13l4 4L19 7" /></svg>}
  </span>
);
const MsGlyph = ({ option }) => {
  if (!option) return null;
  if (option.icon) return <span aria-hidden="true" style={{ width: 18, height: 18, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--fg2, #52525b)" }}>{option.icon}</span>;
  if (option.tile) { const t = typeof option.tile === "string" ? { text: option.tile } : option.tile;
    return <span aria-hidden="true" style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", font: `700 ${t.text.length > 2 ? 7 : 9}px ${msSans}`, background: t.color || "var(--zinc-900, #18181b)", color: "#fff" }}>{t.text}</span>; }
  return null;
};

function matches(o, needle) { return !needle || [o.label, o.description, o.meta, o.group, ...(o.keywords || [])].some((t) => typeof t === "string" && t.toLowerCase().includes(needle)); }

function Tiles({ options, value, toggle, disabled, columns, max, id, minTile }) {
  const full = max != null && value.length >= max;
  return (
    <div role="group" aria-labelledby={id + "-l"} style={{ display: "grid", gridTemplateColumns: columns ? `repeat(${columns}, minmax(0, 1fr))` : `repeat(auto-fill, minmax(${minTile}px, 1fr))`, gap: 12 }}>
      {options.map((o) => {
        const on = value.includes(o.value); const off = disabled || o.disabled || (full && !on);
        return (
          <button key={o.value} type="button" role="checkbox" aria-checked={on} aria-disabled={off || undefined} disabled={disabled || o.disabled} onClick={() => !off && toggle(o)}
            style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, textAlign: "left", minHeight: 120, padding: "16px 16px 14px", borderRadius: 6, cursor: off ? "default" : "pointer", opacity: o.disabled ? 0.5 : 1,
              border: `1px solid ${on ? "var(--emerald-600, #059669)" : "var(--border, #e4e4e7)"}`, boxShadow: on ? "0 0 0 3px rgba(16,185,129,.14)" : "none", background: on ? "var(--emerald-50, #ecfdf5)" : "var(--surface, #fff)", color: "var(--fg1, #18181b)", font: `400 13px ${msSans}`, transition: "border-color 120ms, box-shadow 120ms, background 120ms" }}>
            <span style={{ position: "absolute", top: 12, right: 12 }}><MsCheckBadge on={on} /></span>
            {(o.icon || o.tile) && <span style={{ display: "inline-flex", width: 34, height: 34, borderRadius: 6, alignItems: "center", justifyContent: "center", background: on ? "var(--surface, #fff)" : "var(--zinc-100, #f4f4f5)", color: "var(--fg1, #18181b)", border: "1px solid var(--divider, #f4f4f5)" }}>{o.icon || <MsGlyph option={o} />}</span>}
            <span style={{ display: "block", font: `600 14px/1.3 ${msSans}`, paddingRight: 22 }}>{o.label}</span>
            {o.description && <span style={{ display: "block", font: `400 12px/1.5 ${msSans}`, color: "var(--fg3, #71717a)" }}>{o.description}</span>}
            {o.meta && <span style={{ display: "block", marginTop: "auto", font: `400 11px ${msMono}`, color: "var(--fg-muted, #a1a1aa)" }}>{o.meta}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Dropdown({ options, value, toggle, setAll, disabled, id, placeholder, searchPlaceholder, searchable, emptyMessage, maxHeight, footer, maxChips, error, max, selectAllLabel, clearLabel, onChange }) {
  const [open, setOpen] = React.useState(false); const [q, setQ] = React.useState(""); const [active, setActive] = React.useState(0); const [focus, setFocus] = React.useState(false);
  const host = React.useRef(null), input = React.useRef(null), list = React.useRef(null), trigger = React.useRef(null);
  const needle = q.trim().toLowerCase(); const shown = options.filter((o) => matches(o, needle));
  const full = max != null && value.length >= max;
  const byValue = new Map(options.map((o) => [o.value, o])); const chosen = value.map((v) => byValue.get(v)).filter(Boolean);
  const close = (refocus) => { setOpen(false); setQ(""); if (refocus && trigger.current) trigger.current.focus(); };
  React.useEffect(() => { if (!open) return; const away = (e) => { if (host.current && !host.current.contains(e.target)) close(false); }; document.addEventListener("mousedown", away);
    if (searchable && input.current) input.current.focus(); else if (list.current) list.current.focus(); return () => document.removeEventListener("mousedown", away); }, [open]);
  React.useEffect(() => { if (open) setActive(0); }, [needle]);
  React.useEffect(() => { if (!open || !list.current) return; const el = list.current.querySelector(`[data-i="${active}"]`); if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" }); }, [active, open]);
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(shown.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter" || (e.key === " " && !searchable)) { e.preventDefault(); const o = shown[active]; if (o && !o.disabled && !(full && !value.includes(o.value))) toggle(o); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === "Backspace" && !q && chosen.length) { toggle(chosen[chosen.length - 1]); }
    else if (e.key === "Tab") close(false);
  };
  const borderColor = error ? "var(--red-500, #ef4444)" : open || focus ? "var(--emerald-500, #10b981)" : "var(--border, #e4e4e7)";
  const visibleChips = chosen.slice(0, maxChips); const extra = chosen.length - visibleChips.length;
  const allShownOn = shown.length > 0 && shown.every((o) => o.disabled || value.includes(o.value));
  let lastGroup;
  return (
    <div ref={host} style={{ position: "relative" }}>
      <div ref={trigger} id={id + "-t"} role="combobox" tabIndex={disabled ? -1 : 0} aria-haspopup="listbox" aria-expanded={open} aria-controls={id + "-list"} aria-labelledby={id + "-l"} aria-invalid={error ? true : undefined} aria-disabled={disabled || undefined}
        onClick={() => !disabled && (open ? close(false) : setOpen(true))} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onKeyDown={(e) => { if (disabled) return; if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(true); } }}
        style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, width: "100%", boxSizing: "border-box", minHeight: 38, padding: "5px 12px 5px 8px", borderRadius: 3, border: `1px solid ${borderColor}`, boxShadow: (open || focus) && !error ? "0 0 0 3px rgba(16,185,129,.15)" : "none",
          background: disabled ? "var(--zinc-50, #fafafa)" : "var(--surface, #fff)", cursor: disabled ? "default" : "pointer", font: `400 14px ${msSans}`, color: "var(--fg-muted, #a1a1aa)", outline: "none", transition: "border-color 150ms, box-shadow 150ms" }}>
        {chosen.length === 0 && <span style={{ padding: "2px 4px" }}>{placeholder}</span>}
        {visibleChips.map((o) => (
          <span key={o.value} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 6px 3px 8px", borderRadius: 3, background: "var(--zinc-100, #f4f4f5)", border: "1px solid var(--divider, #f4f4f5)", font: `500 12px ${msSans}`, color: "var(--fg1, #18181b)", maxWidth: 220 }}>
            <MsGlyph option={o} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.label}</span>
            {!disabled && <button type="button" aria-label={`Remove ${o.label}`} onClick={(e) => { e.stopPropagation(); toggle(o); }} onMouseDown={(e) => e.preventDefault()}
              style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "var(--fg3, #71717a)", display: "flex", borderRadius: 2 }}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>}
          </span>))}
        {extra > 0 && <span style={{ padding: "3px 8px", borderRadius: 3, background: "var(--zinc-100, #f4f4f5)", font: `500 12px ${msMono}`, color: "var(--fg2, #52525b)" }}>+{extra}</span>}
        <span style={{ flex: 1 }} />
        {chosen.length > 0 && <span style={{ font: `400 11px ${msMono}`, color: "var(--fg3, #71717a)" }}>{chosen.length}{max != null ? `/${max}` : ""}</span>}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: "var(--fg-muted, #a1a1aa)", transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}><path d="M19 9l-7 7-7-7" /></svg>
      </div>
      {open && (
        <div onKeyDown={onKey} style={{ position: "absolute", zIndex: 30, left: 0, top: "100%", marginTop: 6, width: "100%", minWidth: 240, boxSizing: "border-box", background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, boxShadow: "var(--shadow-lg, 0 10px 30px rgba(0,0,0,.12))", overflow: "hidden" }}>
          {searchable && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ color: "var(--fg-muted, #a1a1aa)", flexShrink: 0 }}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} aria-controls={id + "-list"} aria-activedescendant={shown[active] ? `${id}-o${active}` : undefined} autoComplete="off" spellCheck={false}
                style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", font: `400 13px ${msSans}`, color: "var(--fg1, #18181b)" }} />
              {q && <span style={{ font: `400 11px ${msMono}`, color: "var(--fg-muted, #a1a1aa)" }}>{shown.length}</span>}
            </div>)}
          <div ref={list} id={id + "-list"} role="listbox" aria-multiselectable="true" tabIndex={-1} aria-labelledby={id + "-l"} style={{ maxHeight, overflowY: "auto", padding: 4, outline: "none" }}>
            {shown.length === 0 && <div style={{ padding: "14px 12px", font: `400 12px ${msSans}`, color: "var(--fg3, #71717a)" }}>{emptyMessage}{q ? ` “${q}”` : ""}.</div>}
            {shown.map((o, i) => {
              const head = o.group && o.group !== lastGroup ? o.group : null; lastGroup = o.group;
              const on = value.includes(o.value), hot = i === active, off = o.disabled || (full && !on);
              return (
                <React.Fragment key={o.value}>
                  {head && <div style={{ padding: "8px 10px 4px", font: `600 10px ${msSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>{head}</div>}
                  <div id={`${id}-o${i}`} data-i={i} role="option" aria-selected={on} aria-disabled={off || undefined} onMouseEnter={() => !off && setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => !off && toggle(o)}
                    style={{ display: "flex", alignItems: o.description ? "flex-start" : "center", gap: 10, padding: "7px 10px", borderRadius: 3, cursor: off ? "default" : "pointer", opacity: off ? 0.45 : 1, background: hot && !off ? "var(--zinc-100, #f4f4f5)" : "transparent" }}>
                    <span style={{ paddingTop: o.description ? 2 : 0, display: "flex" }}><MsBox on={on} /></span>
                    <MsGlyph option={o} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", font: `${on ? 600 : 500} 13px/1.35 ${msSans}`, color: "var(--fg1, #18181b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.label}</span>
                      {o.description && <span style={{ display: "block", marginTop: 1, font: `400 11px/1.4 ${msSans}`, color: "var(--fg3, #71717a)" }}>{o.description}</span>}
                    </span>
                    {o.meta && <span style={{ font: `400 11px ${msMono}`, color: "var(--fg3, #71717a)", flexShrink: 0 }}>{o.meta}</span>}
                  </div>
                </React.Fragment>);
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--divider, #f4f4f5)", padding: "6px 8px" }}>
            {max == null && <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setAll(shown, !allShownOn)} disabled={shown.length === 0}
              style={{ border: 0, background: "transparent", padding: "3px 4px", cursor: "pointer", font: `500 12px ${msSans}`, color: "var(--fg2, #52525b)" }}>{allShownOn ? clearLabel : selectAllLabel}{needle ? ` (${shown.length})` : ""}</button>}
            <span style={{ flex: 1 }} />
            <span style={{ font: `400 11px ${msMono}`, color: "var(--fg-muted, #a1a1aa)" }}>{chosen.length} selected</span>
            {footer}
          </div>
        </div>)}
    </div>
  );
}

export function MultiSelect({ options = [], value = [], onChange, variant = "dropdown", label, hint, error, disabled = false, columns, minTile = 180, max, placeholder = "Select…", searchPlaceholder = "Search…", searchable = true,
  emptyMessage = "Nothing matches", maxHeight = 280, maxChips = 4, footer, selectAllLabel = "Select all", clearLabel = "Clear", loading = false, style }) {
  const id = React.useMemo(() => "ms" + ++msSeq, []);
  const toggle = (o) => { if (!onChange) return; const on = value.includes(o.value); onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value], o); };
  const setAll = (subset, on) => { if (!onChange) return; const ids = subset.filter((o) => !o.disabled).map((o) => o.value); onChange(on ? Array.from(new Set([...value, ...ids])) : value.filter((v) => !ids.includes(v))); };
  const labelEl = label && <span id={id + "-l"} style={{ display: "block", marginBottom: variant === "tiles" ? 10 : 6, font: `600 11px ${msSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>{label}</span>;
  if (loading) return (
    <div style={{ fontFamily: msSans, ...style }}>{labelEl}
      {variant === "tiles" ? <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${minTile}px, 1fr))`, gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={120} />)}</div> : <Skeleton height={38} />}
    </div>);
  return (
    <div style={{ fontFamily: msSans, ...style }}>
      {labelEl}
      {variant === "tiles" ? <Tiles {...{ options, value, toggle, disabled, columns, max, id, minTile }} /> :
        <Dropdown {...{ options, value, toggle, setAll, disabled, id, placeholder, searchPlaceholder, searchable, emptyMessage, maxHeight, footer, maxChips, error, max, selectAllLabel, clearLabel }} />}
      {(error || hint) && <div style={{ marginTop: variant === "tiles" ? 10 : 5, font: `400 11px/1.4 ${msSans}`, color: error ? "var(--claim, #b91c1c)" : "var(--fg3, #71717a)" }}>{error || hint}</div>}
    </div>
  );
}
