import { Button, FormActions } from "@pix-ui/react";

export default function Example() {
  return (
    <FormActions position="static">
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Save changes</Button>
    </FormActions>
  );
}
