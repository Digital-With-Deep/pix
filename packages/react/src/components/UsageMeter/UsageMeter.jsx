import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const umSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const umMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

function UsageMeterBase({ label, used = 0, limit = null, nearAt = 0.8, note, divider = false, style }) {
  const unlimited = limit === null || limit === undefined;
  const pct = unlimited || !limit ? 0 : Math.min(100, (used / limit) * 100);
  const state = unlimited ? "ok" : used >= limit ? "full" : pct >= nearAt * 100 ? "near" : "ok";
  const fill = { ok: "var(--emerald-500, #10b981)", near: "var(--amber-500, #f59e0b)", full: "var(--red-500, #ef4444)" }[state];
  const noteColor = { ok: "var(--fg3, #71717a)", near: "var(--fault, #b45309)", full: "var(--claim, #b91c1c)" }[state];
  const auto = state === "full" ? "At the limit — adding more is blocked until the license is raised." : state === "near" ? `${(limit - used).toLocaleString()} left on this license.` : null;
  const text = note === undefined ? auto : note;
  return (
    <div style={{ padding: "14px 18px", borderTop: divider ? "1px solid var(--divider, #f4f4f5)" : "none", fontFamily: umSans, ...style }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ font: `500 13px ${umSans}`, color: "var(--fg1, #18181b)" }}>{label}</span>
        <span style={{ marginLeft: "auto", font: `400 12px ${umMono}`, color: "var(--fg2, #52525b)" }}>
          <b style={{ fontWeight: 600, color: "var(--fg1, #18181b)" }}>{used.toLocaleString()}</b>{unlimited ? " · unlimited" : ` of ${limit.toLocaleString()}`}
        </span>
      </div>
      {!unlimited && (
        <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used}
          style={{ marginTop: 8, height: 6, borderRadius: 3, background: "var(--zinc-100, #f4f4f5)", overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", width: pct + "%", borderRadius: 3, background: fill }} />
        </div>
      )}
      {text && <div style={{ marginTop: 6, font: `400 11px ${umSans}`, color: noteColor }}>{text}</div>}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function UsageMeter(props) {
  if (props.loading) return <Skeleton label="Loading usage" style={{ padding: "14px 18px", ...props.style }}><div style={{ display: "flex", justifyContent: "space-between" }}><Skeleton width={120} height={12} /><Skeleton width={60} height={12} /></div><Skeleton height={6} style={{ marginTop: 10 }} /></Skeleton>;
  return <UsageMeterBase {...props} />;
}
