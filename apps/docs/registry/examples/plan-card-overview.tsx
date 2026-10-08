import { PlanCard } from "@pix-ui/react";

export default function Example() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
      }}
    >
      <PlanCard
        name="Starter"
        features={["3 entities in scope", "Daily sync", "Email support"]}
      />
      <PlanCard
        name="Growth"
        current
        features={[
          "25 entities in scope",
          "Hourly sync",
          "Priority support",
          "Audit log export",
        ]}
      />
      <PlanCard
        name="Enterprise"
        features={[
          "Unlimited entities in scope",
          "Real-time sync",
          "Dedicated support",
          "SSO and SCIM",
        ]}
      />
    </div>
  );
}
