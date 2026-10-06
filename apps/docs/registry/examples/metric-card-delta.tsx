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
      <MetricCard
        label="Pass rate"
        value="94.2%"
        valueTone="success"
        delta="+1.8pt vs last week"
        deltaType="up"
      />
      <MetricCard
        label="Error rate"
        value="2.1%"
        valueTone="danger"
        delta="+0.6pt vs last week"
        deltaType="up"
      />
      <MetricCard
        label="Runs"
        value={1842}
        delta="No change vs last week"
        deltaType="neutral"
      />
    </div>
  );
}
