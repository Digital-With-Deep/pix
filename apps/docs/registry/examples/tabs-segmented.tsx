import * as React from "react";
import { Tabs } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("day");

  return (
    <Tabs
      tabs={[
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
      ]}
      value={value}
      onChange={setValue}
      variant="segmented"
      size="sm"
    />
  );
}
