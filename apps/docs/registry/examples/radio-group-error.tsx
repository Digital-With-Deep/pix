import * as React from "react";
import { RadioGroup } from "@pix-ui/react";

export default function Example() {
  const [cycle, setCycle] = React.useState<string | null>(null);
  return (
    <RadioGroup
      label="Billing cycle"
      options={[
        { value: "monthly", label: "Monthly", description: "Pay each month, cancel any time." },
        { value: "yearly", label: "Yearly", description: "Two months free, billed once a year." },
      ]}
      value={cycle}
      onChange={(v) => setCycle(v)}
      error={cycle ? undefined : "Choose a billing cycle to continue."}
      style={{ width: "100%", maxWidth: 360 }}
    />
  );
}
