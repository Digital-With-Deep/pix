import { FingerprintDiff } from "@pix-ui/react";

export default function Example() {
  return (
    <FingerprintDiff
      title="Decision logic fingerprint"
      periodLabels={["2026-Q2", "2026-Q3"]}
      components={[
        { name: "model_version", from: "gpt-5.2-2026-05-01", to: "gpt-5.3-2026-08-14" },
        { name: "H(system_prompt)", from: "a13f...8e2c", to: "a13f...8e2c" },
        { name: "tool_set", from: "search_gl, fetch_bank_feed, diff_ledgers", to: "search_gl, fetch_bank_feed, diff_ledgers, match_po" },
        { name: "temperature", from: "0.0", to: "0.0" },
      ]}
      confidence="high"
    />
  );
}
