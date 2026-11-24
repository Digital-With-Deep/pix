import { Button, Popover } from "@pix-ui/react";

export default function Example() {
  return (
    <Popover
      title="How the score is computed"
      content={
        <>
          Each case is compared field by field with the ground truth. A case passes only when every field matches;
          amounts are compared to the cent.
        </>
      }
    >
      <Button variant="outline" size="sm">About this score</Button>
    </Popover>
  );
}
