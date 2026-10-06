import { Button } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="filled" loading>
        Run evaluation
      </Button>
      <Button variant="outline" loading loadingLabel="Saving…">
        Save draft
      </Button>
      <Button variant="destructive" loading loadingLabel="Deleting…">
        Delete run
      </Button>
    </div>
  );
}
