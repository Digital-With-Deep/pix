import { PromptInput } from "@pix-ui/react";

export default function Example() {
  return (
    <PromptInput
      placeholder="Ask about this reconciliation"
      models={[
        { id: "fast", name: "Fast", meta: "Lower latency" },
        { id: "deep", name: "Deep", meta: "Higher accuracy", badge: "Default" },
      ]}
      defaultModel="deep"
      tools={["Web search", "Deep research"]}
    />
  );
}
