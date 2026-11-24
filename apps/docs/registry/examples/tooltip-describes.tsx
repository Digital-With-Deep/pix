import { Badge, Tooltip } from "@pix-ui/react";

export default function Example() {
  return (
    <p style={{ margin: 0, font: "400 14px var(--font-sans, system-ui)", color: "var(--fg1, #1c1917)" }}>
      Status{" "}
      <Tooltip content="Every field matched the ground truth on the last run." defaultOpen>
        <span tabIndex={0} style={{ borderRadius: 3 }}>
          <Badge tone="success" dot>Verified</Badge>
        </span>
      </Tooltip>
    </p>
  );
}
