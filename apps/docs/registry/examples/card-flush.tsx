import { Card } from "@pix-ui/react";

const runs = [
  { id: "run_8f2a", model: "gpt-4.1", score: "98.1%" },
  { id: "run_7c19", model: "claude-sonnet", score: "97.6%" },
  { id: "run_6b04", model: "gemini-2.5-pro", score: "95.2%" },
];

export default function Example() {
  return (
    <Card title="Recent runs" description="Newest first." padding="none" style={{ width: "100%", maxWidth: 420 }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {runs.map((r) => (
          <li key={r.id} style={{ display: "flex", gap: 12, padding: "10px 16px", borderTop: "1px solid var(--divider, #f5f5f4)", font: "400 13px var(--font-mono, ui-monospace, monospace)" }}>
            <span style={{ flex: 1 }}>{r.id}</span>
            <span style={{ color: "var(--fg2, #57534e)" }}>{r.model}</span>
            <span>{r.score}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
