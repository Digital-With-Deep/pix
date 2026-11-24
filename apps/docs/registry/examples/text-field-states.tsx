import { TextField } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 18, width: "100%", maxWidth: 360 }}>
      <TextField label="Run name" required defaultValue="Nightly evaluation" maxLength={40} />
      <TextField label="Webhook URL" type="url" defaultValue="hooks.example" error="Enter a full URL that starts with https://." />
      <TextField label="Model" defaultValue="gpt-4.1" disabled hint="Set by the workspace policy." />
    </div>
  );
}
