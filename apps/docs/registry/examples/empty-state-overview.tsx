import { EmptyState, Button } from "@pix-ui/react";

export default function Example() {
  return (
    <EmptyState
      icon="plus"
      tone="accent"
      title="No model providers yet"
      body="Connect a provider to start routing requests through PIX."
      actions={<Button variant="filled">Connect a provider</Button>}
    />
  );
}
