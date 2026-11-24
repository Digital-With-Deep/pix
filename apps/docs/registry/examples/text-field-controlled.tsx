import * as React from "react";
import { TextField } from "@pix-ui/react";

export default function Example() {
  const [budget, setBudget] = React.useState("250.00");
  const invalid = budget !== "" && !/^\d+(\.\d{1,2})?$/.test(budget);

  return (
    <TextField
      label="Monthly budget (USD)"
      value={budget}
      onChange={setBudget}
      inputMode="decimal"
      hint="Runs pause when spend reaches this amount."
      error={invalid ? "Use a number with up to two decimals, like 250.00." : undefined}
      inputStyle={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
      style={{ width: "100%", maxWidth: 360 }}
    />
  );
}
