import { Checkbox } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 380 }}>
      <Checkbox
        label="Share traces with the evaluation team"
        description="Prompts and tool calls are visible to reviewers. Customer data stays masked."
        defaultChecked
      />
      <Checkbox
        label="I have reviewed the policy for this workspace"
        required
        error="Confirm the policy before you start the run."
      />
    </div>
  );
}
