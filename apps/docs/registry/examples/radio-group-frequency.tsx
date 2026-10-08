import * as React from "react";
import { RadioGroup } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("daily");

  return (
    <RadioGroup
      label="Notification frequency"
      value={value}
      onChange={setValue}
      options={[
        { value: "realtime", label: "Real-time", description: "Notify as soon as it happens." },
        { value: "daily", label: "Daily digest", description: "One summary each morning." },
        { value: "off", label: "Off", description: "Don't notify me." },
      ]}
    />
  );
}
