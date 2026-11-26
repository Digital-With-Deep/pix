import * as React from "react";
import { FieldSkeleton } from "../../internal/field.jsx";
import { pixSans, pixMono, ensureStyle, usePixId, useControllable } from "../../internal/basics.jsx";

// The thumb and track live on pseudo-elements, which inline styles cannot reach. The filled part of the track is an
// inline gradient on the input itself, so it is right from the first server render.
const SLIDER_CSS = `.pix-slider{-webkit-appearance:none;appearance:none;margin:0;padding:0;width:100%;height:20px;background-color:transparent;cursor:pointer}
.pix-slider:disabled{cursor:not-allowed}
.pix-slider:focus{outline:none}
.pix-slider::-webkit-slider-runnable-track{height:20px;background:transparent;border:0}
.pix-slider::-moz-range-track{height:20px;background:transparent;border:0}
.pix-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;box-sizing:border-box;width:18px;height:18px;margin-top:1px;border-radius:999px;border:2px solid var(--emerald-600,#059669);background:var(--surface,#fff);box-shadow:var(--shadow-xs,0 1px 2px 0 rgb(0 0 0 / 0.08));transition:transform 120ms}
.pix-slider::-moz-range-thumb{box-sizing:border-box;width:18px;height:18px;border-radius:999px;border:2px solid var(--emerald-600,#059669);background:var(--surface,#fff);box-shadow:var(--shadow-xs,0 1px 2px 0 rgb(0 0 0 / 0.08));transition:transform 120ms}
.pix-slider:not(:disabled):hover::-webkit-slider-thumb{transform:scale(1.1)}
.pix-slider:not(:disabled):hover::-moz-range-thumb{transform:scale(1.1)}
.pix-slider:focus-visible::-webkit-slider-thumb{outline:2px solid var(--accent-fg,#047857);outline-offset:2px}
.pix-slider:focus-visible::-moz-range-thumb{outline:2px solid var(--accent-fg,#047857);outline-offset:2px}
.pix-slider[aria-invalid="true"]::-webkit-slider-thumb{border-color:var(--red-500,#ef4444)}
.pix-slider[aria-invalid="true"]::-moz-range-thumb{border-color:var(--red-500,#ef4444)}
.pix-slider:disabled::-webkit-slider-thumb{border-color:var(--fg3,#78716c)}
.pix-slider:disabled::-moz-range-thumb{border-color:var(--fg3,#78716c)}
@media (prefers-reduced-motion:reduce){.pix-slider::-webkit-slider-thumb,.pix-slider::-moz-range-thumb{transition:none}}`;

const toNumber = (v, fallback) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};
const decimalsOf = (n) => {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const i = s.indexOf(".");
  return i < 0 ? 0 : Math.min(s.length - i - 1, 6);
};

/** Pick a number in a range by dragging or with the arrow keys. A native range input with a label, the current value, optional min and max labels, hint and error. */
export function Slider(props) {
  const { loading, ...rest } = props;
  if (loading) return <FieldSkeleton label={rest.label != null && rest.label !== ""} height={20} style={rest.style} />;
  return <SliderBase {...rest} />;
}

function SliderBase({ label, hint, error, value, defaultValue, onChange, min = 0, max = 100, step = 1, disabled = false, required = false,
  showValue = true, showRange = false, formatValue, id: idProp, style, ...rest }) {
  React.useEffect(() => ensureStyle("pix-slider-css", SLIDER_CSS), []);
  const id = usePixId("pix-slider-", idProp);
  const lo = toNumber(min, 0);
  const hi = Math.max(lo, toNumber(max, 100));
  const clamp = (n) => Math.min(hi, Math.max(lo, n));
  const controlled = value === undefined ? undefined : clamp(toNumber(value, lo));
  const [current, setValue] = useControllable(controlled, clamp(toNumber(defaultValue, lo)), onChange);

  const n = clamp(toNumber(current, lo));
  const places = step === "any" ? 2 : decimalsOf(toNumber(step, 1));
  const format = (v) => (formatValue ? formatValue(v) : v.toLocaleString(undefined, { maximumFractionDigits: places }));
  const shown = format(n);
  const pct = hi > lo ? ((n - lo) / (hi - lo)) * 100 : 0;
  const fill = disabled ? "var(--fg3, #78716c)" : error ? "var(--red-500, #ef4444)" : "var(--emerald-600, #059669)";
  const rail = "var(--border-strong, #d6d3d1)";

  const hintId = id + "-hint", errorId = id + "-error";
  const describedBy = [error ? errorId : hint ? hintId : null, rest["aria-describedby"]].filter(Boolean).join(" ") || undefined;
  const hasLabel = label != null && label !== "";

  return (
    <div style={{ fontFamily: pixSans, opacity: disabled ? 0.6 : 1, ...style }}>
      {(hasLabel || showValue) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
          {hasLabel ? (
            <label htmlFor={id} style={{ font: `500 13px/1.4 ${pixSans}`, color: "var(--fg1, #1c1917)" }}>
              {label}{required && <span aria-hidden="true" style={{ marginLeft: 2, color: "var(--fg2, #57534e)" }}>*</span>}
            </label>
          ) : <span />}
          {showValue && (
            <output htmlFor={id} aria-hidden="true" style={{ font: `500 13px/1.4 ${pixMono}`, fontVariantNumeric: "tabular-nums", color: "var(--fg1, #1c1917)" }}>{shown}</output>
          )}
        </div>
      )}
      <input {...rest} id={id} type="range" className={"pix-slider" + (rest.className ? " " + rest.className : "")}
        min={lo} max={hi} step={step} value={n} disabled={disabled} required={required}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy}
        aria-valuetext={typeof shown === "string" ? shown : undefined}
        onChange={(e) => setValue(clamp(toNumber(e.target.value, lo)), e)}
        style={{ display: "block", background: `linear-gradient(to right, ${fill} 0 ${pct}%, ${rail} ${pct}% 100%) center / 100% 4px no-repeat`, borderRadius: 999 }} />
      {showRange && (
        <div aria-hidden="true" style={{ display: "flex", justifyContent: "space-between", marginTop: 2, font: `400 11px/1.4 ${pixMono}`, fontVariantNumeric: "tabular-nums", color: "var(--fg2, #57534e)" }}>
          <span>{format(lo)}</span><span>{format(hi)}</span>
        </div>
      )}
      {error ? <div id={errorId} style={{ marginTop: 5, font: `500 12px/1.45 ${pixSans}`, color: "var(--claim, #b91c1c)" }}>{error}</div>
        : hint ? <div id={hintId} style={{ marginTop: 5, font: `400 12px/1.45 ${pixSans}`, color: "var(--fg2, #57534e)" }}>{hint}</div> : null}
    </div>
  );
}
