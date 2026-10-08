import { ThinkingTrace } from "@pix-ui/react";

export default function Example() {
  return (
    <ThinkingTrace
      status="done"
      doneLabel="Thought it through"
      defaultOpen
      onReplay={() => {}}
      replayLabel="Replay trace"
      steps={[
        {
          kind: "thought",
          label: "Compared the 2026 renewal terms against the 2025 treaty",
          lines: [
            "Cyber exclusion now excludes contingent business interruption",
            "Aggregate retention raised from 2,000,000 to 2,500,000",
          ],
          duration: "212ms",
        },
        { kind: "read", system: "SAP S/4HANA", label: "Pulled the bound slip for the current period", duration: "340ms" },
        { kind: "tool", label: "Checked certificate of currency expiry", detail: "expiry=2026-08-31, bindingDate=2026-09-14", duration: "88ms" },
        { kind: "write", system: "ServiceNow", verb: "FILED", label: "Filed the lapse as a renewal blocker", duration: "151ms" },
      ]}
    />
  );
}
