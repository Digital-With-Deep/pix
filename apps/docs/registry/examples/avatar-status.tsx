import { Avatar } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Avatar name="Priya Shah" status="online" />
      <Avatar name="Marcus Webb" status="away" />
      <Avatar name="Review bot" status="busy" square tone="accent" />
      <Avatar name="Jordan Lee" ring tone="accent" title="Active reviewer" />
    </div>
  );
}
