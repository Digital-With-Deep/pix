import * as React from "react";
import { MultiSelect } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState(["bug", "p1"]);

  return (
    <MultiSelect
      variant="dropdown"
      label="Tags"
      placeholder="Add tags"
      value={value}
      onChange={setValue}
      max={5}
      maxChips={2}
      options={[
        { value: "bug", label: "Bug" },
        { value: "p1", label: "P1" },
        { value: "regression", label: "Regression" },
        { value: "needs-repro", label: "Needs repro" },
        { value: "docs", label: "Docs" },
        { value: "flaky-test", label: "Flaky test" },
      ]}
    />
  );
}
