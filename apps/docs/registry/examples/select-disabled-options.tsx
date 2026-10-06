import * as React from "react";
import { Select } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("gpt-4o");

  return (
    <Select
      label="Model"
      placeholder="Choose a model"
      value={value}
      onChange={setValue}
      options={[
        { value: "gpt-4o", label: "GPT-4o", description: "Fast, multimodal", meta: "128k" },
        { value: "gpt-4o-mini", label: "GPT-4o mini", description: "Lower cost, lower latency", meta: "128k" },
        { value: "claude-opus", label: "Claude Opus", description: "Requires an enterprise seat", meta: "200k", disabled: true },
        { value: "claude-sonnet", label: "Claude Sonnet", description: "Available on your plan", meta: "200k" },
        { value: "o1-preview", label: "o1-preview", description: "Waitlisted for this workspace", meta: "128k", disabled: true },
      ]}
    />
  );
}
