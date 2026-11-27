import { DateField } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 18, width: "100%", maxWidth: 360 }}>
      <DateField label="Contract start" required defaultValue="2026-12-01" />
      <DateField label="Contract end" defaultValue="2026-11-20" min="2026-12-01" error="Pick a date after the contract start." />
      <DateField label="Created" defaultValue="2026-11-02" disabled />
    </div>
  );
}
