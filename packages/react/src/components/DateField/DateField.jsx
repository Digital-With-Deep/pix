import * as React from "react";
import { FieldBase, FieldSkeleton } from "../../internal/field.jsx";
import { ensureStyle } from "../../internal/basics.jsx";

// Native pickers draw their own icon and popup; color-scheme makes them follow the PIX theme, not only the OS.
const DATE_CSS = `[data-theme="dark"] .pix-datefield,.dark .pix-datefield{color-scheme:dark}
[data-theme="light"] .pix-datefield{color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .pix-datefield{color-scheme:dark}}
.pix-datefield::-webkit-calendar-picker-indicator{cursor:pointer;opacity:.7}
.pix-datefield:disabled::-webkit-calendar-picker-indicator{cursor:not-allowed}`;

const NATIVE = { date: "date", time: "time", datetime: "datetime-local" };
const pad = (n) => String(n).padStart(2, "0");
const ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTime = (d, seconds) => `${pad(d.getHours())}:${pad(d.getMinutes())}${seconds ? ":" + pad(d.getSeconds()) : ""}`;

/**
 * Turn an ISO 8601 date, time or date-time into the string a native input of `type` accepts.
 * A value with a time zone (Z or an offset) is shown in local time. Anything unreadable becomes "".
 */
function toDateInputValue(type, value) {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  const zoned = ZONE.test(s) && /\d{2}:\d{2}/.test(s);
  if (type === "time") {
    if (zoned) {
      const d = new Date(s.includes("T") ? s : `1970-01-01T${s}`);
      return Number.isNaN(d.getTime()) ? "" : localTime(d, /\d{2}:\d{2}:\d{2}/.test(s));
    }
    const m = /(?:^|T)(\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)/.exec(s);
    return m ? m[1] : "";
  }
  if (zoned && s.includes("T")) {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    return type === "date" ? localDate(d) : `${localDate(d)}T${localTime(d, d.getSeconds() !== 0)}`;
  }
  const date = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  if (!date) return "";
  if (type === "date") return date[1];
  const time = /^\d{4}-\d{2}-\d{2}[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)/.exec(s);
  return `${date[1]}T${time ? time[1] : "00:00"}`;
}

/** A date, time, or date and time input on the browser's native picker, with label, hint, error and min and max bounds. Values are ISO 8601 strings. */
export function DateField(props) {
  const { loading, type = "date", value, defaultValue, min, max, ...rest } = props;
  React.useEffect(() => ensureStyle("pix-datefield-css", DATE_CSS), []);
  if (loading) return <FieldSkeleton label={rest.label != null && rest.label !== ""} height={38} style={rest.style} />;
  const kind = NATIVE[type] ? type : "date";
  const norm = (v) => (v === undefined ? undefined : toDateInputValue(kind, v));
  return (
    <FieldBase {...rest} multiline={false} type={NATIVE[kind]}
      className={"pix-datefield" + (rest.className ? " " + rest.className : "")}
      value={value === undefined ? undefined : norm(value)} defaultValue={norm(defaultValue)}
      min={norm(min) || undefined} max={norm(max) || undefined}
      inputStyle={{ fontVariantNumeric: "tabular-nums", minHeight: 38, ...rest.inputStyle }} />
  );
}
