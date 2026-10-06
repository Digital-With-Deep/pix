import * as React from "react";
import { Tabs } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("overview");

  return (
    <div style={{ maxWidth: 360 }}>
      <Tabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "findings", label: "Findings", count: 3 },
          { value: "evidence", label: "Evidence", dot: true },
          { value: "settings", label: "Settings" },
          { value: "activity", label: "Activity" },
          { value: "billing", label: "Billing" },
          { value: "members", label: "Members" },
        ]}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
