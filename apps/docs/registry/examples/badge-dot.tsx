import { Badge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge tone="success" dot>Online</Badge>
      <Badge tone="warning" dot>Degraded</Badge>
      <Badge tone="danger" dot>Offline</Badge>
      <Badge tone="neutral" dot>Idle</Badge>
    </div>
  );
}
