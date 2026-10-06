import { AIResponse } from "@pix-ui/react";

export default function Example() {
  return (
    <AIResponse
      status="done"
      model="gpt-5.2"
      duration="6.8s"
      tokens="1,284 tokens"
      text={
        "The renewal carries three material changes from the 2025 treaty.\n\n" +
        "The cyber exclusion wording was tightened to exclude contingent business interruption, the aggregate retention rose from 2,000,000 to 2,500,000, and the certificate of currency lapsed on 2026-08-31 — fourteen days before this binding date."
      }
      thinking={"Read the bound slip and the prior-year treaty wording\nDiffed exclusion clauses against the 2025 program\nCross-checked the certificate of currency expiry against the binding date"}
      citations={["Treaty wording v4", { label: "Bound slip", note: "Signed 2026-09-12" }]}
      onCopy={() => {}}
      onRetry={() => {}}
      onFeedback={() => {}}
    />
  );
}
