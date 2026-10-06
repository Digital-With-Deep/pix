import { Badge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <Badge size="sm" tone="info">sm status pill</Badge>
      <Badge size="md" tone="outline">
        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>run_8f21c3</span>
      </Badge>
    </div>
  );
}
