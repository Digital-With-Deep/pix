import { Sidebar } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ height: 340, display: "flex", border: "1px solid var(--border, #e4e4e7)", borderRadius: 10, overflow: "hidden", background: "var(--surface, #fff)" }}>
      <Sidebar loading items={[]} style={{ borderRight: "none" }} />
    </div>
  );
}
