import * as React from "react";
import props from "../registry/__generated__/props.json";
import { resolveProps } from "./props-resolve.mjs";

const cell: React.CSSProperties = { padding: "8px 12px", borderBottom: "1px solid var(--border, #e4e4e7)", textAlign: "left", verticalAlign: "top", font: "13px var(--font-sans, ui-sans-serif, system-ui)", color: "var(--fg1, #1c1917)" };
const mono: React.CSSProperties = { font: "12px var(--font-mono, ui-monospace, Menlo, monospace)" };

export function PropsTable({ component }: { component: string }) {
  const rows = resolveProps(props as Record<string, any[]>, component);
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["Prop", "Type", "Default", "Description"].map((h) => (
          <th key={h} style={{ ...cell, color: "var(--fg2, #52525b)", fontWeight: 600 }}>{h}</th>
        ))}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td style={cell}><span style={mono}>{r.name}{r.required ? "" : "?"}</span></td>
              <td style={cell}><span style={mono}>{r.type}</span></td>
              <td style={cell}><span style={mono}>{r.default ?? "—"}</span></td>
              <td style={cell}>{r.description ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
