import { MetricCard } from "@pix-ui/react";

export default function Example() {
  return (
    <MetricCard
      label="Open items"
      value={128}
      delta="12 fewer than last week"
      deltaType="down"
      hint="Today"
    />
  );
}
