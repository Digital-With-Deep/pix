import * as React from "react";
import { InlineCitation, SourcePanel, type Source } from "@pix-ui/react";

const sources: Source[] = [
  {
    id: "terms",
    title: "Larkspur supplier terms, section 4",
    type: "PDF",
    state: "verified",
    snippet: "Overdue balances accrue a fee of 1.5% per month from the due date.",
  },
  {
    id: "ledger",
    title: "Ledger export, March",
    type: "CSV",
    state: "contradicted",
    snippet: "INV-20417 · late fee charged 2.0%",
    note: "The ledger charged 2.0%, not the 1.5% the answer states.",
  },
];

export default function Example() {
  const [active, setActive] = React.useState<string | null>("terms");

  return (
    <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, font: "400 14px/1.7 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg1, #18181b)" }}>
        Invoice INV-20417 should carry a 1.5% late fee
        <InlineCitation index={1} source={sources[0]} active={active === "terms"} onSelect={setActive} />
        , but the ledger shows a different rate
        <InlineCitation index={2} source={sources[1]} active={active === "ledger"} onSelect={setActive} />
        .
      </p>
      <SourcePanel sources={sources} activeId={active} onSelect={(id) => setActive(id)} />
    </div>
  );
}
