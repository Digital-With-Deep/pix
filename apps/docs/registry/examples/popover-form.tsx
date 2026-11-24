import * as React from "react";
import { Button, Popover, TextField } from "@pix-ui/react";

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [threshold, setThreshold] = React.useState("0.95");

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Pass threshold"
      align="end"
      width={260}
      content={
        <form onSubmit={(e) => { e.preventDefault(); setOpen(false); }} style={{ display: "grid", gap: 10 }}>
          <TextField label="Pass threshold" hint="Between 0 and 1." value={threshold} onChange={setThreshold} inputMode="decimal" />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" style={{ font: "600 13px var(--font-sans, system-ui)", padding: "6px 12px", borderRadius: 3, border: 0, background: "var(--zinc-900, #1c1917)", color: "var(--fg-inverse, #fff)", cursor: "pointer" }}>Apply</button>
          </div>
        </form>
      }
    >
      <Button variant="outline" size="sm">Threshold: {threshold}</Button>
    </Popover>
  );
}
