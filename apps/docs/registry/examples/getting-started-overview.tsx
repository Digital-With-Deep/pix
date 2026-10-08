import { GettingStarted } from "@pix-ui/react";

export default function Example() {
  return (
    <GettingStarted
      steps={[
        { label: "Invite your team", done: true },
        { label: "Connect a data source", done: true },
        { label: "Set usage limits", done: false },
        { label: "Add a payment method", done: false },
      ]}
      onOpen={() => {}}
      onDismiss={() => {}}
    />
  );
}
