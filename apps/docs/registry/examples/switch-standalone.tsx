import * as React from "react";
import { Switch } from "@pix-ui/react";

export default function Example() {
  const [checked, setChecked] = React.useState(true);

  return (
    <Switch
      checked={checked}
      onChange={setChecked}
      aria-label="Enable autosave"
    />
  );
}
