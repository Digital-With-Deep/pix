import { Checkbox } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ width: 320 }}>
      <Checkbox loading label="Share traces" description="Prompts and tool calls are visible to reviewers." />
    </div>
  );
}
