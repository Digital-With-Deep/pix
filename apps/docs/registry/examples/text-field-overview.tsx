import { TextField } from "@pix-ui/react";

export default function Example() {
  return (
    <TextField
      label="Workspace name"
      placeholder="Acme finance"
      hint="Shown in the sidebar and on exported reports."
      style={{ width: "100%", maxWidth: 360 }}
    />
  );
}
