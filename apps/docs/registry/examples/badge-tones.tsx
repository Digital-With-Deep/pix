import { Badge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge tone="neutral">Draft</Badge>
      <Badge tone="accent">Active</Badge>
      <Badge tone="success" dot>Passed</Badge>
      <Badge tone="danger">Failed</Badge>
    </div>
  );
}
