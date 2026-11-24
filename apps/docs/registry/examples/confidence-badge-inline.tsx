import { ConfidenceBadge } from "@pix-ui/react";

export default function Example() {
  return (
    <p style={{ maxWidth: 520, margin: 0, font: "400 14px/1.7 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg1, #18181b)" }}>
      The March late fee for INV-20417 is $312.40{" "}
      <ConfidenceBadge state="review" score={0.62} scope="checked against 3 sources" reason="The ledger rate differs from the contract rate." />
    </p>
  );
}
