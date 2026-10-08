import { MultiSelect } from "@pix-ui/react";

export default function Example() {
  return (
    <MultiSelect
      loading
      label="Tags"
      options={[{ value: "bug", label: "Bug" }]}
    />
  );
}
