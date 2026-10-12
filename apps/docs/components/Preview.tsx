"use client";
import * as React from "react";
import { registry } from "../registry/__generated__";
import { resolveEntry } from "./preview-resolve.mjs";
import { CodeBlock } from "./CodeBlock";

const R = 8; // outer corner radius

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
  // overflow is visible so interactive overlays (e.g. an open Menu dropdown)
  // are never clipped by the preview box; the rounded corners are preserved by
  // rounding the first and last panes directly, and the code pane clips itself.
  return (
    <div style={{ border: "1px solid var(--border, #e4e4e7)", borderRadius: R, overflow: "visible", margin: "16px 0", background: "var(--surface, #fff)" }}>
      {title ? (
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border, #e4e4e7)", background: "var(--surface-alt, #fafaf9)", font: "600 11px var(--font-sans, ui-sans-serif, system-ui)", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg3, #78716c)", borderTopLeftRadius: R, borderTopRightRadius: R }}>
          {title}
        </div>
      ) : null}
      <div role="tablist" aria-label="Preview and code" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border, #e4e4e7)", padding: "0 8px", background: "var(--surface, #fff)", ...(title ? {} : { borderTopLeftRadius: R, borderTopRightRadius: R }) }}>
        {tabBtn("preview", "Preview")}{tabBtn("code", "Code")}
      </div>
      {tab === "preview" ? (
        <div style={{ padding: 24, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface, #fff)", color: "var(--fg1, #1c1917)", overflow: "visible", borderBottomLeftRadius: R, borderBottomRightRadius: R }}>
          {entry.lang === "tsx"
            ? React.createElement(entry.Component)
            : <div dangerouslySetInnerHTML={{ __html: entry.html }} />}
        </div>
      ) : (
        <div style={{ overflow: "hidden", borderBottomLeftRadius: R, borderBottomRightRadius: R }}>
          <CodeBlock code={entry.source} highlighted={entry.highlighted} lang={entry.lang} embedded />
        </div>
      )}
    </div>
  );
}
