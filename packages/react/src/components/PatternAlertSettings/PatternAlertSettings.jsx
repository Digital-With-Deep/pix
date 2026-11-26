import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { ptSans, ptMono, ptCap, ptBtn, ptBtnPrimary, ptBox, ptInput, PT_SEVERITY, PtIcon, PtSeverity, PtFlag, ptEnsureStyle, ptMs, ptDay, ptNum, ptImpactCount } from "../Patterns/shared.jsx";

const PA_TYPES = {
  slack: { label: "Slack", field: "Channel", placeholder: "#agent-alerts" },
  webhook: { label: "Webhook", field: "URL", placeholder: "https://hooks.example.com/patterns" },
  pagerduty: { label: "PagerDuty", field: "Integration key", placeholder: "Integration key" },
};
const PA_MIN = [["low", "Low and above"], ["medium", "Medium and above"], ["high", "High"]];
const PA_DEFAULT = { destinations: [], minSeverity: "medium", informational: true, mention: { enabled: false, who: "", prompt: "Please investigate this pattern: {{pattern}}. Review the evidence, identify the root cause, and suggest a fix." } };
/** Longest mention prompt, in characters. */
export const PATTERN_MENTION_MAX = 2000;
const paLabel = { display: "block", marginBottom: 4, font: `600 12px ${ptSans}`, color: "var(--fg1, #1c1917)" };
const paHint = { margin: "4px 0 0", font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" };
const paH = { margin: 0, font: `600 13px ${ptSans}` };

/** Whether a pattern of this severity alerts under a config. Informational patterns follow their own switch; a pattern without a severity counts as low. */
export function patternAlerts(severity, config) {
  const c = config || PA_DEFAULT;
  if (!c.destinations || !c.destinations.length) return false;
  if (severity === "info") return c.informational !== false;
  const rank = { low: 0, medium: 1, high: 2 };
  return (rank[severity] != null ? rank[severity] : 0) >= rank[c.minSeverity || "medium"];
}
/** What a destination pill shows. Webhook URLs are cut to their host and keys to their last four characters, so secrets are never rendered. */
export function patternDestinationLabel(d) {
  if (!d) return "";
  if (d.label) return d.label;
  const t = String(d.target || "");
  if (d.type === "webhook") { const m = /^https?:\/\/([^/?#]+)/i.exec(t); return m ? m[1] : "Webhook"; }
  if (d.type === "pagerduty") return t.length > 4 ? "key ending " + t.slice(-4) : "Integration key";
  return t;
}
function paNormalize(v) {
  const c = { ...PA_DEFAULT, ...(v || {}) };
  return { ...c, destinations: (c.destinations || []).slice(), mention: { ...PA_DEFAULT.mention, ...(c.mention || {}) } };
}

function PaPreview({ pattern, config, patternUrl }) {
  const will = patternAlerts(pattern.severity, config);
  const c = ptImpactCount(pattern, "users"), i = pattern.impact || {};
  const m = config.mention, slack = config.destinations.some((d) => d.type === "slack");
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={ptCap}>Preview</span>
        <span role="status" style={{ font: `500 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>{will ? "This pattern would send an alert." : config.destinations.length ? "This pattern is below the alert severity, so nothing is sent." : "No destinations, so nothing is sent."}</span>
      </div>
      <div style={{ padding: 12, border: (will ? "1px solid" : "1px dashed") + " var(--border-strong, #d6d3d1)", borderLeft: "3px solid " + (will && PT_SEVERITY[pattern.severity] ? PT_SEVERITY[pattern.severity].ink : "var(--border-strong, #d6d3d1)"), borderRadius: 3, background: will ? "var(--surface, #fff)" : "var(--bg-subtle, #fafaf9)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <span style={{ font: `600 13px ${ptSans}` }}>{pattern.name}</span>
          {pattern.reopened && <PtFlag>Reopened</PtFlag>}
          {pattern.severityRaised && <PtFlag>Severity raised</PtFlag>}
          <PtSeverity value={pattern.severity} />
        </div>
        {pattern.summary && <p style={{ margin: "4px 0 0", font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" }}>{pattern.summary}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", marginTop: 6, font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>
          {(pattern.categories || []).length > 0 && <span>{pattern.categories.join(", ")}</span>}
          {pattern.firstSeen != null && <span>first seen {ptDay(ptMs(pattern.firstSeen))}</span>}
          {pattern.lastSeen != null && <span>last seen {ptDay(ptMs(pattern.lastSeen))}</span>}
          {c && <span>{c.unit} affected {i.estimated ? "~" : ""}{ptNum(c.n)}{i.from != null && i.to != null ? " (" + ptDay(ptMs(i.from)) + " – " + ptDay(ptMs(i.to)) + ")" : ""}</span>}
        </div>
        {slack && m.enabled && m.who && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--divider, #f5f5f4)", font: `400 12px/1.5 ${ptSans}` }}>
            <span style={{ font: `600 12px ${ptMono}`, color: "var(--control, #6d28d9)" }}>@{m.who.replace(/^@/, "")}</span>{" "}
            {m.prompt.split("{{pattern}}").map((part, n, all) => <React.Fragment key={n}>{part}{n < all.length - 1 && <span style={{ font: `400 12px ${ptMono}`, textDecoration: "underline", textUnderlineOffset: 2 }}>{patternUrl || pattern.name}</span>}</React.Fragment>)}
          </div>
        )}
      </div>
    </div>
  );
}

function PatternAlertSettingsBase({
  value, defaultValue, onChange, onSave, channels, members, previewPattern, patternUrl, title = "Pattern alerts", readOnly = false, style,
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(() => paNormalize(defaultValue));
  const config = controlled ? paNormalize(value) : inner;
  const [type, setType] = React.useState("slack");
  const [target, setTarget] = React.useState("");
  const [pdSeverity, setPdSeverity] = React.useState("error");
  const [err, setErr] = React.useState(null);
  const uid = React.useId();
  React.useEffect(ptEnsureStyle, []);
  const set = (patch) => { const next = { ...config, ...patch }; if (!controlled) setInner(next); if (onChange) onChange(next); };
  const hasSlack = config.destinations.some((d) => d.type === "slack");
  const m = config.mention;
  const promptError = m.enabled && m.prompt.indexOf("{{pattern}}") === -1 ? "Include {{pattern}} so the reply links to the pattern." : m.prompt.length > PATTERN_MENTION_MAX ? "Keep the prompt to " + ptNum(PATTERN_MENTION_MAX) + " characters." : null;
  const add = () => {
    const t = target.trim();
    if (!t) { setErr(PA_TYPES[type].field + " is required."); return; }
    if (type === "webhook" && !/^https:\/\/[^\s/]+/i.test(t)) { setErr("Enter an https:// URL."); return; }
    if (type === "slack" && hasSlack) { setErr("One Slack channel per project. Remove the current one first."); return; }
    const d = { id: type + "-" + Date.now().toString(36), type, target: type === "slack" && t[0] !== "#" ? "#" + t : t };
    if (type === "pagerduty") d.severity = pdSeverity;
    set({ destinations: config.destinations.concat(d) }); setTarget(""); setErr(null);
  };
  const slackChoice = type === "slack" && channels && channels.length > 0;
  const sel = { ...ptBtn, height: 30, padding: "0 8px" };

  return (
    <section className="pix-pt" aria-label={typeof title === "string" ? title : "Pattern alerts"} style={{ ...ptBox, overflow: "hidden", ...style }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border, #e7e5e4)" }}><span style={ptCap}>{title}</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 16 }}>
        <div>
          <h4 style={paH}>Alert destinations</h4>
          <p style={paHint}>Every destination receives each pattern alert: one alert per pattern, not a report of the run.</p>
          {config.destinations.length > 0
            ? <ul aria-label="Alert destinations" style={{ display: "flex", flexWrap: "wrap", gap: 6, listStyle: "none", margin: "8px 0 0", padding: 0 }}>
                {config.destinations.map((d) => (
                  <li key={d.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 4px 3px 8px", border: "1px solid var(--border-strong, #d6d3d1)", borderRadius: 3, background: "var(--bg-subtle, #fafaf9)" }}>
                    <span style={{ font: `600 10px ${ptSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg2, #57534e)" }}>{(PA_TYPES[d.type] || { label: d.type }).label}</span>
                    <span style={{ font: `500 12px ${ptMono}` }}>{patternDestinationLabel(d)}</span>
                    {d.severity && <span style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>{d.severity}</span>}
                    {!readOnly && <button type="button" onClick={() => set({ destinations: config.destinations.filter((x) => x.id !== d.id) })} aria-label={"Remove " + (PA_TYPES[d.type] || { label: d.type }).label + " destination " + patternDestinationLabel(d)} style={{ display: "flex", padding: 3, border: 0, background: "transparent", cursor: "pointer", color: "var(--fg2, #57534e)", borderRadius: 2 }}><PtIcon name="x" size={11} /></button>}
                  </li>
                ))}
              </ul>
            : <p role="status" style={{ ...paHint, marginTop: 8, padding: "8px 10px", border: "1px dashed var(--border-strong, #d6d3d1)", borderRadius: 3, color: "var(--fg1, #1c1917)" }}>No destinations. Pattern alerts are off until you add one.</p>}
          {!readOnly && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 6, marginTop: 10 }}>
              <select value={type} onChange={(e) => { setType(e.target.value); setTarget(""); setErr(null); }} aria-label="Destination type" style={sel}>
                {Object.keys(PA_TYPES).map((k) => <option key={k} value={k}>{PA_TYPES[k].label}</option>)}
              </select>
              {slackChoice
                ? <select value={target} onChange={(e) => { setTarget(e.target.value); setErr(null); }} aria-label="Slack channel" style={{ ...sel, flex: "1 1 180px", fontFamily: ptMono }}>
                    <option value="">Choose a channel</option>
                    {channels.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                : <input value={target} onChange={(e) => { setTarget(e.target.value); setErr(null); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} type={type === "pagerduty" ? "password" : "text"} autoComplete="off" spellCheck={false}
                    aria-label={PA_TYPES[type].field} aria-invalid={err ? true : undefined} aria-describedby={err ? uid + "err" : undefined} placeholder={PA_TYPES[type].placeholder} style={{ ...ptInput, flex: "1 1 180px", width: "auto", fontFamily: ptMono, fontSize: 12 }} />}
              {type === "pagerduty" && (
                <select value={pdSeverity} onChange={(e) => setPdSeverity(e.target.value)} aria-label="PagerDuty severity" style={sel}>
                  {["critical", "error", "warning", "info"].map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              )}
              <button type="button" onClick={add} style={{ ...ptBtn, minHeight: 30 }}><PtIcon name="plus" size={12} />Add destination</button>
            </div>
          )}
          {err && <p id={uid + "err"} role="alert" style={{ ...paHint, color: "var(--deficiency-3, #b91c1c)" }}>{err}</p>}
        </div>

        <div>
          <h4 id={uid + "sev"} style={paH}>Alerts on</h4>
          <p id={uid + "sev-hint"} style={paHint}>The lowest severity that sends an alert when a pattern is created, reopened, or raised to that severity. Patterns recorded without a severity count as low.</p>
          <div role="radiogroup" aria-labelledby={uid + "sev"} aria-describedby={uid + "sev-hint"} style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 8 }}>
            {PA_MIN.map(([k, l]) => (
              <label key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `400 13px ${ptSans}`, cursor: readOnly ? "default" : "pointer" }}>
                <input type="radio" name={uid + "sev"} value={k} checked={config.minSeverity === k} disabled={readOnly} onChange={() => set({ minSeverity: k })} style={{ margin: 0, accentColor: "var(--fg1, #1c1917)" }} />{l}
              </label>
            ))}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, font: `400 13px ${ptSans}`, cursor: readOnly ? "default" : "pointer" }}>
            <input type="checkbox" checked={config.informational !== false} disabled={readOnly} onChange={(e) => set({ informational: e.target.checked })} style={{ margin: 0, accentColor: "var(--fg1, #1c1917)" }} />
            Informational patterns
            <span style={{ font: `400 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>alert whichever minimum is chosen</span>
          </label>
        </div>

        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <h4 style={paH}>Mention an agent or teammate</h4>
            <span style={{ flex: 1 }} />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `500 12px ${ptSans}`, cursor: readOnly || !hasSlack ? "default" : "pointer", color: hasSlack ? "var(--fg1, #1c1917)" : "var(--fg2, #57534e)" }}>
              <input type="checkbox" role="switch" checked={!!m.enabled && hasSlack} disabled={readOnly || !hasSlack} onChange={(e) => set({ mention: { ...m, enabled: e.target.checked } })} style={{ margin: 0, accentColor: "var(--fg1, #1c1917)" }} />
              {m.enabled && hasSlack ? "Enabled" : "Off"}
            </label>
          </div>
          <p style={paHint}>{hasSlack ? "Replies to each Slack alert with a mention and instructions to investigate it. Turning this off keeps the alerts." : "Add a Slack destination first. Mentions apply only to Slack alerts."}</p>
          {m.enabled && hasSlack && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
              <div>
                <label htmlFor={uid + "who"} style={paLabel}>Mention</label>
                {members && members.length
                  ? <select id={uid + "who"} value={m.who} disabled={readOnly} onChange={(e) => set({ mention: { ...m, who: e.target.value } })} style={{ ...sel, fontFamily: ptMono, minWidth: 200 }}>
                      <option value="">Choose a member</option>
                      {members.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  : <input id={uid + "who"} value={m.who} disabled={readOnly} onChange={(e) => set({ mention: { ...m, who: e.target.value } })} placeholder="triage-agent" style={{ ...ptInput, maxWidth: 280, fontFamily: ptMono, fontSize: 12 }} />}
              </div>
              <div>
                <label htmlFor={uid + "prompt"} style={paLabel}>Prompt</label>
                <textarea id={uid + "prompt"} value={m.prompt} disabled={readOnly} rows={3} onChange={(e) => set({ mention: { ...m, prompt: e.target.value } })} aria-invalid={promptError ? true : undefined} aria-describedby={uid + "prompt-hint"} style={{ ...ptInput, resize: "vertical", lineHeight: 1.5, borderColor: promptError ? "var(--deficiency-3, #b91c1c)" : "var(--border-strong, #d6d3d1)" }} />
                <div id={uid + "prompt-hint"} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <p role={promptError ? "alert" : undefined} style={{ ...paHint, color: promptError ? "var(--deficiency-3, #b91c1c)" : "var(--fg2, #57534e)" }}>{promptError || <>Use <span style={{ fontFamily: ptMono }}>{"{{pattern}}"}</span> for the pattern link.</>}</p>
                  <span style={{ ...paHint, fontFamily: ptMono, whiteSpace: "nowrap" }}>{ptNum(m.prompt.length)} / {ptNum(PATTERN_MENTION_MAX)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {previewPattern && <PaPreview pattern={previewPattern} config={config} patternUrl={patternUrl} />}
      </div>
      {onSave && !readOnly && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border, #e7e5e4)" }}>
          <button type="button" onClick={() => { if (!promptError) onSave(config); }} aria-disabled={promptError ? true : undefined} style={{ ...ptBtnPrimary, opacity: promptError ? 0.55 : 1 }}>Save</button>
        </div>
      )}
    </section>
  );
}

/** Where pattern alerts go, which severities send one, and who is asked to investigate. With `loading`, renders a skeleton in its own footprint. */
export function PatternAlertSettings(props) {
  if (props.loading) return <Skeleton.Form fields={4} columns={1} footer={!!props.onSave} style={props.style} />;
  return <PatternAlertSettingsBase {...props} />;
}
