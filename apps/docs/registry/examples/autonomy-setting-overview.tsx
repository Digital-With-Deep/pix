import * as React from "react";
import { AutonomySetting, type AutonomyLevel } from "@pix-ui/react";

export default function Example() {
  const [level, setLevel] = React.useState<AutonomyLevel>("confirm");

  return (
    <AutonomySetting
      task="late fee reconciliation"
      value={level}
      onChange={setLevel}
      style={{ width: "100%", maxWidth: 620 }}
    />
  );
}
