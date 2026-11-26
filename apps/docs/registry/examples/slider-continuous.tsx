import * as React from "react";
import { Slider } from "@pix-ui/react";

export default function Example() {
  const [threshold, setThreshold] = React.useState(0.75);
  return (
    <Slider
      label="Confidence threshold"
      value={threshold}
      onChange={setThreshold}
      min={0}
      max={1}
      step={0.05}
      showRange
      formatValue={(v) => `${Math.round(v * 100)}%`}
      hint="Answers below this confidence go to a reviewer."
      style={{ width: "100%", maxWidth: 360 }}
    />
  );
}
