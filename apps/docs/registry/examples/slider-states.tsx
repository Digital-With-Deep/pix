import { Slider } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 22, width: "100%", maxWidth: 360 }}>
      <Slider label="Reviewers per change" defaultValue={2} min={1} max={5} showRange required />
      <Slider label="Parallel runs" defaultValue={9} min={1} max={12} error="Your plan allows up to 8 parallel runs." />
      <Slider label="Retention in days" defaultValue={30} min={7} max={90} disabled hint="Set by the workspace policy." />
    </div>
  );
}
