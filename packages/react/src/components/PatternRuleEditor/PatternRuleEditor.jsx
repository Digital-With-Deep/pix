import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { ptSans, ptMono, ptCap, ptBtn, ptBtnPrimary, ptBox, ptInput, PtIcon, ptEnsureStyle, ptMs, ptAgo, ptNum } from "../Patterns/shared.jsx";

/** The look-back windows a rule can use, shortest first. */
export const PATTERN_LOOK_BACKS = [["3h", "3 hours", 3], ["12h", "12 hours", 12], ["1d", "1 day", 24], ["3d", "3 days", 72], ["7d", "7 days", 168], ["14d", "14 days", 336], ["30d", "30 days", 720]];
const PR_EMPTY = { name: "", scope: "", watchFor: [], instructions: "", lookBack: "7d" };
const prLabel = { display: "block", marginBottom: 4, font: `600 12px ${ptSans}`, color: "var(--fg1, #1c1917)" };
const prHint = { margin: "4px 0 0", font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" };

/** Snaps any look-back value to the nearest listed option: "6d" becomes "7d". */
export function nearestPatternLookBack(value) {
  if (PATTERN_LOOK_BACKS.some((o) => o[0] === value)) return value;
  const m = /^(\d+(?:\.\d+)?)\s*([hdw])$/i.exec(String(value || "").trim());
  if (!m) return "7d";
  const hours = parseFloat(m[1]) * (m[2].toLowerCase() === "h" ? 1 : m[2].toLowerCase() === "d" ? 24 : 168);
  return PATTERN_LOOK_BACKS.reduce((best, o) => (Math.abs(o[2] - hours) < Math.abs(best[2] - hours) ? o : best))[0];
}
function prNormalize(rule) {
  const r = { ...PR_EMPTY, ...(rule || {}) };
  return { ...r, watchFor: (r.watchFor || []).slice(), lookBack: nearestPatternLookBack(r.lookBack), instructions: r.instructions || "", scope: r.scope || "" };
}
function prSame(a, b) { return a.name === b.name && a.scope === b.scope && a.instructions === b.instructions && a.lookBack === b.lookBack && a.watchFor.join("\u0001") === b.watchFor.join("\u0001"); }

function PrRun({ run, now }) {
  if (!run) return null;
  const clock = isNaN(ptMs(now)) ? ptMs(run.finishedAt != null ? run.finishedAt : run.checkedAt) : ptMs(now);
  const line = { margin: 0, font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" };
  const stat = (label, n) => (
    <div key={label} style={{ minWidth: 84 }}>
      <dt style={{ ...ptCap, fontSize: 9 }}>{label}</dt>
      <dd style={{ margin: "2px 0 0", font: `600 14px ${ptMono}` }}>{ptNum(n)}</dd>
    </div>
  );
  const stats = [["Traces read", run.tracesRead], ["Searches run", run.searches], ["Patterns created", run.created], ["Updated", run.updated], ["Closed", run.closed]].filter((s) => s[1] != null);
  return (
    <section aria-label="Discovery runs" style={{ padding: "12px 16px", borderTop: "1px solid var(--border, #e7e5e4)", background: "var(--bg-subtle, #fafaf9)" }}>
      <div role="status" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={ptCap}>Last run</span>
        {run.state === "running" && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `500 12px ${ptSans}`, color: "var(--control, #6d28d9)" }}><span className="pix-pt-pulse" style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />Investigating traces</span>}
        {run.state === "queued" && <span style={{ font: `500 12px ${ptSans}` }}>Queued</span>}
        {run.state === "error" && <span style={{ font: `600 12px ${ptSans}`, color: "var(--deficiency-3, #b91c1c)" }}>Run failed</span>}
        {run.state === "done" && run.finishedAt != null && <span style={{ font: `400 12px ${ptMono}`, color: "var(--fg2, #57534e)" }}>Full investigation {ptAgo(ptMs(run.finishedAt), clock)}</span>}
        {run.checkedAt != null && <span style={{ font: `400 12px ${ptMono}`, color: "var(--fg2, #57534e)" }}>Checked {ptAgo(ptMs(run.checkedAt), clock)}</span>}
      </div>
      {run.state === "error" && run.error && <p style={{ ...line, marginTop: 6, color: "var(--fg1, #1c1917)" }}>{run.error}</p>}
      {run.state === "done" && stats.length > 0 && <dl style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", margin: "10px 0 0" }}>{stats.map((s) => stat(s[0], s[1]))}</dl>}
      {run.state === "done" && run.created === 0 && !run.updated && <p style={{ ...line, marginTop: 8 }}>This run finished without a new pattern. A check does not always find one.</p>}
      {run.gaps && run.gaps.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ font: `600 12px ${ptSans}` }}>Coverage gaps</div>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>{run.gaps.map((g, i) => <li key={i} style={line}>{g}</li>)}</ul>
        </div>
      )}
    </section>
  );
}

function PatternRuleEditorBase({
  rule, onSave, onChange, onRunNow, onDelete, run, now, watchSuggestions = [], scopeMatches, scopePlaceholder = "metadata.agent = \"refund-assistant\" AND tags INCLUDES \"prod\"",
  alerts, onConfigureAlerts, title, saveLabel, readOnly = false, style,
}) {
  const saved = React.useMemo(() => prNormalize(rule), [rule]);
  const [draft, setDraft] = React.useState(saved);
  const [entry, setEntry] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const uid = React.useId();
  React.useEffect(ptEnsureStyle, []);
  React.useEffect(() => { setDraft(saved); setEntry(""); setTouched(false); }, [saved]);
  const isNew = !(rule && rule.id);
  const dirty = !prSame(draft, saved);
  const nameError = touched && !draft.name.trim() ? "Give the rule a name. It appears on the patterns the rule finds." : null;
  const set = (patch) => { const next = { ...draft, ...patch }; setDraft(next); if (onChange) onChange(next); };
  const addWatch = (text) => {
    const t = (text || "").trim(); if (!t) return;
    if (!draft.watchFor.some((w) => w.toLowerCase() === t.toLowerCase())) set({ watchFor: draft.watchFor.concat(t) });
    setEntry("");
  };
  const save = () => { setTouched(true); if (!draft.name.trim()) return; if (onSave) onSave({ ...draft, name: draft.name.trim() }); };
  const lookBack = PATTERN_LOOK_BACKS.find((o) => o[0] === draft.lookBack);
  const suggestions = watchSuggestions.filter((s) => !draft.watchFor.some((w) => w.toLowerCase() === s.toLowerCase()));
  const heading = title || (isNew ? "New pattern rule" : "Pattern rule");

  return (
    <section className="pix-pt" aria-label={heading} style={{ ...ptBox, overflow: "hidden", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
        <span style={ptCap}>{heading}</span>
        {!isNew && rule.id && <span style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>{rule.id}</span>}
        <span style={{ flex: 1 }} />
        {dirty && !readOnly && <span role="status" style={{ font: `500 11px ${ptSans}`, color: "var(--fg2, #57534e)" }}>Unsaved changes</span>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
          <div>
            <label htmlFor={uid + "name"} style={prLabel}>Name</label>
            <input id={uid + "name"} value={draft.name} disabled={readOnly} onChange={(e) => set({ name: e.target.value })} onBlur={() => setTouched(true)} aria-invalid={nameError ? true : undefined} aria-describedby={nameError ? uid + "name-err" : undefined} placeholder="Refund agent failures" style={{ ...ptInput, borderColor: nameError ? "var(--deficiency-3, #b91c1c)" : "var(--border-strong, #d6d3d1)" }} />
            {nameError && <p id={uid + "name-err"} role="alert" style={{ ...prHint, color: "var(--deficiency-3, #b91c1c)" }}>{nameError}</p>}
          </div>
          <div>
            <label htmlFor={uid + "scope"} style={prLabel}>Scope</label>
            <input id={uid + "scope"} value={draft.scope} disabled={readOnly} onChange={(e) => set({ scope: e.target.value })} aria-describedby={uid + "scope-hint"} placeholder={scopePlaceholder} spellCheck={false} style={{ ...ptInput, fontFamily: ptMono, fontSize: 12 }} />
            <p id={uid + "scope-hint"} style={prHint}>
              A filter on the traces this rule investigates. Leave it empty to investigate every trace.
              {scopeMatches != null && <> <span style={{ font: `500 12px ${ptMono}`, color: "var(--fg1, #1c1917)" }}>{ptNum(scopeMatches)}</span> traces match in the look-back window.</>}
            </p>
          </div>
          <div>
            <label htmlFor={uid + "watch"} style={prLabel}>Watch for</label>
            {draft.watchFor.length > 0 && (
              <ul aria-label="Concerns this rule watches for" style={{ display: "flex", flexWrap: "wrap", gap: 6, listStyle: "none", margin: "0 0 6px", padding: 0 }}>
                {draft.watchFor.map((w) => (
                  <li key={w} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 4px 2px 8px", border: "1px solid var(--border-strong, #d6d3d1)", borderRadius: 3, background: "var(--bg-subtle, #fafaf9)", font: `400 12px ${ptSans}` }}>
                    {w}
                    {!readOnly && <button type="button" onClick={() => set({ watchFor: draft.watchFor.filter((x) => x !== w) })} aria-label={"Remove " + w} style={{ display: "flex", padding: 3, border: 0, background: "transparent", cursor: "pointer", color: "var(--fg2, #57534e)", borderRadius: 2 }}><PtIcon name="x" size={11} /></button>}
                  </li>
                ))}
              </ul>
            )}
            {!readOnly && (
              <div style={{ display: "flex", gap: 6 }}>
                <input id={uid + "watch"} value={entry} onChange={(e) => setEntry(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addWatch(entry); } }} aria-describedby={uid + "watch-hint"} placeholder="Tool failures, user complaints, unusually high cost" style={ptInput} />
                <button type="button" onClick={() => addWatch(entry)} disabled={!entry.trim()} style={{ ...ptBtn, opacity: entry.trim() ? 1 : 0.55 }}><PtIcon name="plus" size={12} />Add</button>
              </div>
            )}
            {!readOnly && suggestions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6 }}>
                <span style={{ font: `400 11px ${ptSans}`, color: "var(--fg2, #57534e)" }}>Suggestions</span>
                {suggestions.map((s) => <button key={s} type="button" onClick={() => addWatch(s)} style={{ ...ptBtn, minHeight: 22, padding: "0 8px", fontSize: 11, borderStyle: "dashed" }}><PtIcon name="plus" size={10} />{s}</button>)}
              </div>
            )}
            <p id={uid + "watch-hint"} style={prHint}>Concerns to investigate. One rule can hold several, and other recurring problems are still reported.</p>
          </div>
          <div>
            <label htmlFor={uid + "inst"} style={prLabel}>Custom instructions</label>
            <textarea id={uid + "inst"} value={draft.instructions} disabled={readOnly} onChange={(e) => set({ instructions: e.target.value })} rows={3} aria-describedby={uid + "inst-hint"} placeholder="Find or update patterns. Ignore traces from the load-test tenant." style={{ ...ptInput, resize: "vertical", lineHeight: 1.5 }} />
            <p id={uid + "inst-hint"} style={prHint}>Say what to exclude or emphasize. Ask for patterns to be found or updated: asking only for a summary creates no pattern records.</p>
          </div>
          <div role="radiogroup" aria-labelledby={uid + "lb"} aria-describedby={uid + "lb-hint"}>
            <span id={uid + "lb"} style={prLabel}>Look back</span>
            <div style={{ display: "flex", flexWrap: "wrap", paddingLeft: 1 }}>
              {PATTERN_LOOK_BACKS.map(([k, l]) => {
                const on = draft.lookBack === k;
                return (
                  <label key={k} style={{ position: "relative", marginLeft: -1, marginBottom: 4, padding: "4px 10px", border: "1px solid " + (on ? "var(--fg1, #1c1917)" : "var(--border-strong, #d6d3d1)"), background: on ? "var(--fg1, #1c1917)" : "var(--surface, #fff)", color: on ? "var(--surface, #fff)" : "var(--fg1, #1c1917)", font: `500 12px ${ptSans}`, cursor: readOnly ? "default" : "pointer", zIndex: on ? 1 : 0 }}>
                    <input type="radio" name={uid + "lb"} value={k} checked={on} disabled={readOnly} onChange={() => set({ lookBack: k })} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: "inherit" }} />{l}
                  </label>
                );
              })}
            </div>
            <p id={uid + "lb-hint"} style={prHint}>Use the shortest range that gives enough evidence. Each full investigation reads the whole range again, so {lookBack ? lookBack[1] : "a longer range"} of traces is re-read on every run.</p>
          </div>
          {(alerts != null || onConfigureAlerts) && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingTop: 12, borderTop: "1px solid var(--divider, #f5f5f4)" }}>
              <span style={{ color: "var(--fg2, #57534e)" }}><PtIcon name="bell" size={13} /></span>
              <span style={{ font: `600 12px ${ptSans}` }}>Alerts</span>
              <span style={{ font: `400 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>{alerts != null && alerts !== "" ? alerts : "No destinations. This rule's patterns send no alerts."}</span>
              <span style={{ flex: 1 }} />
              {onConfigureAlerts && <button type="button" onClick={onConfigureAlerts} style={{ ...ptBtn, minHeight: 24, padding: "1px 8px", fontSize: 11 }}>Configure</button>}
            </div>
          )}
        </div>
        {!readOnly && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid var(--border, #e7e5e4)" }}>
            <button type="submit" style={{ ...ptBtnPrimary, opacity: dirty || isNew ? 1 : 0.6 }}>{saveLabel || (isNew ? "Create" : "Save")}</button>
            {dirty && !isNew && <button type="button" onClick={() => { setDraft(saved); setTouched(false); if (onChange) onChange(saved); }} style={ptBtn}>Discard</button>}
            {onRunNow && <button type="button" onClick={() => onRunNow({ ...draft })} disabled={run && (run.state === "running" || run.state === "queued")} style={{ ...ptBtn, opacity: run && (run.state === "running" || run.state === "queued") ? 0.55 : 1 }}><PtIcon name="play" size={11} />Run now</button>}
            <span style={{ flex: 1 }} />
            {onDelete && !isNew && <button type="button" onClick={() => onDelete(rule)} style={{ ...ptBtn, color: "var(--deficiency-3, #b91c1c)" }}>Delete rule</button>}
          </div>
        )}
      </form>
      <PrRun run={run} now={now} />
    </section>
  );
}

/** The editor for one discovery rule: which traces to investigate, what to watch for, how far to look back, and how the last run went. With `loading`, renders a skeleton in its own footprint. */
export function PatternRuleEditor(props) {
  if (props.loading) return <Skeleton.Form fields={5} columns={1} footer style={props.style} />;
  return <PatternRuleEditorBase {...props} />;
}
