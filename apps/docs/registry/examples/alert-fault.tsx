import { Alert } from "@pix-ui/react";

export default function Example() {
  return (
    <Alert
      tone="fault"
      icon="warn"
      title="No benchmark exists for this control at this entity"
      body="Scope is limited to the three entities with a prior-year walkthrough. Read the findings below as directional, not comparative."
      citation="PCAOB AS 2201.39 — stated scope limitation"
    />
  );
}
