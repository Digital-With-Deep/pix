import { RateBars } from "@pix-ui/react";

export default function Example() {
  return (
    <RateBars
      caption="Compliance controls"
      hint="SOC 2 · Q3"
      threshold={90}
      rows={[
        {
          name: "access_review_sla",
          value: 94.2,
          tone: "danger",
          note: "Above threshold, but 2 reviews are still open past their due date — flagged until closed.",
        },
        {
          name: "backup_restore_tested",
          value: 88.0,
          tone: "default",
          note: "Below threshold during the scheduled DR drill window; expected and tracked separately.",
        },
        { name: "least_privilege_scan", value: 99.4 },
      ]}
    />
  );
}
