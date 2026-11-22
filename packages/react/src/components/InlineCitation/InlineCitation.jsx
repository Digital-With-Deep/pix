import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";

const icSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const icMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const IC_STATES = {
  verified: { label: "Verified", ink: "var(--truth, #047857)", bg: "var(--truth-bg, #ecfdf5)" },
  unverified: { label: "Unverified", ink: "var(--fg2, #52525b)", bg: "var(--bg-muted, #f4f4f5)" },
  contradicted: { label: "Contradicted", ink: "var(--claim, #b91c1c)", bg: "var(--claim-bg, #fef2f2)" },
};
const IC_CSS = ".pix-ic:focus-visible{outline:2px solid var(--accent, #10b981);outline-offset:1px}";
function icEnsureStyle() {
  if (typeof document === "undefined" || document.getElementById("__pix_inline_citation")) return;
  const s = document.createElement("style"); s.id = "__pix_inline_citation"; s.textContent = IC_CSS; document.head.appendChild(s);
}
const icHidden = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };

function InlineCitationBase({ index = 1, id, title, snippet, href, type, state, source, active = false, onSelect, style }) {
  const src = source || {};
  const t = title != null ? title : src.title;
  const sn = snippet != null ? snippet : src.snippet;
  const link = href != null ? href : src.href;
  const kind = type != null ? type : src.type;
  const st = IC_STATES[state != null ? state : src.state];
  const key = id != null ? id : src.id != null ? src.id : String(index);
  const [open, setOpen] = React.useState(false);
  const tid = "pix-ic-" + React.useId().replace(/[^\w-]/g, "");
  React.useEffect(icEnsureStyle, []);

  const name = "Source " + index + (t ? ": " + t : "");
  const common = {
    className: "pix-ic", "aria-label": name, "aria-describedby": t || sn ? tid : undefined,
    onFocus: () => setOpen(true), onBlur: () => setOpen(false),
    onKeyDown: (e) => { if (e.key === "Escape") setOpen(false); },
    onClick: () => { setOpen(false); if (onSelect) onSelect(key); },
    style: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 16, height: 16, padding: "0 4px", margin: "0 1px", boxSizing: "border-box",
      borderRadius: 3, border: 0, verticalAlign: "super", textDecoration: "none", cursor: "pointer", font: `600 10px/1 ${icMono}`,
      background: active ? "var(--zinc-900, #18181b)" : "var(--zinc-100, #f4f4f5)", color: active ? "var(--fg-inverse, #fff)" : "var(--fg1, #18181b)" },
  };
  const trigger = link
    ? <a href={link} {...common} aria-current={active ? "true" : undefined}>{index}</a>
    : <button type="button" {...common} aria-pressed={onSelect ? active : undefined}>{index}</button>;

  return (
    <span onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: "relative", display: "inline", ...style }}>
      {trigger}
      {(t || sn) && (
        <span id={tid} role="tooltip" style={open ? { position: "absolute", zIndex: 30, bottom: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)", display: "block",
          width: "max-content", maxWidth: 300, padding: "10px 12px", borderRadius: 4, background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)",
          boxShadow: "var(--shadow-lg, 0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.08))", textAlign: "left", whiteSpace: "normal", fontStyle: "normal", textIndent: 0 } : icHidden}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ font: `600 10px ${icMono}`, color: "var(--fg2, #52525b)" }}>[{index}]</span>
            {kind && <span style={{ font: `500 11px ${icSans}`, color: "var(--fg2, #52525b)" }}>{kind}</span>}
            {st && <span style={{ padding: "1px 6px", borderRadius: 2, background: st.bg, color: st.ink, font: `600 10px ${icSans}` }}>{st.label}</span>}
          </span>
          {t && <span style={{ display: "block", marginTop: 4, font: `600 12px/1.45 ${icSans}`, color: "var(--fg1, #18181b)" }}>{t}</span>}
          {sn && <span style={{ display: "block", marginTop: 4, font: `400 12px/1.5 ${icSans}`, color: "var(--fg2, #52525b)" }}>{sn}</span>}
        </span>
      )}
    </span>
  );
}

/** A numbered source marker inside answer text. Shows the source on hover or focus. With `loading`, renders a skeleton in its own footprint. */
export function InlineCitation(props) {
  if (props.loading) return <Skeleton width={16} height={14} label="Loading citation" style={{ display: "inline-block", verticalAlign: "super", ...props.style }} />;
  return <InlineCitationBase {...props} />;
}
