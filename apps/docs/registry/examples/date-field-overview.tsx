import * as React from "react";
import { DateField } from "@pix-ui/react";

export default function Example() {
  const [due, setDue] = React.useState("2026-12-04");
  return (
    <DateField
      label="Review due"
      value={due}
      onChange={setDue}
      min="2026-12-01"
      hint="Reviewers get a reminder the day before."
      style={{ width: "100%", maxWidth: 360 }}
    />
  );
}
