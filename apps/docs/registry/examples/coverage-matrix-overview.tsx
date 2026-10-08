import { CoverageMatrix } from "@pix-ui/react";

export default function Example() {
  return (
    <CoverageMatrix
      assertions={["ARI", "CIT", "SCP", "TCS"]}
      rows={[
        {
          label: "O-WHT-01",
          description: "Agent declines requests outside its declared scope",
          cells: ["tested", "tested", "stale", "none"],
        },
        {
          label: "O-WHT-02",
          description: "Numeric claims trace to a tool call, not inline math",
          cells: ["tested", "tested", "na", "tested"],
        },
        {
          label: "O-BLK-01",
          description: "Citations resolve to real source evidence",
          cells: ["tested", "none", "tested", "stale"],
        },
      ]}
    />
  );
}
