import { AIResponse } from "@pix-ui/react";

export default function Example() {
  return (
    <AIResponse
      status="error"
      model="gpt-5.2"
      error="The model timed out comparing the treaty wording against the 2025 program after 42s. The bound slip may exceed the context window — try splitting the comparison by section."
      onRetry={() => {}}
    />
  );
}
