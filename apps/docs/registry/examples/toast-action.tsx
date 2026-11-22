import * as React from "react";
import { Button, ToastProvider, useToast } from "@pix-ui/react";

function ArchiveButton() {
  const { toast } = useToast();
  const [archived, setArchived] = React.useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setArchived(true);
          toast({
            title: "Run archived",
            description: "It no longer shows in the default view.",
            action: { label: "Undo", onClick: () => setArchived(false) },
            duration: 8000,
          });
        }}
      >
        Archive run
      </Button>
      <span style={{ font: "400 13px var(--font-sans, system-ui)", color: "var(--fg2, #57534e)" }}>{archived ? "Archived" : "Active"}</span>
    </div>
  );
}

export default function Example() {
  return (
    <ToastProvider placement="bottom">
      <ArchiveButton />
    </ToastProvider>
  );
}
