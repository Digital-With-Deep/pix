import { Alert } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="claim"
      icon="alert"
      title="3 of 4 failures reached the correct amount by a path that fails the control objective"
      body="The agent's reconciliation matches the GL balance, but two of the three matched entries were force-balanced with a manual plug rather than traced to a source document."
      citation="Finding ref. REC-2026-0091"
    />
  );
}
