import { Callout } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Callout tone="claim" title="Claim" style={{ flex: "1 1 220px" }}>
        The model stated it read the certificate before approving the request.
      </Callout>
      <Callout tone="truth" title="Truth" style={{ flex: "1 1 220px" }}>
        Verified: the certificate was never fetched; approval was based on a cached result.
      </Callout>
    </div>
  );
}
