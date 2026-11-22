import * as React from "react";
import { Button, Card, Checkbox, Dialog, Popover, TextField, Textarea, Toast, ToastProvider, Tooltip, useToast } from "../src/index";

function Notify() {
  const { toast, dismiss } = useToast();
  const id: string = toast({ tone: "truth", title: "Verified", action: { label: "Undo", onClick: () => {} }, duration: 0 });
  dismiss(id);
  toast("Saved");
  return null;
}

export const BasicsDemo = () => {
  const [name, setName] = React.useState("");
  const [on, setOn] = React.useState(false);
  const focusRef = React.useRef<HTMLInputElement>(null);
  return (
    <ToastProvider placement="top-right" max={2} duration={4000}>
      <Notify />
      <Card title="Run" description="Nightly" action={<Button size="sm">Run</Button>} footer={<Button>Save</Button>} headingLevel={2} padding="none">Body</Card>
      <TextField label="Name" value={name} onChange={setName} maxLength={40} required hint="Hint" error={name ? undefined : "Required"} autoComplete="off" />
      <Textarea label="Note" defaultValue="x" rows={3} resize="none" showCount={false} maxLength={200} />
      <Checkbox label="All" checked={on} indeterminate onChange={(v) => setOn(v)} description="d" name="all" />
      <Dialog trigger={<Button>Open</Button>} title="Rename" description="d" size="sm" role="alertdialog" initialFocusRef={focusRef} footer={<Button>OK</Button>}>Body</Dialog>
      <Popover content="Info" title="About" align="end" placement="top" onOpenChange={(o) => void o}><Button>About</Button></Popover>
      <Tooltip content="Copy" placement="right" delay={200}><Button>Copy</Button></Tooltip>
      <Toast tone="warn" title="Budget" onDismiss={() => {}} />
    </ToastProvider>
  );
};
