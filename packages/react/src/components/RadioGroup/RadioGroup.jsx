import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const rgSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

function RadioGroupBase({ options = [], value, onChange, label, hint, error, name, disabled = false, style }) {
  const gid = React.useMemo(() => name || "rg" + Math.random().toString(36).slice(2, 8), [name]);
  const [focus, setFocus] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  return (
    <div role="radiogroup" aria-labelledby={label ? gid + "-l" : undefined} aria-invalid={error ? true : undefined}
      aria-describedby={error || hint ? gid + "-msg" : undefined} style={{ fontFamily: rgSans, ...style }}>
      {label && <div id={gid + "-l"} style={{ marginBottom: 8, font: `600 11px ${rgSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>{label}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o) => {
          const on = o.value === value, off = disabled || o.disabled;
          return (
            <label key={o.value} onMouseEnter={() => !off && setHover(o.value)} onMouseLeave={() => setHover(null)}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: off ? "default" : "pointer", opacity: off ? 0.5 : 1,
                background: !off && !on && hover === o.value ? "var(--bg-muted, #f4f4f5)" : "transparent", transition: "background 120ms" }}>
              <input type="radio" name={gid} value={o.value} checked={on} disabled={off} onChange={() => onChange && onChange(o.value, o)}
                onFocus={() => setFocus(o.value)} onBlur={() => setFocus(null)} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
              <span aria-hidden="true" style={{ width: 16, height: 16, marginTop: 1, flexShrink: 0, borderRadius: 999, boxSizing: "border-box", background: "var(--surface, #fff)",
                border: on ? "5px solid var(--zinc-900, #18181b)" : `1.5px solid ${error ? "var(--danger, #ef4444)" : "var(--border-field, #8b8580)"}`, transition: "border 120ms",
                outline: focus === o.value ? "2px solid var(--focus-ring, #047857)" : "none", outlineOffset: 2 }} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", font: `500 13px/1.4 ${rgSans}`, color: "var(--fg1, #18181b)" }}>{o.label}</span>
                {o.description && <span style={{ display: "block", marginTop: 1, font: `400 12px/1.5 ${rgSans}`, color: "var(--fg3, #71717a)" }}>{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {(error || hint) && <div id={gid + "-msg"} style={{ marginTop: 8, font: `${error ? 500 : 400} 12px/1.45 ${rgSans}`, color: error ? "var(--claim, #b91c1c)" : "var(--fg2, #57534e)" }}>{error || hint}</div>}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function RadioGroup(props) {
  if (props.loading) return <Skeleton.List rows={(props.options || []).length || 3} glyph twoLine style={{ border: 0, ...props.style }} />;
  return <RadioGroupBase {...props} />;
}
