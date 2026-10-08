"use client";
import * as React from "react";
import { registry } from "../registry/__generated__";
import { resolveEntry } from "./preview-resolve.mjs";
import { CodeBlock } from "./CodeBlock";

export function Preview({ name, title }: { name: string; title?: string }) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const entry = resolveEntry(registry, name); // throws → build fails on a bad name
  const tabBtn = (id: "preview" | "code", label: string) => (
    <button type="button" role="tab" onClick={() => setTab(id)}
      aria-selected={tab === id}
      style={{ font: "500 13px var(--font-sans, ui-sans-serif, system-ui)", padding: "6px 10px", border: 0, borderBottom: `2px solid ${tab === id ? "var(--fg1, #1c1917)" : "transparent"}`, background: "transparent", color: tab === id ? "var(--fg1, #1c1917)" : "var(--fg2, #52525b)", cursor: "pointer" }}>
      {label}
    </button>
  );
  return (
    <div style={{ border: "1px solid var(--border, #e4e4e7)", borderRadius: 8, overflow: "hidden", margin: "16px 0" }}>
      {title ? (
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border, #e4e4e7)", background: "var(--surface-alt, #fafaf9)", font: "600 11px var(--font-sans, ui-sans-serif, system-ui)", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg3, #78716c)" }}>
          {title}
        </div>
      ) : null}
      <div role="tablist" aria-label="Preview and code" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border, #e4e4e7)", padding: "0 8px", background: "var(--surface, #fff)" }}>
        {tabBtn("preview", "Preview")}{tabBtn("code", "Code")}
      </div>
      {tab === "preview" ? (
        <div style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface, #fff)", color: "var(--fg1, #1c1917)" }}>
          {entry.lang === "tsx"
            ? React.createElement(entry.Component)
            : <div dangerouslySetInnerHTML={{ __html: entry.html }} />}
        </div>
      ) : (
        <CodeBlock code={entry.source} highlighted={entry.highlighted} lang={entry.lang} embedded />
      )}
    </div>
  );
}
