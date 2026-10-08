import { Button, FormActions } from "@pix-ui/react";

export default function Example() {
  return (
    <FormActions position="static" summary="Unsaved changes">
      <Button variant="ghost">Discard</Button>
      <Button variant="primary">Save changes</Button>
    </FormActions>
  );
}
