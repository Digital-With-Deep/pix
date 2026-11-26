// Type-level checks for Slider, DateField and RadioGroup's error (run by `pnpm typecheck`).
import * as React from "react";
import { DateField, RadioGroup, Slider } from "../src/index";

export const InputsDemo = () => {
  const [budget, setBudget] = React.useState(40);
  const [due, setDue] = React.useState("2026-12-04");
  return (
    <>
      <Slider label="Monthly budget" value={budget} onChange={(v: number) => setBudget(v)} min={0} max={200} step={5} showRange
        formatValue={(v) => `$${v}`} hint="Per agent" error={budget > 150 ? "Over the team limit" : undefined} name="budget" />
      <Slider aria-label="Temperature" defaultValue={0.4} min={0} max={1} step="any" showValue={false} loading={false} />
      <DateField label="Due" value={due} onChange={(v: string) => setDue(v)} min="2026-12-01" max="2027-01-31" required />
      <DateField type="time" label="Starts at" defaultValue="09:30" step={900} />
      <DateField type="datetime" label="Run at" defaultValue="2026-12-04T14:30:00Z" hint="Shown in your local time" />
      <RadioGroup label="Plan" options={[{ value: "a", label: "A" }]} value="a" error="Choose a plan" hint="Billed monthly" />
    </>
  );
};
