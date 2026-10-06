import { Button } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="filled">Run evaluation</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Details</Button>
    </div>
  );
}
