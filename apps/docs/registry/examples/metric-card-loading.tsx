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
      <MetricCard loading label="Runs" value={0} />
      <MetricCard loading label="Pass rate" value={0} />
      <MetricCard loading label="Open items" value={0} />
    </div>
  );
}
