import * as React from "react";
import { Tabs } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("overview");

  return (
    <Tabs
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "findings", label: "Findings" },
        { value: "evidence", label: "Evidence", disabled: true },
        { value: "settings", label: "Settings" },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}
