import * as React from "react";
import { Slider } from "@pix-ui/react";

export default function Example() {
  const [budget, setBudget] = React.useState(120);
  return (
    <Slider
      label="Daily spend limit"
      value={budget}
      onChange={setBudget}
      min={0}
      max={500}
      step={10}
      showRange
      formatValue={(v) => `$${v}`}
      hint="The agent pauses and asks once it reaches this amount."
      style={{ width: "100%", maxWidth: 360 }}
    />
  );
}
