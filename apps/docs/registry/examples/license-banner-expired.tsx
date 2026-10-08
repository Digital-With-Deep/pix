import { LicenseBanner } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ width: "100%" }}>
      <LicenseBanner
        planLabel="Evaluation"
        termEnd={new Date("2026-09-24")}
        expired
        onAction={() => {}}
      />
    </div>
  );
}
