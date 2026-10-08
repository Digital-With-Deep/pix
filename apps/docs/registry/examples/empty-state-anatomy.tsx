import { EmptyState, Button } from "@pix-ui/react";

export default function Example() {
  return (
    <EmptyState
      icon="inbox"
      tone="neutral"
      title="No saved searches yet"
      body="Save a search to run it again later without rebuilding the filters."
      meta="0 OF 10 USED"
      actions={<Button variant="filled">Save current search</Button>}
    />
  );
}
