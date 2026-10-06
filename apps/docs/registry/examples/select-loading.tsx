import { Select } from "@pix-ui/react";

export default function Example() {
  return (
    <Select
      loading
      label="Assignee"
      options={[{ value: "alex", label: "Alex Chen" }]}
    />
  );
}
