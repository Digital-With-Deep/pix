import { Callout } from "@pix-ui/react";

export default function Example() {
  return (
    <Callout
      tone="note"
      icon="spark"
      title="New: citation hints"
      action={
        <a href="#" style={{ color: "inherit", fontWeight: 600, textDecoration: "underline" }}>
          Learn more
        </a>
      }
    >
      Callouts can now surface a trailing action next to the message.
    </Callout>
  );
}
