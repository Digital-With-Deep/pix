import { AIResponse } from "@pix-ui/react";

export default function Example() {
  return (
    <AIResponse
      status="done"
      model="gpt-5.2"
      duration="6.8s"
      tokens="1,284 tokens"
      text="The renewal carries three material changes from the 2025 treaty — see the reasoning below for where each one surfaced."
      defaultThinkingOpen
      thinking={[
        { kind: "read", system: "SharePoint", label: "Pulled the 2026 bound slip and prior-year treaty wording", duration: "412ms" },
        { kind: "thought", label: "Diffed exclusion clauses line by line against the 2025 program", lines: ["Cyber exclusion now excludes contingent business interruption", "Aggregate retention raised from 2,000,000 to 2,500,000"] },
        { kind: "tool", label: "Checked certificate of currency expiry", detail: "expiry=2026-08-31, bindingDate=2026-09-14", duration: "88ms" },
        { kind: "write", system: "ServiceNow", label: "Logged the lapse as a renewal blocker", duration: "151ms" },
      ]}
      citations={["Treaty wording v4", { label: "Bound slip", note: "Signed 2026-09-12" }]}
      onCopy={() => {}}
      onFeedback={() => {}}
    />
  );
}
