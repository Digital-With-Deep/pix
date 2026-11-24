import { ConfidenceBadge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <ConfidenceBadge size="standalone" state="confident" score={0.91} scope="Checked against 3 sources" />
      <ConfidenceBadge
        size="standalone"
        state="low"
        score={0.47}
        scope="Checked against 1 source"
        reason="Only the team wiki mentions this waiver, and it is not policy."
      />
    </div>
  );
}
