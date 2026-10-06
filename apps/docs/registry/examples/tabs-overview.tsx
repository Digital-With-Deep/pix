import { Tabs } from "@pix-ui/react";

export default function Example() {
  return (
    <Tabs
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "activity", label: "Activity" },
        { value: "settings", label: "Settings" },
      ]}
      value="overview"
    />
  );
}
