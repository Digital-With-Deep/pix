"use client";
import * as React from "react";

export function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div style={{ position: "relative", background: "var(--surface-alt, #f4f4f5)", borderRadius: 6, border: "1px solid var(--border, #e4e4e7)" }}>
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
        aria-label="Copy code"
        style={{ position: "absolute", top: 8, right: 8, font: "500 12px var(--font-sans, ui-sans-serif, system-ui)", padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border, #e4e4e7)", background: "var(--surface, #fff)", color: "var(--fg2, #52525b)", cursor: "pointer" }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre style={{ margin: 0, padding: "16px", overflowX: "auto", font: `13px var(--font-mono, ui-monospace, Menlo, monospace)`, color: "var(--fg1, #1c1917)" }}>
        <code data-lang={lang}>{code}</code>
      </pre>
    </div>
  );
}
