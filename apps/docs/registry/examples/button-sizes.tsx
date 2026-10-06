import { Button } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Button variant="filled" size="sm">Run evaluation</Button>
      <Button variant="filled" size="md">Run evaluation</Button>
      <Button variant="filled" size="lg">Run evaluation</Button>
    </div>
  );
}
