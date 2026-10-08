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
      <UsageMeter loading label="Seats" used={0} />
    </div>
  );
}
