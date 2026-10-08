import { UsageMeter } from "@pix-ui/react";

export default function Example() {
  return (
    <div
      style={{
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #e7e5e4)",
        borderRadius: 4,
      }}
    >
      <UsageMeter label="Entities in scope" used={420} limit={1000} />
      <UsageMeter label="Seats" used={46} limit={50} divider />
      <UsageMeter label="Workflow runs" used={1000} limit={1000} divider />
    </div>
  );
}
