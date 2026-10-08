import { LicenseBanner } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ width: "100%" }}>
      <LicenseBanner
        loading
        planLabel="Evaluation"
        termEnd={new Date("2026-10-21")}
        daysLeft={14}
      />
    </div>
  );
}
