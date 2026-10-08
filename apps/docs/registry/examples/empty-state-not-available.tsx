import { EmptyState, Button } from "@pix-ui/react";

export default function Example() {
  return (
    <EmptyState
      icon="lock"
      tone="fault"
      title="Not available on your plan"
      body="Audit log retention is a Standard plan feature."
      actions={<Button variant="outline">See plans</Button>}
    />
  );
}
