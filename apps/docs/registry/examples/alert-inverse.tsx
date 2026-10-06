import { Alert } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="inverse"
      title="The control did not operate as designed for 3 of the 4 months tested"
      body="Each failure independently reached the correct ending balance, which is why the control looked effective in the GL tie-out. The finding is about the path, not the total."
      citation="Carry this line into the memo verbatim"
    />
  );
}
