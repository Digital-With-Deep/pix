import { Alert } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="truth"
      icon="check"
      title="All 212 sampled disbursements trace to an approved purchase order"
      body="Every sampled payment matches a PO approved before the invoice date, with no exceptions."
      citation="Population: AP disbursements, Jan–Jun 2026"
    />
  );
}
