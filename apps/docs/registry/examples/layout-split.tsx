import { Split } from "@pix-ui/react";

export default function Example() {
  return (
    <Split
      side={200}
      gap={16}
      main={
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #e4e4e7)",
            minHeight: 120,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1, #18181b)" }}>Run detail</div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--fg2, #3f3f46)" }}>
            312 cases evaluated across 4 suites with no regressions detected.
          </p>
        </div>
      }
      aside={
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            background: "var(--surface-alt, #f4f4f5)",
            border: "1px solid var(--border, #e4e4e7)",
            fontSize: 12,
            color: "var(--fg3, #71717a)",
          }}
        >
          Triggered by · nightly schedule
          <br />
          Duration · 4m 12s
        </div>
      }
    />
  );
}
