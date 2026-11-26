import { MessageActions } from "@pix-ui/react";

export default function Example() {
  return (
    <MessageActions
      text="Route 14 is running 22 minutes late because the Elm Street bridge is closed for repairs."
      onCopy={() => {}}
      onRegenerate={() => {}}
      onFeedback={() => {}}
      onBranch={() => {}}
    />
  );
}
