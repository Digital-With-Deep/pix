import { RateBars } from "@pix-ui/react";

export default function Example() {
  return (
    <RateBars
      caption="Pass rate across 42 runs"
      hint="Last 24h"
      threshold={90}
      rows={[
        { name: "schema_valid", value: 99.1 },
        { name: "idempotency_key_present", value: 97.6 },
        {
          name: "cert_valid_to",
          value: 86.4,
          note: "Fails when a cert expires before the check window closes.",
        },
        { name: "pii_redacted", value: 92.8 },
      ]}
    />
  );
}
