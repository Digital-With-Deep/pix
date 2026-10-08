import { FingerprintDiff } from "@pix-ui/react";

export default function Example() {
  return (
    <FingerprintDiff
      title="Decision logic fingerprint"
      periodLabels={["2026-Q2", "2026-Q3"]}
      components={[
        { name: "model_version", from: "gpt-5.2 (provider-managed)", to: "gpt-5.2 (provider-managed)" },
        { name: "H(system_prompt)", from: "a13f...8e2c", to: "a13f...8e2c" },
        { name: "tool_set", from: "search_gl, fetch_bank_feed, diff_ledgers", to: "search_gl, fetch_bank_feed, diff_ledgers" },
      ]}
      confidence="low"
    />
  );
}
