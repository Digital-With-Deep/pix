import { Alert, AlertAction } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="inverse"
      title="Close this as not operating, not as operating with exceptions"
      body="The sample passed on balance but failed on method in 3 of 4 instances tested. That distinction is the finding the committee should see."
      actions={<AlertAction tone="inverse" onClick={() => {}}>Open finding</AlertAction>}
    />
  );
}
