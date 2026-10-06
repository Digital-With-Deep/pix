import { Badge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge tone="accent" onRemove={() => {}}>Reviewer: Priya Nair</Badge>
      <Badge tone="neutral" onRemove={() => {}}>Tag: urgent</Badge>
      <Badge tone="info" size="md" onRemove={() => {}}>Environment: staging</Badge>
    </div>
  );
}
