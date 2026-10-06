import { Badge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge tone="neutral">Draft</Badge>
      <Badge tone="accent">Active</Badge>
      <Badge tone="success">Passed</Badge>
      <Badge tone="warning">Needs review</Badge>
      <Badge tone="danger">3 failures</Badge>
      <Badge tone="info">Queued</Badge>
      <Badge tone="outline">Archived</Badge>
    </div>
  );
}
