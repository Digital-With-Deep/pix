import { Button } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="primary">Run evaluation</Button>
      <Button variant="filled">Deploy model</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete run</Button>
      <Button variant="ghost">Details</Button>
    </div>
  );
}
