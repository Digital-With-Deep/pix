import { InlineCitation } from "@pix-ui/react";

export default function Example() {
  return (
    <p style={{ maxWidth: 520, margin: 0, font: "400 14px/1.7 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg1, #18181b)" }}>
      The standard late fee is 1.5% a month
      <InlineCitation
        index={1}
        title="Larkspur supplier terms, section 4"
        type="Policy"
        state="verified"
        snippet="Overdue balances accrue a fee of 1.5% per month from the due date."
      />
      , and it is waived for the first late payment in a year
      <InlineCitation
        index={2}
        title="Accounts team wiki: fee waivers"
        type="Wiki"
        state="unverified"
        snippet="We usually waive the first late fee each year as a goodwill gesture."
      />
      .
    </p>
  );
}
