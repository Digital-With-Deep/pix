import { Textarea } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 18, width: "100%", maxWidth: 420 }}>
      <Textarea label="Reviewer note" required rows={3} error="Add a note before you reject the result." />
      <Textarea label="Locked prompt" rows={3} disabled defaultValue="Answer only from the attached ledger." resize="none" />
    </div>
  );
}
