import { Grid } from "@pix-ui/react";

const cards = [
  { label: "Total runs", value: "1,204" },
  { label: "Pass rate", value: "98.2%" },
  { label: "Avg latency", value: "842 ms" },
  { label: "Active evals", value: "6" },
];

export default function Example() {
  return (
    <Grid min={160} gap={12}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            padding: 16,
            borderRadius: 8,
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #e4e4e7)",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--fg3, #71717a)" }}>{card.label}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--fg1, #18181b)", marginTop: 4 }}>
            {card.value}
          </div>
        </div>
      ))}
    </Grid>
  );
}
