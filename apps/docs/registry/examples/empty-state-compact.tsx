import { EmptyState } from "@pix-ui/react";

export default function Example() {
  return (
    <div
      style={{
        border: "1px solid var(--border, #e4e4e7)",
        borderRadius: 4,
        background: "var(--surface, #fff)",
      }}
    >
      <EmptyState
        compact
        bordered={false}
        icon="inbox"
        tone="neutral"
        title="No evidence attached"
        body="Entries posted by this user have no supporting document."
        meta="ENTRY-4821"
      />
    </div>
  );
}
