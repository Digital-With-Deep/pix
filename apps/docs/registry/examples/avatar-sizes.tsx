import { Avatar } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Avatar name="Jordan Lee" size="xs" tone="neutral" />
      <Avatar name="Jordan Lee" size="sm" tone="accent" />
      <Avatar name="Jordan Lee" size="md" tone="info" />
      <Avatar name="Support agent" size="lg" tone="solid" square />
      <Avatar name="Eval pipeline" size="xl" iconPath="M12 4.5v15m7.5-7.5h-15" tone="warning" square />
    </div>
  );
}
