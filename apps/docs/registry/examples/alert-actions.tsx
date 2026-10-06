import { Alert, AlertAction } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="claim"
      icon="alert"
      title="4 of 60 sampled journal entries lack supporting documentation"
      body="These entries were posted by a non-standard user and have had no attached source document for more than 30 days."
      actions={
        <>
          <AlertAction onClick={() => {}}>View all failures</AlertAction>
          <AlertAction onClick={() => {}}>Raise finding</AlertAction>
        </>
      }
    />
  );
}
