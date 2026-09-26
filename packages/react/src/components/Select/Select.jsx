import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const selSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const selMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
let selSeq = 0;

function SelGlyph({ option, size = 20 }) {
  if (!option) return null;
  if (option.icon) return <span aria-hidden="true" style={{ width: size, height: size, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--fg2, #52525b)" }}>{option.icon}</span>;
  if (option.tile) {
    const t = typeof option.tile === "string" ? { text: option.tile } : option.tile;
    return <span aria-hidden="true" style={{ width: size, height: size, flexShrink: 0, borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center",
      font: `700 ${t.text.length > 2 ? 7 : 9}px ${selSans}`, background: t.color || "var(--zinc-900, #18181b)", color: t.color ? "#fff" : "var(--fg-inverse, #fff)" }}>{t.text}</span>;
  }
  return null;
}
const SelCheck = ({ on }) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: "var(--fg1, #18181b)", visibility: on ? "visible" : "hidden" }}><path d="M5 13l4 4L19 7" /></svg>;

function SelectBase({ options = [], value, onChange, placeholder = "Select…", searchPlaceholder = "Search…", searchable = true, label, hint, error,
  disabled = false, emptyMessage = "Nothing matches", menuWidth, maxHeight = 280, footer, style }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [focus, setFocus] = React.useState(false);
  const host = React.useRef(null), input = React.useRef(null), list = React.useRef(null), trigger = React.useRef(null);
  const id = React.useMemo(() => "sel" + ++selSeq, []);
  const selected = options.find((o) => o.value === value);

  const needle = q.trim().toLowerCase();
  const shown = needle ? options.filter((o) => [o.label, o.description, o.meta, o.group, ...(o.keywords || [])].some((t) => typeof t === "string" && t.toLowerCase().includes(needle))) : options;
  const firstEnabled = (from, dir) => { for (let n = 0, i = from; n < shown.length; n++, i = (i + dir + shown.length) % shown.length) if (!shown[i].disabled) return i; return -1; };

  const close = (refocus) => { setOpen(false); setQ(""); if (refocus && trigger.current) trigger.current.focus(); };
  const openMenu = () => { if (disabled) return; const at = shown.findIndex((o) => o.value === value); setActive(at >= 0 ? at : Math.max(0, firstEnabled(0, 1))); setOpen(true); };
  const pick = (o) => { if (!o || o.disabled) return; if (onChange) onChange(o.value, o); close(true); };

  React.useEffect(() => {
    if (!open) return;
    const away = (e) => { if (host.current && !host.current.contains(e.target)) close(false); };
    document.addEventListener("mousedown", away);
    if (searchable && input.current) input.current.focus(); else if (list.current) list.current.focus();
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  React.useEffect(() => { if (open) setActive(Math.max(0, firstEnabled(0, 1))); }, [needle]);
  React.useEffect(() => { if (!open || !list.current) return; const el = list.current.querySelector(`[data-i="${active}"]`); if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" }); }, [active, open]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => firstEnabled((a + 1) % Math.max(1, shown.length), 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => firstEnabled((a - 1 + shown.length) % Math.max(1, shown.length), -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(firstEnabled(0, 1)); }
    else if (e.key === "End") { e.preventDefault(); setActive(firstEnabled(shown.length - 1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); pick(shown[active]); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === "Tab") close(false);
  };

  const borderColor = error ? "var(--red-500, #ef4444)" : open || focus ? "var(--emerald-500, #10b981)" : "var(--border, #e4e4e7)";
  let lastGroup;
  return (
    <div style={{ fontFamily: selSans, ...style }}>
      {label && <label id={id + "-l"} htmlFor={id + "-t"} style={{ display: "block", marginBottom: 6, font: `600 11px ${selSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>{label}</label>}
      <div ref={host} style={{ position: "relative" }}>
      <button ref={trigger} id={id + "-t"} type="button" disabled={disabled} role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={id + "-list"} aria-invalid={error ? true : undefined}
        onClick={() => (open ? close(false) : openMenu())} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onKeyDown={(e) => { if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); openMenu(); } }}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 3, border: `1px solid ${borderColor}`,
          boxShadow: (open || focus) && !error ? "0 0 0 3px rgba(16,185,129,.15)" : "none", background: disabled ? "var(--zinc-50, #fafafa)" : "var(--surface, #fff)", cursor: disabled ? "default" : "pointer",
          textAlign: "left", font: `400 14px ${selSans}`, color: selected && !disabled ? "var(--fg1, #18181b)" : "var(--fg-muted, #a1a1aa)", outline: "none", transition: "border-color 150ms, box-shadow 150ms" }}>
        <SelGlyph option={selected} />
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected ? selected.label : placeholder}</span>
        {selected && selected.meta && <span style={{ font: `400 11px ${selMono}`, color: "var(--fg3, #71717a)", flexShrink: 0 }}>{selected.meta}</span>}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{ flexShrink: 0, color: "var(--fg-muted, #a1a1aa)", transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}><path d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div onKeyDown={onKey} style={{ position: "absolute", zIndex: 30, left: 0, top: "100%", marginTop: 6, width: menuWidth || "100%", minWidth: 220, boxSizing: "border-box", background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, boxShadow: "var(--shadow-lg, 0 10px 30px rgba(0,0,0,.12))", overflow: "hidden" }}>
          {searchable && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ color: "var(--fg-muted, #a1a1aa)", flexShrink: 0 }}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} aria-controls={id + "-list"}
                aria-activedescendant={shown[active] ? `${id}-o${active}` : undefined} autoComplete="off" spellCheck={false}
                style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", font: `400 13px ${selSans}`, color: "var(--fg1, #18181b)" }} />
              {q && <span style={{ font: `400 11px ${selMono}`, color: "var(--fg-muted, #a1a1aa)" }}>{shown.length}</span>}
            </div>
          )}
          <div ref={list} id={id + "-list"} role="listbox" tabIndex={-1} aria-labelledby={label ? id + "-l" : undefined} style={{ maxHeight, overflowY: "auto", padding: 4, outline: "none" }}>
            {shown.length === 0 && <div style={{ padding: "14px 12px", font: `400 12px ${selSans}`, color: "var(--fg3, #71717a)" }}>{emptyMessage}{q ? ` “${q}”` : ""}.</div>}
            {shown.map((o, i) => {
              const head = o.group && o.group !== lastGroup ? o.group : null; lastGroup = o.group;
              const on = o.value === value, hot = i === active;
              return (
                <React.Fragment key={o.value}>
                  {head && <div style={{ padding: "8px 10px 4px", font: `600 10px ${selSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>{head}</div>}
                  <div id={`${id}-o${i}`} data-i={i} role="option" aria-selected={on} aria-disabled={o.disabled || undefined}
                    onMouseEnter={() => !o.disabled && setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)}
                    style={{ display: "flex", alignItems: o.description ? "flex-start" : "center", gap: 10, padding: "7px 10px", borderRadius: 3, cursor: o.disabled ? "default" : "pointer",
                      opacity: o.disabled ? 0.45 : 1, background: hot && !o.disabled ? "var(--zinc-100, #f4f4f5)" : "transparent" }}>
                    <SelCheck on={on} />
                    <SelGlyph option={o} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", font: `${on ? 600 : 500} 13px/1.35 ${selSans}`, color: "var(--fg1, #18181b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.label}</span>
                      {o.description && <span style={{ display: "block", marginTop: 1, font: `400 11px/1.4 ${selSans}`, color: "var(--fg3, #71717a)" }}>{o.description}</span>}
                    </span>
                    {o.meta && <span style={{ font: `400 11px ${selMono}`, color: "var(--fg3, #71717a)", flexShrink: 0, paddingTop: o.description ? 2 : 0 }}>{o.meta}</span>}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          {footer && <div style={{ borderTop: "1px solid var(--divider, #f4f4f5)", padding: 4 }}>{footer}</div>}
        </div>
      )}
      </div>
      {(error || hint) && <div style={{ marginTop: 5, font: `400 11px/1.4 ${selSans}`, color: error ? "var(--claim, #b91c1c)" : "var(--fg3, #71717a)" }}>{error || hint}</div>}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function Select(props) {
  if (props.loading) return <Skeleton.Field label={!!props.label} style={props.style} />;
  return <SelectBase {...props} />;
}
