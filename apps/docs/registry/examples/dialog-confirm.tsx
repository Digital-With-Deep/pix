import * as React from "react";
import { Button, Dialog } from "@pix-ui/react";

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete run</Button>
      {deleted && <span style={{ font: "400 13px var(--font-sans, system-ui)", color: "var(--fg2, #57534e)" }}>Run deleted.</span>}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        role="alertdialog"
        size="sm"
        title="Delete this run?"
        description="The trace and its 420 results are removed for everyone. This cannot be undone."
        closeOnOverlayClick={false}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Keep run</Button>
            <Button variant="destructive" size="sm" onClick={() => { setDeleted(true); setOpen(false); }}>Delete run</Button>
          </>
        }
      />
    </div>
  );
}
