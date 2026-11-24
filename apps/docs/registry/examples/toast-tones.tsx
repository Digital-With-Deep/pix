import { Toast } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 360 }}>
      <Toast title="Export started" description="We will email the CSV when it is ready." onDismiss={() => {}} />
      <Toast tone="truth" title="Verified" description="All 420 amounts match the ledger." onDismiss={() => {}} />
      <Toast tone="claim" title="Claim not verified" description="The model cited an invoice that does not exist." onDismiss={() => {}} />
      <Toast tone="warn" title="Budget at 90%" description="Runs pause at $250.00." action={{ label: "Raise budget" }} onDismiss={() => {}} />
    </div>
  );
}
