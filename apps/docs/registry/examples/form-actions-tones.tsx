import { Button, FormActions } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FormActions position="static" tone="claim" summary="3 fields need attention">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Submit</Button>
      </FormActions>
      <FormActions position="static" tone="truth" summary="Saved 2 minutes ago">
        <Button variant="ghost">Close</Button>
        <Button variant="primary">Save changes</Button>
      </FormActions>
    </div>
  );
}
