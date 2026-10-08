import { InlineCode } from "@pix-ui/react";

export default function Example() {
  return (
    <p style={{ margin: 0, fontSize: 14, color: "var(--fg2, #3f3f46)", lineHeight: 1.6 }}>
      Run <InlineCode tone="accent" copy>pnpm test</InlineCode> after building, or open{" "}
      <InlineCode tone="neutral">src/pix.tokens.json</InlineCode> to edit a token directly.
    </p>
  );
}
