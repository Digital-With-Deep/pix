// Shared shell for TextField and Textarea: label, control, hint or error, character count.
import * as React from "react";
import { Skeleton } from "../components/Skeleton/Skeleton.jsx";
import { pixSans, pixMono, srOnly, ensureBasicsStyle, usePixId, useControllable, chain } from "./basics.jsx";

export function FieldBase({ multiline = false, label, hint, error, required = false, disabled = false, readOnly = false, value, defaultValue, onChange,
  maxLength, showCount, id: idProp, rows = 4, resize = "vertical", type = "text", inputStyle, style, onFocus, onBlur, ...rest }) {
  React.useEffect(ensureBasicsStyle, []);
  const id = usePixId("pix-field-", idProp);
  const controlledValue = value === undefined ? undefined : value == null ? "" : String(value);
  const [current, setValue] = useControllable(controlledValue, defaultValue == null ? "" : String(defaultValue), onChange);
  const [focus, setFocus] = React.useState(false);

  const text = current == null ? "" : current;
  const counting = maxLength != null && showCount !== false;
  const atLimit = counting && text.length >= maxLength;
  const hintId = id + "-hint", errorId = id + "-error", countId = id + "-count";
  const describedBy = [error ? errorId : hint ? hintId : null, counting ? countId : null, rest["aria-describedby"]].filter(Boolean).join(" ") || undefined;

  const border = error ? "var(--red-500, #ef4444)" : focus ? "var(--accent-fg, #047857)" : "var(--border-strong, #d6d3d1)";
  const control = {
    display: "block", width: "100%", boxSizing: "border-box", margin: 0, padding: "8px 10px", borderRadius: 3,
    border: `1px solid ${border}`, boxShadow: focus ? `0 0 0 1px ${border}` : "none", outline: "none",
    background: disabled ? "var(--bg-subtle, #fafaf9)" : "var(--surface, #fff)", color: disabled ? "var(--fg2, #57534e)" : "var(--fg1, #1c1917)",
    font: `400 14px/${multiline ? 1.5 : 1.4} ${pixSans}`, cursor: disabled ? "not-allowed" : undefined,
    transition: "border-color 150ms, box-shadow 150ms",
    ...(multiline ? { minHeight: 64, resize } : null),
    ...inputStyle,
  };
  const shared = {
    ...rest, id, className: "pix-f-control" + (rest.className ? " " + rest.className : ""), value: text, disabled, readOnly, required, maxLength,
    "aria-invalid": error ? true : undefined, "aria-describedby": describedBy,
    onChange: (e) => setValue(e.target.value, e),
    onFocus: chain(onFocus, () => setFocus(true)), onBlur: chain(onBlur, () => setFocus(false)),
    style: control,
  };

  return (
    <div style={{ fontFamily: pixSans, ...style }}>
      {label != null && label !== "" && (
        <label htmlFor={id} style={{ display: "block", marginBottom: 6, font: `500 13px/1.4 ${pixSans}`, color: "var(--fg1, #1c1917)" }}>
          {label}{required && <span aria-hidden="true" style={{ marginLeft: 2, color: "var(--fg2, #57534e)" }}>*</span>}
        </label>
      )}
      {multiline ? <textarea {...shared} rows={rows} /> : <input {...shared} type={type} />}
      {(error || hint || counting) && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 5 }}>
          {error ? <div id={errorId} style={{ flex: 1, minWidth: 0, font: `500 12px/1.45 ${pixSans}`, color: "var(--claim, #b91c1c)" }}>{error}</div>
            : hint ? <div id={hintId} style={{ flex: 1, minWidth: 0, font: `400 12px/1.45 ${pixSans}`, color: "var(--fg2, #57534e)" }}>{hint}</div>
            : <span style={{ flex: 1 }} />}
          {counting && (
            <div id={countId} style={{ flexShrink: 0, font: `500 11px/1.6 ${pixMono}`, fontVariantNumeric: "tabular-nums", color: atLimit ? "var(--fault, #b45309)" : "var(--fg2, #57534e)" }}>
              <span aria-hidden="true">{text.length}/{maxLength}</span>
              <span style={srOnly}>{text.length} of {maxLength} characters used</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Label bar plus a control box of `height`, matching the field's footprint. */
export function FieldSkeleton({ label, height, style }) {
  return (
    <Skeleton label="Loading field" style={style}>
      {label && <span className="ds-sk" style={{ display: "block", width: 90, height: 9, marginBottom: 8 }} />}
      <span className="ds-sk" style={{ display: "block", width: "100%", height }} />
    </Skeleton>
  );
}
