import { Button, Dialog, TextField, Textarea } from "@pix-ui/react";

export default function Example() {
  return (
    <Dialog
      trigger={<Button variant="outline">Rename run</Button>}
      title="Rename run"
      description="The new name shows in traces, exports and the audit log."
      footer={
        <>
          <Button variant="outline" size="sm">Cancel</Button>
          <Button variant="filled" size="sm">Save name</Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <TextField label="Name" defaultValue="Nightly evaluation" required maxLength={60} />
        <Textarea label="Note" hint="Optional. Visible to everyone in the workspace." rows={3} />
      </div>
    </Dialog>
  );
}
