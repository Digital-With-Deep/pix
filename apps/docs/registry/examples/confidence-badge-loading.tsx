import { ConfidenceBadge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <ConfidenceBadge loading />
      <ConfidenceBadge loading size="standalone" />
    </div>
  );
}
