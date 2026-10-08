import * as React from "react";
import { RadioGroup } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("standard");

  return (
    <RadioGroup
      label="Export format"
      value={value}
      onChange={setValue}
      options={[
        { value: "standard", label: "Standard", description: "CSV, available on every plan." },
        { value: "pivot", label: "Pivot table", description: "Grouped by vendor and month." },
        { value: "api", label: "Direct API sync", description: "Requires the Team plan.", disabled: true },
      ]}
    />
  );
}
