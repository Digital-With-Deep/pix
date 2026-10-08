import { BarChart } from "@pix-ui/react";

export default function Example() {
  return (
    <BarChart
      caption="P95 latency"
      hint="Last 7 days"
      summary="avg 412ms"
      series={[{ label: "p95", color: "var(--accent, #10b981)" }]}
      data={[
        { label: "Mon", values: [412] },
        { label: "Tue", values: [398] },
        { label: "Wed", values: [430] },
        { label: "Thu", values: [445] },
        { label: "Fri", values: [402] },
        { label: "Sat", values: [389] },
        { label: "Sun", values: [410] },
      ]}
    />
  );
}
