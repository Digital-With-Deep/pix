import { Skeleton } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <Skeleton.Metric style={{ width: 180 }} />
      <Skeleton.List rows={3} style={{ width: 220 }} />
    </div>
  );
}
