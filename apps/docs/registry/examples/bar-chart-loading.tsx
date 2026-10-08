import { BarChart } from "@pix-ui/react";

export default function Example() {
  return (
    <BarChart
      loading
      caption="Eval runs"
      hint="Trailing 6 months"
      series={[
        { label: "Executed", color: "var(--zinc-300, #d6d3d1)" },
        { label: "Passed", color: "var(--accent, #10b981)" },
      ]}
      data={[
        { label: "Apr", values: [205, 160] },
        { label: "May", values: [210, 158] },
        { label: "Jun", values: [195, 150] },
        { label: "Jul", values: [220, 165] },
        { label: "Aug", values: [208, 148] },
        { label: "Sep", values: [202, 127] },
      ]}
    />
  );
}
