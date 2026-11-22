import { Badge, Button, Card } from "@pix-ui/react";

export default function Example() {
  return (
    <Card
      title="Nightly evaluation"
      description="Runs the reconciliation suite against the latest model."
      action={<Badge tone="success" dot>Passing</Badge>}
      footer={
        <>
          <Button variant="outline" size="sm">View history</Button>
          <Button variant="filled" size="sm">Run now</Button>
        </>
      }
      style={{ width: "100%", maxWidth: 420 }}
    >
      412 of 420 cases matched the ground truth. The 8 misses are all currency rounding.
    </Card>
  );
}
