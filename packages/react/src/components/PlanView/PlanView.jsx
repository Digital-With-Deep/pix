import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { Button } from "../Button/Button.jsx";

const pvSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const pvMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const PV_CSS = "@keyframes pixPvPulse{0%{transform:scale(1);opacity:.55}100%{transform:scale(2.4);opacity:0}}"
  + ".pix-pv-pulse{animation:pixPvPulse 1.6s cubic-bezier(.4,0,.2,1) infinite}"
  + "@media (prefers-reduced-motion:reduce){.pix-pv-pulse{animation:none;opacity:0}}"
  + ".pix-pv button:focus-visible{outline:2px solid var(--accent, #10b981);outline-offset:2px}";
function pvEnsureStyle() {
  if (typeof document === "undefined" || document.getElementById("__pix_plan_view")) return;
  const s = document.createElement("style"); s.id = "__pix_plan_view"; s.textContent = PV_CSS; document.head.appendChild(s);
}
const PV_STATUS = {
  proposed: { label: "Proposed", ink: "var(--fg2, #52525b)", bg: "var(--bg-muted, #f4f4f5)" },
  running: { label: "Running", ink: "var(--accent-fg, #047857)", bg: "var(--accent-bg, #ecfdf5)" },
  done: { label: "Done", ink: "var(--accent-fg, #047857)", bg: "var(--accent-bg, #ecfdf5)" },
  failed: { label: "Failed", ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)" },
};
const PV_STEP_WORDS = { pending: "Not started", running: "In progress", done: "Done", skipped: "Skipped", failed: "Failed" };
const PV_CHECK = "M5 12.5l4.5 4.5L19 7.5";
const PV_X = "M7 7l10 10M17 7L7 17";
const PV_DASH = "M7 12h10";
const pvHidden = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };

function PvIcon({ path, size = 11 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}><path d={path} /></svg>;
}

function PvMarker({ status, n, planned, small }) {
  const d = small ? 14 : 20;
  const base = { position: "relative", width: d, height: d, flexShrink: 0, borderRadius: 999, boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center" };
  if (planned) return <span aria-hidden="true" style={{ ...base, borderRadius: 3, background: "var(--zinc-100, #f4f4f5)", color: "var(--fg1, #18181b)", font: `600 ${small ? 9 : 11}px ${pvMono}` }}>{n}</span>;
  if (status === "running") {
    return (
      <span aria-hidden="true" style={base}>
        <span className="pix-pv-pulse" style={{ position: "absolute", inset: small ? 3 : 4, borderRadius: 999, background: "var(--accent, #10b981)" }} />
        <span style={{ position: "relative", width: small ? 8 : 10, height: small ? 8 : 10, borderRadius: 999, background: "var(--accent, #10b981)", boxShadow: "0 0 0 3px var(--accent-bg, #ecfdf5)" }} />
      </span>
    );
  }
  if (status === "done") return <span aria-hidden="true" style={{ ...base, background: "var(--zinc-900, #18181b)", color: "var(--fg-inverse, #fff)" }}><PvIcon path={PV_CHECK} size={small ? 9 : 11} /></span>;
  if (status === "failed") return <span aria-hidden="true" style={{ ...base, background: "var(--claim-bg, #fef2f2)", color: "var(--claim, #b91c1c)", boxShadow: "inset 0 0 0 1.5px var(--claim, #b91c1c)" }}><PvIcon path={PV_X} size={small ? 8 : 10} /></span>;
  if (status === "skipped") return <span aria-hidden="true" style={{ ...base, border: "1.5px dashed var(--border-strong, #d4d4d8)", color: "var(--fg2, #52525b)" }}><PvIcon path={PV_DASH} size={small ? 8 : 10} /></span>;
  return <span aria-hidden="true" style={{ ...base, border: "1.5px solid var(--border-strong, #d4d4d8)", background: "var(--surface, #fff)" }} />;
}

function PvSteps({ steps, planned, small, prefix }) {
  return (
    <ol style={{ listStyle: "none", margin: small ? "6px 0 0" : 0, padding: 0 }}>
      {steps.map((s, i) => {
        const status = planned ? "pending" : s.status || "pending";
        const last = i === steps.length - 1;
        const tag = !planned && (status === "running" || status === "failed" || status === "skipped");
        const label = prefix ? prefix + "." + (i + 1) : String(i + 1);
        return (
          <li key={s.id != null ? s.id : i} aria-current={status === "running" ? "step" : undefined}
            style={{ position: "relative", display: "flex", gap: small ? 8 : 11, padding: small ? "4px 0" : "8px 0" }}>
            <span style={{ position: "relative", display: "flex", justifyContent: "center", width: small ? 14 : 20, flexShrink: 0, paddingTop: small ? 1 : 0 }}>
              <PvMarker status={status} n={label} planned={planned} small={small} />
              {!last && <span aria-hidden="true" style={{ position: "absolute", top: small ? 19 : 26, bottom: small ? -6 : -10, left: "50%", width: 1, marginLeft: -0.5, background: "var(--border, #e4e4e7)" }} />}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
                <span style={{ font: `${status === "running" ? 600 : 500} ${small ? 12 : 13}px/1.45 ${pvSans}`,
                  color: status === "skipped" ? "var(--fg2, #52525b)" : "var(--fg1, #18181b)", textDecoration: status === "skipped" ? "line-through" : "none" }}>{s.label}</span>
                {tag && <span style={{ font: `600 11px ${pvSans}`, color: status === "failed" ? "var(--claim, #b91c1c)" : status === "running" ? "var(--accent-fg, #047857)" : "var(--fg2, #52525b)" }}>{PV_STEP_WORDS[status]}</span>}
                {!planned && !tag && <span style={pvHidden}>{PV_STEP_WORDS[status]}</span>}
              </span>
              {s.detail && <span style={{ display: "block", marginTop: 2, font: `400 12px/1.5 ${pvSans}`, color: "var(--fg2, #52525b)" }}>{s.detail}</span>}
              {s.substeps && s.substeps.length > 0 && <PvSteps steps={s.substeps} planned={planned} small prefix={label} />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function PlanViewBase({
  title = "Plan", steps = [], status = "proposed", elapsed, summary,
  onProceed, onEditPlan, onTakeOver, proceedLabel = "Proceed", editLabel = "Edit plan", takeOverLabel = "Do it myself", style,
}) {
  React.useEffect(pvEnsureStyle, []);
  const st = PV_STATUS[status] || PV_STATUS.proposed;
  const planned = status === "proposed";
  const total = steps.length;
  const count = (k) => steps.filter((s) => s.status === k).length;
  const doneN = count("done"), skippedN = count("skipped"), failedN = count("failed");
  const runIdx = steps.findIndex((s) => s.status === "running");
  const current = runIdx >= 0 ? steps[runIdx] : null;
  const stepWord = (n) => n + (n === 1 ? " step" : " steps");

  let progress = null;
  if (status === "running") progress = runIdx >= 0 ? "Step " + (runIdx + 1) + " of " + total : doneN + " of " + total + " done";
  let finished = null;
  if (status === "done" || status === "failed") {
    if (summary) finished = summary;
    else if (status === "done") finished = "Finished " + doneN + " of " + stepWord(total) + (skippedN ? ", " + skippedN + " skipped" : "") + (elapsed ? " in " + elapsed : "") + ".";
    else {
      const at = steps.findIndex((s) => s.status === "failed");
      finished = "Stopped at step " + (at >= 0 ? at + 1 : doneN + 1) + " of " + total + ". " + doneN + " done, " + failedN + " failed" + (skippedN ? ", " + skippedN + " skipped" : "") + (elapsed ? ", after " + elapsed : "") + ".";
    }
  }

  return (
    <section className="pix-pv" aria-label={typeof title === "string" ? title : "Plan"} style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: pvSans, color: "var(--fg1, #18181b)", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <span style={{ font: `600 13px ${pvSans}` }}>{title}</span>
        <span style={{ padding: "2px 7px", borderRadius: 3, background: st.bg, color: st.ink, font: `600 11px/1.5 ${pvSans}` }}>{st.label}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 10, font: `400 11px ${pvMono}`, color: "var(--fg2, #52525b)" }}>
          {progress && <span>{progress}</span>}
          {planned && <span>{stepWord(total)}</span>}
          {elapsed && !planned && <span><span style={pvHidden}>Elapsed </span>{elapsed}</span>}
        </span>
      </div>
      {planned && <p style={{ margin: 0, padding: "10px 14px 0", font: `400 12px/1.5 ${pvSans}`, color: "var(--fg2, #52525b)" }}>Review the plan. Nothing runs until you proceed.</p>}
      <div style={{ padding: "6px 14px 8px" }}>
        {total === 0 ? <p style={{ margin: "8px 0", font: `400 12px ${pvSans}`, color: "var(--fg2, #52525b)" }}>No steps yet.</p> : <PvSteps steps={steps} planned={planned} />}
      </div>
      <div aria-live="polite" style={pvHidden}>{status === "running" && current ? "Working on step " + (runIdx + 1) + ": " + current.label : finished || ""}</div>
      {finished && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border, #e4e4e7)", background: "var(--surface-alt, #fafafa)", font: `500 12px/1.5 ${pvSans}`, color: status === "failed" ? "var(--claim, #b91c1c)" : "var(--fg1, #18181b)" }}>{finished}</div>
      )}
      {planned && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--border, #e4e4e7)" }}>
          <Button size="sm" variant="primary" onClick={onProceed}>{proceedLabel}</Button>
          <Button size="sm" variant="outline" onClick={onEditPlan}>{editLabel}</Button>
          <Button size="sm" variant="ghost" onClick={onTakeOver} style={{ marginLeft: "auto" }}>{takeOverLabel}</Button>
        </div>
      )}
    </section>
  );
}

/** An agent's plan before it acts, then its live progress. With `loading`, renders a skeleton in its own footprint. */
export function PlanView(props) {
  if (props.loading) return <Skeleton.List rows={(props.steps || []).length || 4} glyph twoLine={false} style={props.style} />;
  return <PlanViewBase {...props} />;
}
