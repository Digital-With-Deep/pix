import { PlanCard } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ maxWidth: 240 }}>
      <PlanCard
        name="Growth"
        current
        features={[
          "25 entities in scope",
          "Hourly sync",
          "Priority support",
          "Audit log export",
        ]}
        footer={
          <button
            type="button"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 4,
              border: "1px solid var(--border-strong, #d4d4d8)",
              background: "var(--surface, #fff)",
              color: "var(--fg1, #18181b)",
              font: "600 12px var(--font-sans, ui-sans-serif, system-ui)",
              cursor: "pointer",
            }}
          >
            Request a change
          </button>
        }
      />
    </div>
  );
}
