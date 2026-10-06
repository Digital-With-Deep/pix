import { Select } from "@pix-ui/react";

export default function Example() {
  return (
    <Select
      label="Assignee"
      placeholder="Choose a reviewer"
      options={[
        { value: "alex", label: "Alex Chen" },
        { value: "priya", label: "Priya Nair" },
        { value: "sam", label: "Sam Ortiz" },
      ]}
    />
  );
}
