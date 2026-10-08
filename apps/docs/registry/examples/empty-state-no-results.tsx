import { EmptyState, Button } from "@pix-ui/react";

export default function Example() {
  return (
    <EmptyState
      icon="search"
      tone="neutral"
      title="No runs match these filters"
      body="Try widening the date range or clearing a filter."
      actions={<Button variant="outline">Clear filters</Button>}
    />
  );
}
