import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import {
  ptSans, ptMono, ptCap, ptBtn, ptBtnPrimary, ptBox, ptInput, PT_SEVERITY, PT_SEVERITY_ORDER, PT_STATUS, PT_STATUS_ORDER, PT_UNITS,
  PtIcon, PtSeverity, PtStatus, PtFlag, ptEnsureStyle, ptMs, ptDay, ptStamp, ptNum, ptPct, ptImpactCount, ptCopy, ptSafeHref,
} from "../Patterns/shared.jsx";

const PD_KIND = {
  problem: { label: "Problem", ink: "var(--deficiency-3, #b91c1c)" },
  retry: { label: "Successful retry", ink: "var(--fg2, #57534e)" },
  contrast: { label: "Contrast", ink: "var(--fg2, #57534e)" },
};
const pdH = { margin: 0, ...ptCap };
const pdP = { margin: 0, font: `400 13px/1.6 ${ptSans}`, color: "var(--fg1, #1c1917)" };

/** A Markdown brief of a pattern for a coding agent: the finding, impact, suggested fix, evidence and source references. */
export function patternPrompt(pattern, options) {
  if (!pattern) return "";
  const o = options || {}, i = pattern.impact || {}, out = [];
  out.push("# Pattern: " + pattern.name, "");
  out.push("- Severity: " + (PT_SEVERITY[pattern.severity] ? PT_SEVERITY[pattern.severity].label : "Unrated"));
  out.push("- Status: " + (PT_STATUS[pattern.status] ? PT_STATUS[pattern.status].label : "Open"));
  if (pattern.categories && pattern.categories.length) out.push("- Categories: " + pattern.categories.join(", "));
  if (pattern.firstSeen != null) out.push("- First seen: " + ptStamp(ptMs(pattern.firstSeen)));
  if (pattern.lastSeen != null) out.push("- Last seen: " + ptStamp(ptMs(pattern.lastSeen)));
  const counts = PT_UNITS.filter((u) => i[u] != null).map((u) => (i.estimated ? "~" : "") + ptNum(i[u]) + " " + u);
  if (counts.length) out.push("- Impact: " + counts.join(", ") + (i.share != null ? " (" + ptPct(i.share) + " of traffic)" : "") + (i.from != null && i.to != null ? ", " + ptDay(ptMs(i.from)) + " to " + ptDay(ptMs(i.to)) : ""));
  if (o.url) out.push("- Link: " + o.url);
  if (pattern.summary) out.push("", "## Finding", "", pattern.summary);
  if (pattern.suggestedFix) out.push("", "## Suggested fix" + (pattern.cause === "hypothesis" ? " (hypothesis, not yet confirmed)" : ""), "", pattern.suggestedFix);
  if (pattern.evidence && pattern.evidence.length) {
    out.push("", "## Evidence", "");
    pattern.evidence.forEach((e) => {
      out.push("- `" + e.traceId + "`" + (e.kind ? " (" + (PD_KIND[e.kind] ? PD_KIND[e.kind].label.toLowerCase() : e.kind) + ")" : "") + (e.title ? ": " + e.title : ""));
      if (e.reason) out.push("  - Why it matters: " + e.reason);
    });
  }
  if (pattern.code && pattern.code.length) {
    out.push("", "## Source references", "");
    pattern.code.forEach((c) => out.push("- `" + c.file + (c.lines ? ":" + c.lines : "") + "`" + (c.revision ? " at `" + c.revision + "`" : "") + (c.note ? ": " + c.note : "")));
  }
  if (o.traceCommand && pattern.evidence && pattern.evidence.length) {
    out.push("", "## Retrieve the full traces", "", "```sh");
    pattern.evidence.forEach((e) => out.push(o.traceCommand.replace(/\{\{trace\}\}/g, e.traceId)));
    out.push("```");
  }
  return out.join("\n") + "\n";
}

/** Renders `text` with the first occurrence of `highlight` marked. */
function PdExcerpt({ text, highlight }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  const pre = { margin: 0, padding: "8px 10px", background: "var(--bg-subtle, #fafaf9)", border: "1px solid var(--divider, #f5f5f4)", borderRadius: 3, font: `400 12px/1.6 ${ptMono}`, color: "var(--fg1, #1c1917)", whiteSpace: "pre-wrap", wordBreak: "break-word" };
  if (at === -1) return <pre style={pre}>{text}</pre>;
  return (
    <pre style={pre}>{text.slice(0, at)}
      <mark style={{ background: "var(--control-bg, #f5f3ff)", color: "inherit", boxShadow: "inset 0 -2px 0 var(--control, #6d28d9)", padding: "1px 0" }}>{highlight}</mark>
      {text.slice(at + highlight.length)}</pre>
  );
}

function PdEvidence({ item, onOpenTrace }) {
  const [open, setOpen] = React.useState(false);
  const k = PD_KIND[item.kind] || null, rid = React.useId();
  return (
    <li style={{ padding: "10px 0", borderTop: "1px solid var(--divider, #f5f5f4)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: item.excerpt ? 6 : 0 }}>
        {k && <span style={{ font: `600 10px ${ptMono}`, textTransform: "uppercase", letterSpacing: "0.04em", color: k.ink }}>{k.label}</span>}
        {onOpenTrace
          ? <button type="button" onClick={() => onOpenTrace(item)} aria-label={"Open trace " + item.traceId} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", font: `500 12px ${ptMono}`, color: "var(--fg1, #1c1917)", textDecoration: "underline", textUnderlineOffset: 2 }}>{item.traceId}</button>
          : <span style={{ font: `500 12px ${ptMono}` }}>{item.traceId}</span>}
        {item.title && <span style={{ font: `400 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>{item.title}</span>}
        <span style={{ flex: 1 }} />
        {item.at != null && <time dateTime={isNaN(ptMs(item.at)) ? undefined : new Date(ptMs(item.at)).toISOString()} style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>{ptStamp(ptMs(item.at))}</time>}
      </div>
      {item.excerpt && <PdExcerpt text={item.excerpt} highlight={item.highlight} />}
      {item.reason && <>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={rid} style={{ ...ptBtn, minHeight: 22, marginTop: 6, padding: "1px 8px", fontSize: 11, color: "var(--control, #6d28d9)" }}>{open ? "Hide reason" : "Show reason"}</button>
        {open && <p id={rid} style={{ ...pdP, marginTop: 6, fontSize: 12, color: "var(--fg2, #57534e)" }}>{item.reason}</p>}
      </>}
    </li>
  );
}

function PdImpact({ pattern, onOpenPeriod }) {
  const series = pattern.impactSeries || [];
  const units = PT_UNITS.filter((u) => series.some((p) => p.matched && p.matched[u] != null));
  const [unit, setUnit] = React.useState(units[0] || "traces");
  const [pct, setPct] = React.useState(false);
  const u = units.indexOf(unit) === -1 ? units[0] : unit;
  if (!series.length || !u) return null;
  const hasTotals = series.every((p) => p.total && p.total[u] > 0);
  const val = (p) => { const m = (p.matched && p.matched[u]) || 0; return pct && hasTotals ? m / p.total[u] : m; };
  const max = Math.max.apply(null, series.map(val).concat(pct && hasTotals ? 0.0001 : 1));
  const fmt = (v) => (pct && hasTotals ? ptPct(v) : ptNum(v));
  const seg = (on) => ({ ...ptBtn, minHeight: 24, padding: "1px 8px", fontSize: 11, borderRadius: 0, marginLeft: -1, background: on ? "var(--fg1, #1c1917)" : "var(--surface, #fff)", color: on ? "var(--surface, #fff)" : "var(--fg1, #1c1917)", borderColor: on ? "var(--fg1, #1c1917)" : "var(--border-strong, #d6d3d1)" });
  return (
    <section aria-label="Impact over time">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <h4 style={pdH}>Impacted</h4>
        {units.length > 1
          ? <select value={u} onChange={(e) => setUnit(e.target.value)} aria-label="Count impact by" style={{ ...ptBtn, minHeight: 24, height: 24, padding: "0 6px", fontSize: 11 }}>{units.map((x) => <option key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</option>)}</select>
          : <span style={{ font: `500 11px ${ptSans}`, color: "var(--fg2, #57534e)" }}>{u}</span>}
        <span style={{ flex: 1 }} />
        {hasTotals && (
          <span role="group" aria-label="Show counts or percentages" style={{ display: "inline-flex", paddingLeft: 1 }}>
            <button type="button" aria-pressed={!pct} onClick={() => setPct(false)} style={seg(!pct)}>Count</button>
            <button type="button" aria-pressed={pct} onClick={() => setPct(true)} style={seg(pct)}>Percent</button>
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 96 }}>
        {series.map((p, i) => {
          const v = val(p), h = Math.max(2, Math.round((v / max) * 78));
          const label = p.label + ": " + fmt(v) + " " + u;
          const bar = <span style={{ display: "block", width: "100%", height: h, background: "var(--fg1, #1c1917)", borderRadius: "2px 2px 0 0", opacity: v ? 1 : 0.25 }} />;
          return (
            <div key={i} style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
              {onOpenPeriod
                ? <button type="button" onClick={() => onOpenPeriod(p, u)} title={label} aria-label={label + ". Open matching logs"} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: "100%", height: 80, padding: 0, border: 0, background: "transparent", cursor: "pointer" }}>{bar}</button>
                : <div role="img" aria-label={label} title={label} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 80 }}>{bar}</div>}
              <span aria-hidden="true" style={{ marginTop: 4, font: `400 9px ${ptMono}`, color: "var(--fg2, #57534e)", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", visibility: series.length > 10 && i % 2 ? "hidden" : "visible" }}>{p.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PdModels({ models }) {
  if (!models || !models.length) return null;
  const max = Math.max.apply(null, models.map((m) => Math.max(m.matchShare || 0, m.trafficShare || 0)).concat(0.0001));
  const row = (label, share, ink) => (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr 44px", alignItems: "center", gap: 8 }}>
      <span style={{ font: `400 11px ${ptSans}`, color: "var(--fg2, #57534e)" }}>{label}</span>
      <span style={{ height: 6, background: "var(--bg-muted, #f5f5f4)", borderRadius: 1 }}><span style={{ display: "block", width: Math.round((share / max) * 100) + "%", height: "100%", background: ink, borderRadius: 1 }} /></span>
      <span style={{ font: `400 11px ${ptMono}`, textAlign: "right" }}>{ptPct(share)}</span>
    </div>
  );
  return (
    <section aria-label="Models">
      <h4 style={{ ...pdH, marginBottom: 8 }}>Models</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {models.map((m) => {
          const over = m.trafficShare > 0 && m.matchShare / m.trafficShare >= 1.5;
          return (
            <div key={m.model}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ font: `500 12px ${ptMono}` }}>{m.model}</span>
                {over && <PtFlag>Over-represented</PtFlag>}
              </div>
              {row("Pattern matches", m.matchShare || 0, "var(--fg1, #1c1917)")}
              {row("All traffic", m.trafficShare || 0, "var(--border-strong, #d6d3d1)")}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** A select that asks for an optional reason before it reports the change. */
function PdProperty({ label, value, options, onCommit, readOnly, render }) {
  const [next, setNext] = React.useState(null);
  const [reason, setReason] = React.useState("");
  const id = React.useId();
  const commit = () => { onCommit(next, reason.trim() || undefined); setNext(null); setReason(""); };
  return (
    <div style={{ padding: "8px 0", borderTop: "1px solid var(--divider, #f5f5f4)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 26 }}>
        <label htmlFor={id} style={{ font: `400 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>{label}</label>
        {readOnly || !onCommit
          ? <span id={id}>{render(value)}</span>
          : <select id={id} value={next != null ? next : value || ""} onChange={(e) => { setNext(e.target.value === (value || "") ? null : e.target.value); }} style={{ ...ptBtn, minHeight: 26, height: 26, padding: "0 6px" }}>
              {!value && <option value="">Unrated</option>}
              {options.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>}
      </div>
      {next != null && (
        <div style={{ marginTop: 6 }}>
          <input value={reason} onChange={(e) => setReason(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commit(); }} placeholder="Reason (optional)" aria-label={"Reason for changing " + label.toLowerCase()} style={{ ...ptInput, fontSize: 12 }} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button type="button" onClick={commit} style={{ ...ptBtnPrimary, minHeight: 24, padding: "1px 10px", fontSize: 11 }}>Apply</button>
            <button type="button" onClick={() => { setNext(null); setReason(""); }} style={{ ...ptBtn, minHeight: 24, padding: "1px 10px", fontSize: 11 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PdRating({ rating, onRate, readOnly }) {
  const [pick, setPick] = React.useState(null);
  const [comment, setComment] = React.useState("");
  if (rating) return <p style={{ ...pdP, fontSize: 12, color: "var(--fg2, #57534e)" }}>Rated {rating === "useful" ? "useful" : "not useful"}. Ratings guide later investigations.</p>;
  if (readOnly || !onRate) return null;
  const done = (c) => { onRate(pick, c || undefined); setPick(null); setComment(""); };
  return (
    <section aria-label="Rate this pattern" style={{ padding: 12, border: "1px solid var(--border, #e7e5e4)", borderRadius: 3, background: "var(--bg-subtle, #fafaf9)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ font: `600 13px ${ptSans}` }}>Is this pattern useful?</span>
        <span style={{ flex: 1 }} />
        <button type="button" aria-pressed={pick === "useful"} onClick={() => setPick("useful")} style={{ ...ptBtn, background: pick === "useful" ? "var(--bg-muted, #f5f5f4)" : "var(--surface, #fff)" }}><PtIcon name="up" size={12} />Yes</button>
        <button type="button" aria-pressed={pick === "not_useful"} onClick={() => setPick("not_useful")} style={{ ...ptBtn, background: pick === "not_useful" ? "var(--bg-muted, #f5f5f4)" : "var(--surface, #fff)" }}><PtIcon name="down" size={12} />No</button>
      </div>
      {pick && (
        <div style={{ marginTop: 8 }}>
          {pick === "not_useful" && <p style={{ ...pdP, marginBottom: 6, fontSize: 12, color: "var(--fg2, #57534e)" }}>No dismisses the pattern and closes it.</p>}
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Comment (optional)" aria-label="Rating comment" style={{ ...ptInput, resize: "vertical", fontSize: 12 }} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button type="button" onClick={() => done(comment.trim())} style={{ ...ptBtnPrimary, minHeight: 24, padding: "1px 10px", fontSize: 11 }}>Submit</button>
            <button type="button" onClick={() => done("")} style={{ ...ptBtn, minHeight: 24, padding: "1px 10px", fontSize: 11 }}>Skip comment</button>
            <button type="button" onClick={() => { setPick(null); setComment(""); }} style={{ ...ptBtn, minHeight: 24, padding: "1px 10px", fontSize: 11 }}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}

function PatternDetailBase({
  pattern, onInvestigate, onCopyPrompt, onCopyLink, href, traceCommand, onStatusChange, onSeverityChange, onCategoriesChange,
  categoryOptions, onRate, onOpenTrace, onOpenPeriod, readOnly = false, impactUnit = "traces", investigateLabel = "Investigate", style,
}) {
  const [tab, setTab] = React.useState("traces");
  const [copied, setCopied] = React.useState(null);
  const [editCats, setEditCats] = React.useState(false);
  const uid = React.useId();
  React.useEffect(ptEnsureStyle, []);
  React.useEffect(() => { setTab("traces"); setEditCats(false); setCopied(null); }, [pattern && pattern.id]);
  if (!pattern) {
    return <section className="pix-pt" style={{ ...ptBox, padding: "36px 20px", textAlign: "center", ...style }}>
      <div style={{ font: `600 13px ${ptSans}` }}>No pattern selected</div>
      <div style={{ marginTop: 4, font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" }}>Choose a pattern to see its evidence and decide what to do next.</div>
    </section>;
  }
  const i = pattern.impact || {}, c = ptImpactCount(pattern, impactUnit);
  const evidence = pattern.evidence || [], code = pattern.code || [], cats = pattern.categories || [];
  const flash = (k) => { setCopied(k); setTimeout(() => setCopied((v) => (v === k ? null : v)), 1400); };
  const copyPrompt = () => { const md = patternPrompt(pattern, { url: href, traceCommand }); ptCopy(md); if (onCopyPrompt) onCopyPrompt(md); flash("prompt"); };
  const copyLink = () => { ptCopy(href); if (onCopyLink) onCopyLink(href); flash("link"); };
  const tabBtn = (k, label, n) => (
    <button type="button" role="tab" id={uid + "tab-" + k} aria-selected={tab === k} aria-controls={uid + "panel-" + k} tabIndex={tab === k ? 0 : -1} onClick={() => setTab(k)}
      onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const n2 = tab === "traces" ? "code" : "traces"; setTab(n2); const el = document.getElementById(uid + "tab-" + n2); if (el) el.focus(); } }}
      style={{ padding: "6px 2px", marginRight: 16, border: 0, borderBottom: "2px solid " + (tab === k ? "var(--fg1, #1c1917)" : "transparent"), background: "transparent", cursor: "pointer", font: `${tab === k ? 600 : 500} 12px ${ptSans}`, color: tab === k ? "var(--fg1, #1c1917)" : "var(--fg2, #57534e)" }}>
      {label} <span style={{ font: `400 11px ${ptMono}` }}>{n}</span>
    </button>
  );
  const allCats = Array.from(new Set((categoryOptions || []).concat(cats)));
  const toggleCat = (k) => onCategoriesChange(cats.indexOf(k) === -1 ? cats.concat(k) : cats.filter((x) => x !== k));

  return (
    <article className="pix-pt" aria-label={pattern.name} style={{ ...ptBox, overflow: "hidden", ...style }}>
      <header style={{ padding: "14px 16px", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <PtSeverity value={pattern.severity} /><PtStatus value={pattern.status || "open"} />
              {pattern.reopened && <PtFlag>Reopened</PtFlag>}
              {pattern.severityRaised && <PtFlag>Severity raised</PtFlag>}
              <span style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>{pattern.id}</span>
            </div>
            <h3 style={{ margin: 0, font: `600 17px/1.35 ${ptSans}` }}>{pattern.name}</h3>
            <div style={{ marginTop: 5, font: `400 12px/1.5 ${ptMono}`, color: "var(--fg2, #57534e)" }}>
              {c ? <>
                <span style={{ fontWeight: 600, color: "var(--fg1, #1c1917)" }}>{i.estimated ? "~" : ""}{ptNum(c.n)}</span> {c.unit}
                {i.share != null && <> · {ptPct(i.share)} of traffic</>}
                {i.from != null && i.to != null && <> · {ptDay(ptMs(i.from))} – {ptDay(ptMs(i.to))}</>}
                {i.estimated && <> · estimated from a sample</>}
              </> : "Impact not measured yet"}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {onInvestigate && <button type="button" onClick={() => onInvestigate(pattern)} style={ptBtnPrimary}><PtIcon name="scope" size={12} />{investigateLabel}</button>}
            <button type="button" onClick={copyPrompt} style={ptBtn}><PtIcon name={copied === "prompt" ? "check" : "copy"} size={12} />{copied === "prompt" ? "Copied" : "Copy as prompt"}</button>
            {href && <button type="button" onClick={copyLink} style={ptBtn}><PtIcon name={copied === "link" ? "check" : "link"} size={12} />{copied === "link" ? "Copied" : "Copy link"}</button>}
          </div>
        </div>
        <span aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{copied === "prompt" ? "Prompt copied" : copied === "link" ? "Link copied" : ""}</span>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ flex: "3 1 420px", minWidth: 0, padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
          {pattern.summary && <section aria-label="Summary"><h4 style={{ ...pdH, marginBottom: 6 }}>Summary</h4><p style={pdP}>{pattern.summary}</p></section>}
          {pattern.suggestedFix && (
            <section aria-label="Suggested fix">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <h4 style={pdH}>Suggested fix</h4>
                {pattern.cause && <PtFlag>{pattern.cause === "confirmed" ? "Cause confirmed by evidence" : "Hypothesis: confirm before acting"}</PtFlag>}
              </div>
              <p style={pdP}>{pattern.suggestedFix}</p>
            </section>
          )}
          <PdImpact key={pattern.id} pattern={pattern} onOpenPeriod={onOpenPeriod} />
          <PdModels models={pattern.models} />
          <section aria-label="Evidence">
            <h4 style={{ ...pdH, marginBottom: 4 }}>Evidence</h4>
            <div role="tablist" aria-label="Evidence type" style={{ borderBottom: "1px solid var(--border, #e7e5e4)" }}>
              {tabBtn("traces", "Traces", evidence.length)}{tabBtn("code", "Code", code.length)}
            </div>
            <div role="tabpanel" id={uid + "panel-" + tab} aria-labelledby={uid + "tab-" + tab}>
              {tab === "traces" && (evidence.length
                ? <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{evidence.map((e, n) => <PdEvidence key={e.id || n} item={{ id: String(n), ...e }} onOpenTrace={onOpenTrace} />)}</ul>
                : <p style={{ ...pdP, padding: "14px 0 0", fontSize: 12, color: "var(--fg2, #57534e)" }}>No example traces were saved with this pattern.</p>)}
              {tab === "code" && (code.length
                ? <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {code.map((x, n) => {
                      const url = ptSafeHref(x.href), ref = x.file + (x.lines ? ":" + x.lines : "");
                      return (
                        <li key={n} style={{ padding: "10px 0", borderTop: n ? "1px solid var(--divider, #f5f5f4)" : "none" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "var(--fg2, #57534e)" }}><PtIcon name="file" size={13} /></span>
                            {url ? <a href={url} target="_blank" rel="noreferrer noopener" style={{ font: `500 12px ${ptMono}`, color: "var(--fg1, #1c1917)" }}>{ref}</a> : <span style={{ font: `500 12px ${ptMono}` }}>{ref}</span>}
                            {x.revision && <span style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>@ {x.revision}</span>}
                          </div>
                          {x.note && <p style={{ ...pdP, marginTop: 4, fontSize: 12, color: "var(--fg2, #57534e)" }}>{x.note}</p>}
                        </li>
                      );
                    })}
                  </ul>
                : <p style={{ ...pdP, padding: "14px 0 0", fontSize: 12, color: "var(--fg2, #57534e)" }}>No code evidence. Connect a repository to link behaviour to the code that produced it.</p>)}
            </div>
          </section>
          <PdRating key={"r" + pattern.id} rating={pattern.rating} onRate={onRate} readOnly={readOnly} />
        </div>

        <aside aria-label="Properties" style={{ flex: "1 1 240px", minWidth: 0, padding: 16, borderLeft: "1px solid var(--border, #e7e5e4)", background: "var(--bg-subtle, #fafaf9)" }}>
          <h4 style={{ ...pdH, marginBottom: 6 }}>Properties</h4>
          <PdProperty key={"s" + pattern.id + pattern.status} label="Status" value={pattern.status || "open"} readOnly={readOnly} onCommit={onStatusChange}
            options={PT_STATUS_ORDER.map((k) => [k, PT_STATUS[k].label])} render={(v) => <PtStatus value={v} />} />
          <PdProperty key={"v" + pattern.id + pattern.severity} label="Severity" value={pattern.severity} readOnly={readOnly} onCommit={onSeverityChange}
            options={PT_SEVERITY_ORDER.map((k) => [k, PT_SEVERITY[k].label])} render={(v) => <PtSeverity value={v} />} />
          <div style={{ padding: "8px 0", borderTop: "1px solid var(--divider, #f5f5f4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 26 }}>
              <span style={{ font: `400 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>Categories</span>
              {!readOnly && onCategoriesChange && allCats.length > 0 && <button type="button" aria-expanded={editCats} onClick={() => setEditCats((v) => !v)} style={{ ...ptBtn, minHeight: 22, padding: "0 8px", fontSize: 11 }}>{editCats ? "Done" : "Edit"}</button>}
            </div>
            {editCats
              ? <div role="group" aria-label="Categories" style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                  {allCats.map((k) => <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, font: `400 12px ${ptSans}`, cursor: "pointer" }}><input type="checkbox" checked={cats.indexOf(k) !== -1} onChange={() => toggleCat(k)} style={{ margin: 0, accentColor: "var(--fg1, #1c1917)" }} />{k}</label>)}
                </div>
              : <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>{cats.length ? cats.map((k) => <PtFlag key={k}>{k}</PtFlag>) : <span style={{ font: `400 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>None</span>}</div>}
          </div>
          {[["Rule", pattern.rule, false], ["First seen", pattern.firstSeen != null ? ptStamp(ptMs(pattern.firstSeen)) : null, true], ["Last seen", pattern.lastSeen != null ? ptStamp(ptMs(pattern.lastSeen)) : null, true], ["Duplicate of", pattern.duplicateOf, true]]
            .filter((r) => r[1]).map(([label, v, mono]) => (
              <div key={label} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "8px 0", borderTop: "1px solid var(--divider, #f5f5f4)" }}>
                <span style={{ font: `400 12px ${ptSans}`, color: "var(--fg2, #57534e)" }}>{label}</span>
                <span style={{ font: `400 12px ${mono ? ptMono : ptSans}`, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          {pattern.activity && pattern.activity.length > 0 && <>
            <h4 style={{ ...pdH, margin: "16px 0 6px" }}>Activity</h4>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {pattern.activity.map((a, n) => (
                <li key={a.id || n} style={{ padding: "7px 0", borderTop: "1px solid var(--divider, #f5f5f4)" }}>
                  <div style={{ font: `400 12px/1.5 ${ptSans}` }}><span style={{ font: `500 12px ${ptMono}` }}>{a.actor}</span> {a.text}</div>
                  {a.reason && <div style={{ marginTop: 2, font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" }}>Reason: {a.reason}</div>}
                  {a.at != null && <time dateTime={isNaN(ptMs(a.at)) ? undefined : new Date(ptMs(a.at)).toISOString()} style={{ display: "block", marginTop: 2, font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>{ptStamp(ptMs(a.at))}</time>}
                </li>
              ))}
            </ol>
          </>}
        </aside>
      </div>
    </article>
  );
}

/** One recurring problem: what happens, how widespread it is, the evidence behind it, a suggested fix and what to do next. With `loading`, renders a skeleton in its own footprint. */
export function PatternDetail(props) {
  if (props.loading) return <Skeleton.Panel lines={9} style={props.style} />;
  return <PatternDetailBase {...props} />;
}
