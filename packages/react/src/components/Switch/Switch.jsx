import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const swSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

function SwitchBase({ checked = false, onChange, label, description, disabled = false, divider = false, style }) {
  const [focus, setFocus] = React.useState(false);
  const id = React.useMemo(() => "sw" + Math.random().toString(36).slice(2, 8), []);
  const track = (
    <button type="button" role="switch" aria-checked={checked} aria-labelledby={label ? id : undefined} disabled={disabled}
      onClick={() => onChange && onChange(!checked)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ position: "relative", width: 32, height: 18, flexShrink: 0, padding: 0, border: 0, borderRadius: 999, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
        background: checked ? "var(--emerald-600, #059669)" : "var(--zinc-300, #d4d4d8)", transition: "background 150ms", outline: focus ? "2px solid var(--emerald-500, #10b981)" : "none", outlineOffset: 2 }}>
      <span style={{ position: "absolute", top: 2, left: checked ? 16 : 2, width: 14, height: 14, borderRadius: 999, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.25)", transition: "left 150ms" }} />
    </button>
  );
  if (!label) return track;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderTop: divider ? "1px solid var(--border, #e4e4e7)" : "none", fontFamily: swSans, ...style }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span id={id} style={{ display: "block", font: `500 13px/1.4 ${swSans}`, color: "var(--fg1, #18181b)" }}>{label}</span>
        {description && <span style={{ display: "block", marginTop: 2, font: `400 12px/1.5 ${swSans}`, color: "var(--fg3, #71717a)" }}>{description}</span>}
      </span>
      {track}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function Switch(props) {
  if (props.loading) return props.label ? <Skeleton.List rows={1} glyph={false} style={{ border: 0, ...props.style }} /> : <Skeleton width={32} height={18} style={{ borderRadius: 999, ...props.style }} />;
  return <SwitchBase {...props} />;
}
