import { AIResponse } from "@pix-ui/react";

export default function Example() {
  return (
    <AIResponse
      status="done"
      model="gpt-5.2"
      duration="5.1s"
      tokens="942 tokens"
      text="The certificate of currency lapsed on 2026-08-31, fourteen days before this binding date — the treaty cannot be renewed until a current certificate is on file."
      citations={[
        { label: "Certificate of currency", note: "Expired 2026-08-31", href: "#" },
        { label: "Bound slip", note: "Binding date 2026-09-14", href: "#" },
        "Treaty wording v4",
      ]}
      onCopy={() => {}}
    />
  );
}
