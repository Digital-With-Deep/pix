import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";

const spSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const spMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const SP_STATES = {
  verified: { label: "Verified", ink: "var(--truth, #047857)", bg: "var(--truth-bg, #ecfdf5)", icon: "M8 12.5l2.5 2.5L16 9.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  unverified: { label: "Unverified", ink: "var(--fg2, #52525b)", bg: "var(--bg-muted, #f4f4f5)", icon: "M12 16h.01M9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1.2-1.5 2.2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  contradicted: { label: "Contradicted", ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)", icon: "M15 9l-6 6m0-6l6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
};
const SP_LINK = "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5";
const SP_CSS = ".pix-sp button:focus-visible,.pix-sp a:focus-visible{outline:2px solid var(--accent, #10b981);outline-offset:2px}";
function spEnsureStyle() {
  if (typeof document === "undefined" || document.getElementById("__pix_source_panel")) return;
  const s = document.createElement("style"); s.id = "__pix_source_panel"; s.textContent = SP_CSS; document.head.appendChild(s);
}
function SpIcon({ path, size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, display: "block" }}><path d={path} /></svg>;
}
const spCap = { font: `600 10px ${spSans}`, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg2, #52525b)" };

function SourcePanelBase({ sources = [], title = "Sources", activeId, defaultActiveId, onSelect, emptyLabel = "No sources were cited for this answer.", style }) {
  const controlled = activeId !== undefined;
  const [inner, setInner] = React.useState(defaultActiveId);
  const current = controlled ? activeId : inner;
  const rows = React.useRef({});
  const mounted = React.useRef(false);
  React.useEffect(spEnsureStyle, []);
  React.useEffect(() => {
    // Bring a newly selected source into view, but never scroll the page on first render.
    if (!mounted.current) { mounted.current = true; return; }
    const el = current != null && rows.current[current];
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "nearest" });
  }, [current]);
  const select = (s) => { if (!controlled) setInner(s.id); if (onSelect) onSelect(s.id, s); };

  const counts = { verified: 0, contradicted: 0, unverified: 0 };
  sources.forEach((s) => { counts[SP_STATES[s.state] ? s.state : "unverified"]++; });
  const summary = ["verified", "contradicted", "unverified"].filter((k) => counts[k]).map((k) => counts[k] + " " + SP_STATES[k].label.toLowerCase()).join(" · ");

  return (
    <section className="pix-sp" aria-label={typeof title === "string" ? title : "Sources"} style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, overflow: "hidden", fontFamily: spSans, color: "var(--fg1, #18181b)", ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <span style={spCap}>{title}</span>
        <span style={{ font: `400 11px ${spMono}`, color: "var(--fg2, #52525b)" }}>{sources.length}</span>
        {summary && <span style={{ marginLeft: "auto", font: `400 11px ${spSans}`, color: "var(--fg2, #52525b)" }}>{summary}</span>}
      </div>
      {sources.length === 0 ? (
        <div style={{ padding: "18px 14px", font: `400 12px ${spSans}`, color: "var(--fg2, #52525b)" }}>{emptyLabel}</div>
      ) : (
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {sources.map((s, i) => {
            const st = SP_STATES[s.state] || SP_STATES.unverified;
            const on = current != null && String(current) === String(s.id);
            return (
              <li key={s.id != null ? s.id : i} ref={(el) => { rows.current[s.id] = el; }} aria-current={on ? "true" : undefined}
                style={{ display: "flex", gap: 10, padding: "11px 14px", borderTop: i ? "1px solid var(--divider, #f4f4f5)" : "none",
                  background: on ? "var(--bg-muted, #f4f4f5)" : "transparent", boxShadow: on ? "inset 2px 0 0 var(--fg1, #18181b)" : "none", transition: "background 160ms" }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, marginTop: 1, borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  font: `600 11px ${spMono}`, background: on ? "var(--zinc-900, #18181b)" : "var(--zinc-100, #f4f4f5)", color: on ? "var(--fg-inverse, #fff)" : "var(--fg1, #18181b)" }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <button type="button" onClick={() => select(s)} aria-pressed={on}
                      style={{ flex: 1, minWidth: 0, padding: 0, border: 0, background: "transparent", textAlign: "left", cursor: "pointer", font: `600 13px/1.4 ${spSans}`, color: "var(--fg1, #18181b)" }}>
                      {s.title || "Untitled source"}
                    </button>
                    {s.href && (
                      <a href={s.href} target="_blank" rel="noreferrer" aria-label={"Open source " + (i + 1) + (s.title ? ": " + s.title : "") + " (opens in a new tab)"}
                        style={{ flexShrink: 0, display: "inline-flex", padding: 3, marginTop: -1, borderRadius: 3, color: "var(--fg2, #52525b)" }}>
                        <SpIcon path={SP_LINK} size={13} />
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 6px", borderRadius: 2, background: st.bg, color: st.ink, font: `600 11px/1.5 ${spSans}` }}>
                      <SpIcon path={st.icon} size={11} />{st.label}
                    </span>
                    {s.type && <span style={{ font: `400 11px ${spMono}`, color: "var(--fg2, #52525b)" }}>{s.type}</span>}
                  </div>
                  {s.snippet && (
                    <blockquote style={{ margin: "7px 0 0", padding: "0 0 0 10px", borderLeft: "2px solid var(--border-strong, #d4d4d8)", font: `400 12px/1.55 ${spSans}`, color: "var(--fg2, #52525b)" }}>{s.snippet}</blockquote>
                  )}
                  {s.note && <div style={{ marginTop: 6, font: `400 12px/1.5 ${spSans}`, color: s.state === "contradicted" ? "var(--claim, #b91c1c)" : "var(--fg2, #52525b)" }}>{s.note}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** The sources an answer rests on, each with its verification state in words. With `loading`, renders a skeleton in its own footprint. */
export function SourcePanel(props) {
  if (props.loading) return <Skeleton.List rows={(props.sources || []).length || 3} glyph twoLine style={props.style} />;
  return <SourcePanelBase {...props} />;
}
