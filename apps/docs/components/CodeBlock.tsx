"use client";
import * as React from "react";

// shadcn-style code block: a thin header with the language/filename and a copy
// button, over Shiki-highlighted code (flips light/dark via CSS). Falls back to
// plain text if no highlighted HTML was generated.
export function CodeBlock({ code, highlighted, lang = "tsx", filename, embedded }: { code: string; highlighted?: string; lang?: string; filename?: string; embedded?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <div className="pix-code" style={{ borderRadius: embedded ? 0 : 8, border: embedded ? 0 : "1px solid var(--border, #e4e4e7)", overflow: "hidden", background: "var(--surface-alt, #fafaf9)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 0 14px", height: 40, borderBottom: "1px solid var(--border, #e4e4e7)" }}>
        <span style={{ font: "500 12px var(--font-mono, ui-monospace, Menlo, monospace)", color: "var(--fg3, #78716c)" }}>{filename ?? lang}</span>
        <button type="button" onClick={copy} aria-label="Copy code"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "500 12px var(--font-sans, ui-sans-serif, system-ui)", padding: "5px 9px", borderRadius: 6, border: "1px solid transparent", background: "transparent", color: "var(--fg2, #52525b)", cursor: "pointer" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {copied
              ? <path d="M20 6L9 17l-5-5" />
              : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>}
          </svg>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {highlighted
        ? <div className="pix-code-body" dangerouslySetInnerHTML={{ __html: highlighted }} />
        : <pre className="pix-code-body" style={{ margin: 0, padding: 16, overflowX: "auto", font: "13px var(--font-mono, ui-monospace, Menlo, monospace)", color: "var(--fg1, #1c1917)" }}><code>{code}</code></pre>}
    </div>
  );
}
