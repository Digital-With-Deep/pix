import { ExecutionTrace } from "@pix-ui/react";

export default function Example() {
  return (
    <ExecutionTrace
      title="Execution trace"
      calls={4}
      duration="300ms"
      tokens="2,140 tokens"
      cost="$0.031"
      steps={[
        { name: "search_gl", args: { period: "2026-Q3" }, duration: "64ms", result: "412 rows" },
        { name: "fetch_bank_feed", args: { account: "op-4821" }, duration: "88ms", result: "398 rows" },
        { name: "diff_ledgers", args: { threshold: 500 }, duration: "102ms", result: "6 unmatched lines" },
        { name: "write_exception", args: { system: "ServiceNow" }, duration: "46ms", result: "ticket EXC-5521 created" },
      ]}
    />
  );
}
