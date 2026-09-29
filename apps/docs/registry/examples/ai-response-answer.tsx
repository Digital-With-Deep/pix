import { AIResponse } from "@pix-ui/react";

export default function Example() {
  return (
    <AIResponse
      status="done"
      model="gpt-5"
      duration="4.2s"
      text="Found three unmatched line items in the March ledger."
      thinking={"Scanned 214 transactions\nCompared against the bank feed\nFlagged 3 mismatches"}
      citations={["March ledger", { label: "Bank feed", note: "Synced 2 hours ago" }]}
    />
  );
}
