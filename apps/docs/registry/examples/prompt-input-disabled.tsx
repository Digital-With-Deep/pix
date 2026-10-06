import { PromptInput } from "@pix-ui/react";

export default function Example() {
  return (
    <PromptInput
      placeholder="Ask a follow-up…"
      disabled
      hint="Composer is read-only until the current run finishes"
    />
  );
}
