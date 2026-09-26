import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const lbSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

function LicenseBannerBase({ planLabel, termEnd, daysLeft = 0, expired = false, actionLabel, onAction, style }) {
  const end = termEnd instanceof Date ? termEnd.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : termEnd;
  const tone = expired
    ? { background: "var(--claim-bg, #fef2f2)", borderColor: "var(--red-200, #fecaca)", color: "var(--claim, #b91c1c)" }
    : { background: "var(--fault-bg, #fffbeb)", borderColor: "var(--fault-border, #fde68a)", color: "var(--amber-800, #92400e)" };
  return (
    <div role="status" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px", padding: "9px 20px", borderBottom: "1px solid", font: `400 12px ${lbSans}`, ...tone, ...style }}>
      {expired
        ? <span><b style={{ fontWeight: 600 }}>The {planLabel} license ended on {end}.</b> Evidence stays readable; new runs, agents and entities are blocked.</span>
        : <span><b style={{ fontWeight: 600 }}>{daysLeft} {daysLeft === 1 ? "day" : "days"} left</b> on the {planLabel} license (ends {end}).</span>}
      {onAction && <button type="button" onClick={onAction} style={{ marginLeft: "auto", border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "inherit", font: `600 12px ${lbSans}`, textDecoration: "underline" }}>{actionLabel || (expired ? "Renew" : "See plans")}</button>}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function LicenseBanner(props) {
  if (props.loading) return <Skeleton height={38} style={{ borderRadius: 0, ...props.style }} />;
  return <LicenseBannerBase {...props} />;
}
