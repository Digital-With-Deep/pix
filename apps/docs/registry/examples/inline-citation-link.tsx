import { InlineCitation } from "@pix-ui/react";

export default function Example() {
  return (
    <p style={{ margin: 0, font: "400 14px/1.7 var(--font-sans, ui-sans-serif, system-ui, sans-serif)", color: "var(--fg1, #18181b)" }}>
      Refunds post within five business days
      <InlineCitation
        index={3}
        title="Refund policy"
        snippet="Approved refunds are posted to the original payment method within five business days."
        href="https://example.com/refunds"
      />
      .
    </p>
  );
}
