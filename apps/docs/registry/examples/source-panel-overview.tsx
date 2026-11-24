import { SourcePanel } from "@pix-ui/react";

export default function Example() {
  return (
    <SourcePanel
      style={{ width: "100%", maxWidth: 560 }}
      sources={[
        {
          id: "terms",
          title: "Larkspur supplier terms, section 4",
          type: "PDF",
          state: "verified",
          snippet: "Overdue balances accrue a fee of 1.5% per month from the due date.",
          href: "https://example.com/terms.pdf",
        },
        {
          id: "wiki",
          title: "Accounts team wiki: fee waivers",
          type: "Wiki",
          state: "unverified",
          snippet: "We usually waive the first late fee each year as a goodwill gesture.",
        },
        {
          id: "ledger",
          title: "Ledger export, March",
          type: "CSV",
          state: "contradicted",
          snippet: "INV-20417 · late fee charged 2.0%",
          note: "The ledger charged 2.0%, not the 1.5% the answer states.",
        },
      ]}
    />
  );
}
