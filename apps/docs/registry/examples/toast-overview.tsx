import { Button, ToastProvider, useToast } from "@pix-ui/react";

function Actions() {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started", description: "We will email the CSV when it is ready." })}>
        Info
      </Button>
      <Button variant="outline" size="sm" onClick={() => toast({ tone: "truth", title: "Verified", description: "All 420 amounts match the ledger." })}>
        Truth
      </Button>
      <Button variant="outline" size="sm" onClick={() => toast({ tone: "claim", title: "Claim not verified", description: "The model cited an invoice that does not exist." })}>
        Claim
      </Button>
      <Button variant="outline" size="sm" onClick={() => toast({ tone: "warn", title: "Budget at 90%", description: "Runs pause at $250.00." })}>
        Warn
      </Button>
    </div>
  );
}

export default function Example() {
  return (
    <ToastProvider>
      <Actions />
    </ToastProvider>
  );
}
