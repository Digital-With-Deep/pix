import { Alert, AlertAction } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="claim"
      title="Three line items lack a matching invoice"
      body="Review before the reconciliation closes."
      actions={<AlertAction onClick={() => {}}>Review</AlertAction>}
    />
  );
}
