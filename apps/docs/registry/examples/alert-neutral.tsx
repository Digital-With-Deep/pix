import { Alert } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="neutral"
      icon="info"
      title="27 of 1,042 transactions fall outside the sampling window"
      body="These rows post after the period cutoff and are excluded from this run's sample, not from the ledger."
      citation="Sample frame v3 — rows excluded where posting date > 2026-06-30"
    />
  );
}
