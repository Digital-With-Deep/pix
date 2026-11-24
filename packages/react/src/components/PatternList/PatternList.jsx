import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import {
  ptSans, ptMono, ptCap, ptBtn, ptBox, ptInput, PT_SEVERITY, PT_SEVERITY_ORDER, PT_STATUS, PT_STATUS_ORDER,
  PtIcon, PtSeverity, PtStatus, PtFlag, ptEnsureStyle, ptMs, ptAgo, ptNum, ptPct, ptImpactCount,
} from "../Patterns/shared.jsx";

const PL_GRID = "86px minmax(260px, 1fr) 132px 84px 92px 116px";
const PL_GROUPS = [["none", "No grouping"], ["severity", "Severity"], ["status", "Status"], ["category", "Category"], ["rule", "Rule"]];

function plSeverityRank(p) { const t = PT_SEVERITY[p.severity]; return t ? t.rank : 2; } // unrated counts as low
function plSort(list, sort, unit) {
  const impact = (p) => { const c = ptImpactCount(p, unit); return c ? c.n : -1; };
  const last = (p) => { const m = ptMs(p.lastSeen); return isNaN(m) ? 0 : m; };
  return list.slice().sort((a, b) =>
    sort === "impact" ? impact(b) - impact(a) || last(b) - last(a)
      : sort === "lastSeen" ? last(b) - last(a)
        : plSeverityRank(a) - plSeverityRank(b) || impact(b) - impact(a) || last(b) - last(a));
}
function plGroups(list, groupBy) {
  if (groupBy === "none") return [{ key: "all", label: null, items: list }];
  const map = new Map();
  const add = (k, p) => { if (!map.has(k)) map.set(k, []); map.get(k).push(p); };
  list.forEach((p) => {
    if (groupBy === "category") { const c = p.categories && p.categories.length ? p.categories : ["Uncategorized"]; c.forEach((k) => add(k, p)); }
    else if (groupBy === "severity") add(PT_SEVERITY[p.severity] ? p.severity : "unrated", p);
    else if (groupBy === "status") add(p.status || "open", p);
    else add(p.rule || "No rule", p);
  });
  const order = groupBy === "severity" ? PT_SEVERITY_ORDER.concat("unrated") : groupBy === "status" ? PT_STATUS_ORDER : Array.from(map.keys()).sort();
  const label = (k) => groupBy === "severity" ? (PT_SEVERITY[k] ? PT_SEVERITY[k].label : "Unrated") : groupBy === "status" ? (PT_STATUS[k] ? PT_STATUS[k].label : k) : k;
  return order.filter((k) => map.has(k)).map((k) => ({ key: k, label: label(k), items: map.get(k) }));
}

/** A row of thin bars: how often the pattern matched in each recent period. */
function PlTrend({ values, name }) {
  if (!values || !values.length) return <span style={{ font: `400 11px ${ptMono}`, color: "var(--fg3, #78716c)" }}>—</span>;
  const max = Math.max.apply(null, values.concat(1)), w = 3, gap = 2, h = 20;
  return (
    <svg width={values.length * (w + gap) - gap} height={h} role="img" aria-label={"Matches per period for " + name + ": " + values.join(", ")} style={{ display: "block" }}>
      {values.map((v, i) => { const bh = Math.max(1, Math.round((v / max) * h)); return <rect key={i} x={i * (w + gap)} y={h - bh} width={w} height={bh} fill={i === values.length - 1 ? "var(--fg1, #1c1917)" : "var(--border-strong, #d6d3d1)"} />; })}
    </svg>
  );
}

function PatternListBase({
  patterns = [], selectedId, onSelect, title = "Patterns", now, impactUnit = "traces",
  defaultQuery = "", defaultSeverity = "all", defaultStatus = "all", defaultGroupBy = "none", defaultHideClosed = true,
  sort = "severity", emptyLabel = "No patterns match these filters.", style,
}) {
  const [query, setQuery] = React.useState(defaultQuery);
  const [severity, setSeverity] = React.useState(defaultSeverity);
  const [status, setStatus] = React.useState(defaultStatus);
  const [groupBy, setGroupBy] = React.useState(defaultGroupBy);
  const [hideClosed, setHideClosed] = React.useState(defaultHideClosed);
  React.useEffect(ptEnsureStyle, []);

  const clock = React.useMemo(() => {
    const n = ptMs(now); if (!isNaN(n)) return n;
    return patterns.reduce((m, p) => { const t = ptMs(p.lastSeen); return !isNaN(t) && t > m ? t : m; }, 0);
  }, [now, patterns]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    // Grouping by status, or filtering to a status, always shows every status.
    const hide = hideClosed && status === "all" && groupBy !== "status";
    return plSort(patterns.filter((p) => {
      const st = p.status || "open";
      if (hide && (st === "closed" || st === "duplicate")) return false;
      if (status !== "all" && st !== status) return false;
      if (severity !== "all" && (PT_SEVERITY[p.severity] ? p.severity : "unrated") !== severity) return false;
      if (q && (p.name + " " + (p.summary || "") + " " + (p.categories || []).join(" ") + " " + (p.rule || "") + " " + p.id).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }), sort, impactUnit);
  }, [patterns, query, severity, status, groupBy, hideClosed, sort, impactUnit]);
  const groups = React.useMemo(() => plGroups(rows, groupBy), [rows, groupBy]);
  const filtered = query.trim() !== "" || severity !== "all" || status !== "all";
  const hiddenClosed = hideClosed && status === "all" && groupBy !== "status" ? patterns.filter((p) => p.status === "closed" || p.status === "duplicate").length : 0;
  const sel = { ...ptBtn, height: 28, padding: "0 8px" };

  return (
    <section className="pix-pt" aria-label={typeof title === "string" ? title : "Patterns"} style={{ ...ptBox, overflow: "hidden", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
        <span style={ptCap}>{title}</span>
        <span aria-live="polite" style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>{rows.length} of {patterns.length}</span>
        <span style={{ flex: 1 }} />
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center", flex: "1 1 180px", maxWidth: 260 }}>
          <span style={{ position: "absolute", left: 8, color: "var(--fg3, #78716c)" }}><PtIcon name="search" size={12} /></span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patterns" aria-label="Search patterns" style={{ ...ptInput, minHeight: 28, height: 28, padding: "0 8px 0 26px", fontSize: 12 }} />
        </span>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} aria-label="Filter by severity" style={sel}>
          <option value="all">All severities</option>
          {PT_SEVERITY_ORDER.map((k) => <option key={k} value={k}>{PT_SEVERITY[k].label}</option>)}
          <option value="unrated">Unrated</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" style={sel}>
          <option value="all">All statuses</option>
          {PT_STATUS_ORDER.map((k) => <option key={k} value={k}>{PT_STATUS[k].label}</option>)}
        </select>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} aria-label="Group by" style={sel}>
          {PL_GROUPS.map(([k, l]) => <option key={k} value={k}>{k === "none" ? l : "Group: " + l}</option>)}
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `500 12px ${ptSans}`, color: "var(--fg2, #57534e)", cursor: "pointer", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} style={{ margin: 0, accentColor: "var(--fg1, #1c1917)" }} />Hide closed
        </label>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 820 }}>
          <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: PL_GRID, alignItems: "center", height: 28, padding: "0 12px", background: "var(--bg-subtle, #fafaf9)", borderBottom: "1px solid var(--border, #e7e5e4)" }}>
            {["Severity", "Pattern", "Impacted " + impactUnit, "Trend", "Last seen", "Status"].map((h) => <span key={h} style={ptCap}>{h}</span>)}
          </div>
          {rows.length === 0 ? (
            <div style={{ padding: "28px 20px", textAlign: "center" }}>
              <div style={{ font: `600 13px ${ptSans}` }}>{patterns.length ? emptyLabel : "No patterns yet."}</div>
              {!patterns.length && <div style={{ marginTop: 4, font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" }}>Patterns appear here when a discovery run finishes.</div>}
              {filtered && patterns.length > 0 && <button type="button" onClick={() => { setQuery(""); setSeverity("all"); setStatus("all"); }} style={{ ...ptBtn, marginTop: 10 }}>Clear filters</button>}
            </div>
          ) : groups.map((g) => (
            <div key={g.key} role={g.label ? "group" : undefined} aria-label={g.label || undefined}>
              {g.label && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--bg-subtle, #fafaf9)", borderBottom: "1px solid var(--divider, #f5f5f4)" }}>
                  <span style={{ font: `600 12px ${ptSans}` }}>{g.label}</span>
                  <span style={{ font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>{g.items.length}</span>
                </div>
              )}
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {g.items.map((p) => {
                  const on = p.id === selectedId, c = ptImpactCount(p, impactUnit), i = p.impact || {};
                  const share = c && c.unit === impactUnit && i.share != null ? i.share : null;
                  return (
                    <li key={g.key + ":" + p.id} style={{ borderBottom: "1px solid var(--divider, #f5f5f4)" }}>
                      <button type="button" className="pix-pt-row" onClick={() => onSelect && onSelect(p.id)} aria-current={on ? "true" : undefined}
                        style={{ display: "grid", gridTemplateColumns: PL_GRID, alignItems: "start", width: "100%", padding: "10px 12px", border: 0, textAlign: "left", cursor: onSelect ? "pointer" : "default", font: "inherit", color: "inherit",
                          background: on ? "var(--bg-muted, #f5f5f4)" : undefined, boxShadow: on ? "inset 2px 0 0 var(--fg1, #1c1917)" : "none" }}>
                        <span style={{ lineHeight: "20px" }}><PtSeverity value={p.severity} /></span>
                        <span style={{ minWidth: 0, paddingRight: 14 }}>
                          <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                            <span style={{ font: `600 13px/20px ${ptSans}` }}>{p.name}</span>
                            {p.reopened && <PtFlag>Reopened</PtFlag>}
                            {p.severityRaised && <PtFlag>Severity raised</PtFlag>}
                          </span>
                          {p.summary && <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 1, font: `400 12px/1.5 ${ptSans}`, color: "var(--fg2, #57534e)" }}>{p.summary}</span>}
                          {((p.categories && p.categories.length > 0) || p.rule) && (
                            <span style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, font: `400 11px ${ptMono}`, color: "var(--fg2, #57534e)" }}>
                              {(p.categories || []).map((cat) => <span key={cat}>{cat}</span>)}
                              {p.rule && <span>rule: {p.rule}</span>}
                            </span>
                          )}
                        </span>
                        <span style={{ font: `400 12px/20px ${ptMono}` }}>
                          {c ? <>
                            <span style={{ fontWeight: 600 }}>{i.estimated ? "~" : ""}{ptNum(c.n)}</span>
                            {c.unit !== impactUnit && <span style={{ color: "var(--fg2, #57534e)" }}> {c.unit}</span>}
                            {share != null && <span style={{ color: "var(--fg2, #57534e)" }}> · {ptPct(share)}</span>}
                          </> : <span style={{ color: "var(--fg2, #57534e)" }}>Not measured</span>}
                        </span>
                        <span style={{ paddingTop: 1 }}><PlTrend values={p.trend} name={p.name} /></span>
                        <span style={{ font: `400 11px/20px ${ptMono}`, color: "var(--fg2, #57534e)", whiteSpace: "nowrap" }}>{ptAgo(ptMs(p.lastSeen), clock)}</span>
                        <span style={{ lineHeight: "20px" }}><PtStatus value={p.status || "open"} /></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {hiddenClosed > 0 && (
        <div style={{ padding: "7px 12px", font: `400 11px ${ptSans}`, color: "var(--fg2, #57534e)", borderTop: "1px solid var(--border, #e7e5e4)", background: "var(--bg-subtle, #fafaf9)" }}>
          {hiddenClosed} closed or duplicate {hiddenClosed === 1 ? "pattern is" : "patterns are"} hidden.
        </div>
      )}
    </section>
  );
}

/** Recurring problems found in traces, ranked for triage by severity, impact and recency. With `loading`, renders a skeleton in its own footprint. */
export function PatternList(props) {
  if (props.loading) return <Skeleton.Table columns={6} rows={(props.patterns || []).length || 5} style={props.style} />;
  return <PatternListBase {...props} />;
}
