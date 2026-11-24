import * as React from "react";
import { Checkbox } from "@pix-ui/react";

const sources = ["Invoices", "Purchase orders", "Goods receipts"];

export default function Example() {
  const [picked, setPicked] = React.useState<string[]>(["Invoices"]);
  const all = picked.length === sources.length;
  const some = picked.length > 0 && !all;

  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: 12, minWidth: 260 }}>
      <legend style={{ font: "600 13px var(--font-sans, system-ui)", color: "var(--fg1, #1c1917)", marginBottom: 10 }}>Sources to reconcile</legend>
      <Checkbox
        label="All sources"
        checked={all}
        indeterminate={some}
        onChange={() => setPicked(all ? [] : sources)}
      />
      <div style={{ display: "grid", gap: 10, paddingLeft: 26 }}>
        {sources.map((s) => (
          <Checkbox
            key={s}
            label={s}
            checked={picked.includes(s)}
            onChange={(on) => setPicked((p) => (on ? [...p, s] : p.filter((x) => x !== s)))}
          />
        ))}
      </div>
    </fieldset>
  );
}
