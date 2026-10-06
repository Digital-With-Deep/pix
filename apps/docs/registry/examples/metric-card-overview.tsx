import { MetricCard } from "@pix-ui/react";

export default function Example() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
      }}
    >
      <MetricCard label="Runs" value={1842} hint="Last 24h" />
      <MetricCard
        label="Pass rate"
        value="94.2%"
        valueTone="success"
        delta="+1.8pt vs last week"
        deltaType="up"
      />
      <MetricCard
        label="Open items"
        value={128}
        delta="12 fewer than last week"
        deltaType="down"
        hint="Today"
      />
      <MetricCard label="p95 latency" value="412ms" hint="Last hour" />
    </div>
  );
}
