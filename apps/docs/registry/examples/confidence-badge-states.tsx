import { ConfidenceBadge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      <ConfidenceBadge state="confident" score={0.94} />
      <ConfidenceBadge state="low" score={0.58} />
      <ConfidenceBadge state="review" reason="Two of the three sources disagree on the rate." />
      <ConfidenceBadge state="failed" reason="The ledger could not be reached, so nothing was checked." />
    </div>
  );
}
