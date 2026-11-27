import { DateField } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 18, width: "100%", maxWidth: 360 }}>
      <DateField label="Start date" defaultValue="2026-12-07" />
      <DateField type="time" label="Daily run at" defaultValue="06:30" step={900} hint="Every 15 minutes, in your local time." />
      <DateField type="datetime" label="Maintenance window" defaultValue="2026-12-12T22:00" />
    </div>
  );
}
