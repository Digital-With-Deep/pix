import { Textarea } from "@pix-ui/react";

export default function Example() {
  return (
    <Textarea
      label="System prompt"
      placeholder="You are a careful reconciliation assistant."
      hint="Sent before every message in this workspace."
      maxLength={500}
      rows={4}
      style={{ width: "100%", maxWidth: 420 }}
    />
  );
}
