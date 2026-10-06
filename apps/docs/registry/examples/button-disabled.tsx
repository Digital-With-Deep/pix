import { Button } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="filled" disabled>
        Run evaluation
      </Button>
      <Button variant="outline" disabled>
        Cancel
      </Button>
      <Button variant="destructive" disabled>
        Delete run
      </Button>
    </div>
  );
}
