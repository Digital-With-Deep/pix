import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";

const ahSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const ahMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const AH_STATUS = {
  done: { label: "done", ink: "var(--truth, #047857)", bg: "var(--truth-bg, #ecfdf5)" },
  undone: { label: "undone", ink: "var(--fg2, #52525b)", bg: "var(--bg-muted, #f4f4f5)" },
  failed: { label: "failed", ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)" },
  pending: { label: "pending", ink: "var(--fault, #b45309)", bg: "var(--fault-bg, #fffbeb)" },
};
const AH_STATUS_ORDER = ["done", "pending", "failed", "undone"];
const AH_UNDO = "M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3";
const AH_LOCK = "M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z";
const AH_CSS = ".pix-ah button:focus-visible,.pix-ah select:focus-visible{outline:2px solid var(--accent, #10b981);outline-offset:2px}";
function ahEnsureStyle() {
  if (typeof document === "undefined" || document.getElementById("__pix_action_history")) return;
  const s = document.createElement("style"); s.id = "__pix_action_history"; s.textContent = AH_CSS; document.head.appendChild(s);
}
const ahCap = { font: `600 10px ${ahSans}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg2, #52525b)" };
const ahBtn = { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3, background: "var(--surface, #fff)", font: `500 11px ${ahSans}`, color: "var(--fg1, #18181b)", cursor: "pointer", whiteSpace: "nowrap" };
const ahGrid = "112px 150px minmax(200px, 1fr) 84px 150px";

function ahMs(v) { if (v == null) return NaN; return typeof v === "number" ? v : v instanceof Date ? v.getTime() : Date.parse(v); }
function ahFmtTime(ms) {
  if (isNaN(ms)) return "—";
  const d = new Date(ms), z = (n) => String(n).padStart(2, "0");
  return z(d.getUTCMonth() + 1) + "-" + z(d.getUTCDate()) + " " + z(d.getUTCHours()) + ":" + z(d.getUTCMinutes()) + ":" + z(d.getUTCSeconds());
}
/** "1h 05m", "4m 12s" or "38s". */
function formatUndoRemaining(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  if (h) return h + "h " + String(m).padStart(2, "0") + "m";
  if (m) return m + "m " + String(r).padStart(2, "0") + "s";
  return r + "s";
}
function AhIcon({ path, size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, display: "block" }}><path d={path} /></svg>;
}
function AhStatus({ value }) {
  const t = AH_STATUS[value] || AH_STATUS.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "1px 6px", borderRadius: 2, background: t.bg, color: t.ink, font: `600 10px ${ahMono}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor" }} />{t.label}
    </span>
  );
}

function ActionHistoryBase({
  actions = [], onUndo, now, title = "Action history", defaultAgent = "all", defaultStatus = "all",
  undoLabel = "Undo", emptyLabel = "No actions match these filters.", style,
}) {
  const fixed = now !== undefined;
  const [tick, setTick] = React.useState(() => (fixed ? ahMs(now) : Date.now()));
  const [agent, setAgent] = React.useState(defaultAgent);
  const [status, setStatus] = React.useState(defaultStatus);
  React.useEffect(ahEnsureStyle, []);
  const clock = fixed ? ahMs(now) : tick;
  const anyOpen = actions.some((a) => a.status === "done" && ahMs(a.undoUntil) > clock);
  React.useEffect(() => {
    if (fixed) return undefined;
    setTick(Date.now());
    if (!anyOpen) return undefined;
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [fixed, anyOpen]);

  const agents = React.useMemo(() => Array.from(new Set(actions.map((a) => a.agent).filter(Boolean))).sort(), [actions]);
  const rows = React.useMemo(() => actions
    .filter((a) => (agent === "all" || a.agent === agent) && (status === "all" || a.status === status))
    .slice().sort((a, b) => ahMs(b.at) - ahMs(a.at)), [actions, agent, status]);
  const statusCount = (k) => actions.filter((a) => (agent === "all" || a.agent === agent) && a.status === k).length;
  const filtered = agent !== "all" || status !== "all";

  return (
    <section className="pix-ah" aria-label={typeof title === "string" ? title : "Action history"} style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: ahSans, color: "var(--fg1, #18181b)", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <span style={ahCap}>{title}</span>
        <span style={{ font: `400 11px ${ahMono}`, color: "var(--fg2, #52525b)" }}>{rows.length} of {actions.length}</span>
        <span style={{ flex: 1 }} />
        <select value={agent} onChange={(e) => setAgent(e.target.value)} aria-label="Filter by agent" style={{ ...ahBtn, height: 28, padding: "0 8px", fontFamily: ahMono }}>
          <option value="all">All agents</option>
          {agents.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" style={{ ...ahBtn, height: 28, padding: "0 8px" }}>
          <option value="all">All statuses</option>
          {AH_STATUS_ORDER.map((k) => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)} ({statusCount(k)})</option>)}
        </select>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 700 }}>
          <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: ahGrid, alignItems: "center", height: 28, padding: "0 12px", background: "var(--zinc-50, #fafafa)", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
            {["Time (UTC)", "Agent", "Action", "Status", "Undo"].map((h, i) => <span key={h} style={{ ...ahCap, textAlign: i === 4 ? "right" : "left" }}>{h}</span>)}
          </div>
          {rows.length === 0 ? (
            <div style={{ padding: "28px 20px", textAlign: "center" }}>
              <div style={{ font: `600 13px ${ahSans}` }}>{actions.length ? emptyLabel : "No actions yet."}</div>
              {filtered && actions.length > 0 && <button type="button" onClick={() => { setAgent("all"); setStatus("all"); }} style={{ ...ahBtn, marginTop: 10 }}>Clear filters</button>}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rows.map((a) => {
                const until = ahMs(a.undoUntil);
                const open = a.status === "done" && until > clock;
                const locked = a.status === "done" && !isNaN(until) && until <= clock;
                const what = a.action + (a.target ? " " + a.target : "");
                return (
                  <li key={a.id} style={{ display: "grid", gridTemplateColumns: ahGrid, alignItems: "start", padding: "9px 12px", borderBottom: "1px solid var(--divider, #f4f4f5)",
                    boxShadow: a.status === "failed" ? "inset 2px 0 0 var(--claim, #b91c1c)" : a.status === "pending" ? "inset 2px 0 0 var(--amber-500, #f59e0b)" : "none" }}>
                    <span style={{ font: `400 11px/20px ${ahMono}`, color: "var(--fg2, #52525b)", whiteSpace: "nowrap" }}><time dateTime={isNaN(ahMs(a.at)) ? undefined : new Date(ahMs(a.at)).toISOString()}>{ahFmtTime(ahMs(a.at))}</time></span>
                    <span style={{ minWidth: 0, paddingRight: 10, font: `400 12px/20px ${ahMono}`, color: "var(--fg2, #52525b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.agent}>{a.agent}</span>
                    <span style={{ minWidth: 0, paddingRight: 10 }}>
                      <span style={{ display: "block", font: `400 13px/20px ${ahSans}` }}>
                        {a.action}{a.target && <> <span style={{ font: `500 12px ${ahMono}` }}>{a.target}</span></>}
                      </span>
                      {a.detail && <span style={{ display: "block", marginTop: 1, font: `400 12px/1.5 ${ahSans}`, color: "var(--fg2, #52525b)" }}>{a.detail}</span>}
                    </span>
                    <span style={{ lineHeight: "20px" }}><AhStatus value={a.status} /></span>
                    <span style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, minHeight: 20 }}>
                      {open && <>
                        <span style={{ font: `400 11px ${ahMono}`, color: "var(--fg2, #52525b)", whiteSpace: "nowrap" }}>{formatUndoRemaining(until - clock)} left</span>
                        <button type="button" onClick={() => onUndo && onUndo(a.id)} aria-label={undoLabel + ": " + what} style={{ ...ahBtn, padding: "2px 8px" }}><AhIcon path={AH_UNDO} size={11} />{undoLabel}</button>
                      </>}
                      {locked && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: `500 11px ${ahSans}`, color: "var(--fg2, #52525b)" }} title="The undo window has closed"><AhIcon path={AH_LOCK} size={11} />Locked</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/** What agents did, newest first, with Undo while each action's undo window is open. With `loading`, renders a skeleton in its own footprint. */
export function ActionHistory(props) {
  if (props.loading) return <Skeleton.Table columns={5} rows={(props.actions || []).length || 5} style={props.style} />;
  return <ActionHistoryBase {...props} />;
}
