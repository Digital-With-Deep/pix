import { Checkbox } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled and checked" disabled defaultChecked />
    </div>
  );
}
