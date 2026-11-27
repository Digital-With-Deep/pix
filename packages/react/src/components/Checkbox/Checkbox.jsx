import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { pixSans, focusOutline, usePixId, useControllable, chain } from "../../internal/basics.jsx";

function CheckboxBase({ checked, defaultChecked = false, indeterminate = false, onChange, disabled = false, label, description, error, required = false,
  id: idProp, style, onFocus, onBlur, ...rest }) {
  const id = usePixId("pix-cb-", idProp);
  const input = React.useRef(null);
  const [on, setOn] = useControllable(checked === undefined ? undefined : !!checked, !!defaultChecked, onChange);
  const [ring, setRing] = React.useState(false);
  // `indeterminate` is a DOM property, not an attribute: re-sync after every render, since a click clears it natively.
  React.useEffect(() => { if (input.current) input.current.indeterminate = !!indeterminate; });

  const filled = on || indeterminate;
  const descId = id + "-desc", errId = id + "-err";
  const describedBy = [description ? descId : null, error ? errId : null, rest["aria-describedby"]].filter(Boolean).join(" ") || undefined;
  const ink = "var(--stone-50, #fafaf9)";

  const box = (
    <span style={{ position: "relative", display: "inline-flex", width: 16, height: 16, flexShrink: 0, marginTop: label ? 1 : 0 }}>
      <span aria-hidden="true" style={{
        position: "absolute", inset: 0, boxSizing: "border-box", borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: `1.5px solid ${filled ? "var(--emerald-600, #059669)" : error ? "var(--danger, #ef4444)" : "var(--border-field, #8b8580)"}`,
        background: filled ? "var(--emerald-600, #059669)" : "var(--surface, #fff)", transition: "background 150ms, border-color 150ms",
        outline: ring ? focusOutline : "none", outlineOffset: 2, pointerEvents: "none",
      }}>
        {indeterminate
          ? <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" focusable="false"><path d="M4 8h8" /></svg>
          : on && <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="M3.5 8.5l3 3 6-7" /></svg>}
      </span>
      <input {...rest} ref={input} id={id} type="checkbox" checked={on} disabled={disabled} required={required}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy}
        onChange={(e) => setOn(e.target.checked, e)}
        onFocus={chain(onFocus, (e) => { let v = true; try { v = e.target.matches(":focus-visible"); } catch (x) { /* older engines */ } setRing(v); })}
        onBlur={chain(onBlur, () => setRing(false))}
        style={{ position: "absolute", inset: 0, width: 16, height: 16, margin: 0, opacity: 0, cursor: disabled ? "not-allowed" : "pointer" }} />
    </span>
  );

  if (!label && !description && !error) return <span style={{ display: "inline-flex", opacity: disabled ? 0.5 : 1, ...style }}>{box}</span>;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: pixSans, opacity: disabled ? 0.5 : 1, ...style }}>
      {box}
      <span style={{ flex: 1, minWidth: 0 }}>
        {label && <label htmlFor={id} style={{ display: "block", font: `500 13px/1.4 ${pixSans}`, color: "var(--fg1, #1c1917)", cursor: disabled ? "not-allowed" : "pointer" }}>
          {label}{required && <span aria-hidden="true" style={{ marginLeft: 2, color: "var(--fg2, #57534e)" }}>*</span>}
        </label>}
        {description && <span id={descId} style={{ display: "block", marginTop: 2, font: `400 12px/1.5 ${pixSans}`, color: "var(--fg2, #57534e)" }}>{description}</span>}
        {error && <span id={errId} style={{ display: "block", marginTop: 4, font: `500 12px/1.45 ${pixSans}`, color: "var(--claim, #b91c1c)" }}>{error}</span>}
      </span>
    </div>
  );
}

/** A checkbox with optional label, description and error. Supports `indeterminate` for a partly selected group. With `loading`, renders a skeleton in its footprint. */
export function Checkbox(props) {
  if (props.loading) {
    return (
      <Skeleton label="Loading checkbox" style={{ display: "flex", gap: 10, alignItems: "flex-start", ...props.style }}>
        <span className="ds-sk" style={{ display: "block", width: 16, height: 16, flexShrink: 0 }} />
        {(props.label || props.description) && <span style={{ flex: 1 }}>
          <span className="ds-sk" style={{ display: "block", width: "45%", height: 12 }} />
          {props.description && <span className="ds-sk" style={{ display: "block", width: "70%", height: 9, marginTop: 6 }} />}
        </span>}
      </Skeleton>
    );
  }
  const { loading, ...rest } = props;
  return <CheckboxBase {...rest} />;
}
