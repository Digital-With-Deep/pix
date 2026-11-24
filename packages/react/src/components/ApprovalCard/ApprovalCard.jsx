import * as React from "react";
import { safeHref } from "../Markdown/safeHref.js";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState, useEffect, useId } = React;

const aSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const aMono = "var(--font-mono, ui-monospace, Menlo, monospace)";
const RISK = {
  low: { label: "Low risk", fg: "var(--fg2, #52525b)", bg: "var(--zinc-100, #f4f4f5)", bar: "var(--zinc-300, #d4d4d8)" },
  medium: { label: "Medium risk", fg: "var(--blue-800, #1e40af)", bg: "var(--blue-50, #eff6ff)", bar: "var(--blue-500, #3b82f6)" },
  high: { label: "High risk", fg: "var(--amber-800, #92400e)", bg: "var(--amber-50, #fffbeb)", bar: "var(--fault, #d97706)" },
  critical: { label: "Critical risk", fg: "var(--red-700, #b91c1c)", bg: "var(--claim-bg, #fef2f2)", bar: "var(--claim, #b91c1c)" },
};
const RESOLVED = {
  approved: { label: "Approved", fg: "var(--truth, #047857)", bg: "var(--truth-bg, #ecfdf5)" },
  rejected: { label: "Rejected", fg: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)" },
  expired: { label: "Expired", fg: "var(--fg3, #71717a)", bg: "var(--zinc-100, #f4f4f5)" },
};
const P = {
  check: "M4.5 12.75l6 6 9-13.5",
  x: "M6 18L18 6M6 6l12 12",
  pencil: "M16.86 4.49l1.69-1.69a1.88 1.88 0 112.65 2.65L10.58 16.07a4.5 4.5 0 01-1.9 1.13L6 18l.8-2.69a4.5 4.5 0 011.13-1.9l8.93-8.92z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z",
  undo: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3",
  lock: "M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m-.75 0h10.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
};
function Ico({ d, size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><path d={d} /></svg>;
}
function fmtLeft(ms) {
  if (ms <= 0) return "0s";
  const s = Math.ceil(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${s}s`;
}
function show(v) {
  if (v === null || v === undefined || v === "") return "—";
  return typeof v === "object" ? JSON.stringify(v) : String(v);
}
const btn = (variant) => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 4, font: `500 12px ${aSans}`, cursor: "pointer" };
  if (variant === "approve") return { ...base, border: "1px solid var(--emerald-700, #047857)", background: "var(--emerald-700, #047857)", color: "var(--fg-inverse, #fff)" };
  if (variant === "reject") return { ...base, border: "1px solid var(--red-200, #fecaca)", background: "var(--surface, #fff)", color: "var(--red-700, #b91c1c)" };
  return { ...base, border: "1px solid var(--border, #e4e4e7)", background: "var(--surface, #fff)", color: "var(--fg2, #52525b)" };
};

function ApprovalCardBase({
  title, action, agent, target, reason, changes = [], risk = "medium", reversible, evidence = [],
  expiresAt, status = "pending", decidedBy, decidedAt, rejectReason: decidedReason,
  onApprove, onReject, onEdit, requireRejectReason = false, approveLabel = "Approve", style,
}) {
  const uid = useId();
  const [now, setNow] = useState(null);
  const [mode, setMode] = useState("view"); // view | edit | reject
  const [draft, setDraft] = useState({});
  const [why, setWhy] = useState("");
  useEffect(() => {
    if (!expiresAt || status !== "pending") return undefined;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt, status]);

  const expMs = expiresAt ? new Date(expiresAt).getTime() : null;
  const lapsed = status === "pending" && expMs !== null && now !== null && now >= expMs;
  const state = lapsed ? "expired" : status;
  const pending = state === "pending";
  const r = RISK[risk] || RISK.medium;

  const shell = { position: "relative", background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: aSans, ...style };
  const label = { font: `600 10px ${aSans}`, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg3, #71717a)" };
  const titleId = `${uid}-title`;

  return (
    <section aria-labelledby={titleId} style={shell}>
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: pending ? r.bar : "transparent" }} />
      <header style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px 10px 16px" }}>
        <span style={{ width: 24, height: 24, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--zinc-900, #18181b)", color: "var(--fg-inverse, #fff)", flexShrink: 0 }}><Ico d={P.shield} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div id={titleId} style={{ font: `600 13px/1.4 ${aSans}`, color: "var(--fg1, #18181b)" }}>{title || action || "Approval needed"}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", marginTop: 2, font: `400 11px ${aSans}`, color: "var(--fg3, #71717a)" }}>
            {agent && <span>Proposed by <span style={{ fontFamily: aMono, color: "var(--fg2, #52525b)" }}>{agent}</span></span>}
            {target && <span>Target <span style={{ fontFamily: aMono, color: "var(--fg2, #52525b)" }}>{target}</span></span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          {pending
            ? <span style={{ padding: "2px 7px", borderRadius: 3, background: r.bg, color: r.fg, font: `600 11px ${aSans}` }}>{r.label}</span>
            : <span role="status" style={{ padding: "2px 7px", borderRadius: 3, background: RESOLVED[state]?.bg, color: RESOLVED[state]?.fg, font: `600 11px ${aSans}` }}>{RESOLVED[state]?.label || state}</span>}
          {reversible !== undefined && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: `400 11px ${aSans}`, color: reversible ? "var(--fg3, #71717a)" : "var(--amber-800, #92400e)" }}>
              <Ico d={reversible ? P.undo : P.lock} size={11} />{reversible ? "Can be undone" : "Cannot be undone"}
            </span>
          )}
        </div>
      </header>

      {action && title && <p style={{ margin: 0, padding: "0 16px 10px", font: `400 13px/1.55 ${aSans}`, color: "var(--fg2, #52525b)" }}>{action}</p>}

      {reason && (
        <div style={{ margin: "0 16px 10px", padding: "8px 10px", borderRadius: 3, background: "var(--zinc-50, #fafafa)", border: "1px solid var(--divider, #f4f4f5)", font: `400 12px/1.55 ${aSans}`, color: "var(--fg2, #52525b)" }}>
          <span style={{ fontWeight: 600, color: "var(--fg1, #18181b)" }}>Why: </span>{reason}
        </div>
      )}

      {changes.length > 0 && (
        <div style={{ padding: "0 16px 10px" }}>
          <div style={{ ...label, marginBottom: 6 }}>What will change</div>
          <table style={{ width: "100%", borderCollapse: "collapse", font: `400 12px ${aSans}` }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--fg3, #71717a)" }}>
                <th scope="col" style={{ fontWeight: 500, padding: "4px 8px 4px 0", width: "30%" }}>Field</th>
                <th scope="col" style={{ fontWeight: 500, padding: "4px 8px" }}>Now</th>
                <th scope="col" style={{ fontWeight: 500, padding: "4px 0 4px 8px" }}>After</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c, i) => {
                const key = c.key || c.field;
                const first = mode === "edit" && changes.findIndex(x => x.editable !== false) === i;
                const editable = mode === "edit" && c.editable !== false;
                const after = draft[key] !== undefined ? draft[key] : c.after;
                return (
                  <tr key={key || i} style={{ borderTop: "1px solid var(--divider, #f4f4f5)" }}>
                    <th scope="row" style={{ fontWeight: 500, textAlign: "left", padding: "6px 8px 6px 0", color: "var(--fg2, #52525b)" }}>{c.field}</th>
                    <td style={{ padding: "6px 8px", fontFamily: aMono, color: "var(--fg3, #71717a)", textDecoration: c.before !== undefined && c.before !== null ? "line-through" : "none" }}>{show(c.before)}</td>
                    <td style={{ padding: "6px 0 6px 8px", fontFamily: aMono, color: "var(--fg1, #18181b)" }}>
                      {editable
                        ? <input autoFocus={first} aria-label={`New value for ${c.field}`} value={after === undefined || after === null ? "" : String(after)} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                            style={{ width: "100%", boxSizing: "border-box", height: 26, padding: "0 6px", border: "1px solid var(--border-strong, #d4d4d8)", borderRadius: 3, background: "var(--surface, #fff)", color: "var(--fg1, #18181b)", font: `400 12px ${aMono}` }} />
                        : show(after)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {evidence.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "0 16px 10px" }}>
          <span style={{ ...label, marginRight: 2 }}>Evidence</span>
          {evidence.map((e, i) => {
            const lbl = typeof e === "string" ? e : e.label;
            const href = typeof e === "object" ? safeHref(e.href) || undefined : undefined;
            const Tag = href ? "a" : "span";
            return <Tag key={lbl + i} href={href} style={{ padding: "2px 7px", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3, background: "var(--zinc-50, #fafafa)", font: `500 11px ${aMono}`, color: "var(--fg2, #52525b)", textDecoration: "none" }}>{lbl}</Tag>;
          })}
        </div>
      )}

      <footer style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid var(--divider, #f4f4f5)", background: "var(--surface-alt, #fafafa)" }}>
        {pending && mode === "reject" && (
          <div style={{ flexBasis: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
            <label htmlFor={`${uid}-why`} style={{ font: `500 12px ${aSans}`, color: "var(--fg2, #52525b)" }}>Reason for rejecting{requireRejectReason ? "" : " (optional)"}</label>
            <textarea id={`${uid}-why`} rows={2} value={why} onChange={e => setWhy(e.target.value)}
              style={{ resize: "vertical", padding: "6px 8px", border: "1px solid var(--border-strong, #d4d4d8)", borderRadius: 3, background: "var(--surface, #fff)", color: "var(--fg1, #18181b)", font: `400 12px/1.5 ${aSans}` }} />
          </div>
        )}
        {pending ? (
          <>
            {mode === "view" && (
              <>
                <button type="button" style={btn("approve")} onClick={() => onApprove && onApprove()}><Ico d={P.check} />{approveLabel}</button>
                {onEdit && changes.some(c => c.editable !== false) && <button type="button" style={btn()} onClick={() => setMode("edit")}><Ico d={P.pencil} />Edit</button>}
                <button type="button" style={btn("reject")} onClick={() => setMode("reject")}><Ico d={P.x} />Reject</button>
              </>
            )}
            {mode === "edit" && (
              <>
                <button type="button" style={btn("approve")} onClick={() => { onEdit && onEdit(draft); setMode("view"); }}><Ico d={P.check} />Approve with edits</button>
                <button type="button" style={btn()} onClick={() => { setDraft({}); setMode("view"); }}>Cancel</button>
              </>
            )}
            {mode === "reject" && (
              <>
                <button type="button" style={{ ...btn("reject"), opacity: requireRejectReason && !why.trim() ? 0.5 : 1 }} disabled={requireRejectReason && !why.trim()} onClick={() => { onReject && onReject(why.trim() || undefined); setMode("view"); }}><Ico d={P.x} />Confirm reject</button>
                <button type="button" style={btn()} onClick={() => setMode("view")}>Cancel</button>
              </>
            )}
            <span style={{ flex: 1 }} />
            {expMs !== null && now !== null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: `500 11px ${aMono}`, color: expMs - now < 60000 ? "var(--amber-800, #92400e)" : "var(--fg3, #71717a)" }}>
                <Ico d={P.clock} size={11} />Expires in {fmtLeft(expMs - now)}
              </span>
            )}
          </>
        ) : (
          <span style={{ font: `400 12px ${aSans}`, color: "var(--fg2, #52525b)" }}>
            {state === "expired" ? "This request lapsed before anyone decided. Nothing was changed." : (
              <>
                {RESOLVED[state]?.label || state}{decidedBy && <> by <span style={{ fontWeight: 600, color: "var(--fg1, #18181b)" }}>{decidedBy}</span></>}{decidedAt && <> · <span style={{ fontFamily: aMono }}>{decidedAt}</span></>}
                {decidedReason && <> · “{decidedReason}”</>}
              </>
            )}
          </span>
        )}
      </footer>
    </section>
  );
}

/** A proposed agent action waiting on a person: what changes, the risk, whether it can be undone, and Approve, Edit or Reject. With `loading`, renders a skeleton in its own footprint. */
export function ApprovalCard(props) {
  if (props.loading) return <Skeleton.Panel lines={4} style={props.style} />;
  return <ApprovalCardBase {...props} />;
}
