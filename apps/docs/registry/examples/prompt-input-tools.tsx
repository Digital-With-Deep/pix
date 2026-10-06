import { PromptInput } from "@pix-ui/react";

export default function Example() {
  return (
    <PromptInput
      placeholder="Ask about this run…"
      tools={["Replay run", "Search traces", "Explain diff"]}
      activeTools={["Search traces"]}
      hint="Enter to send · tools apply to this message only"
    />
  );
}
