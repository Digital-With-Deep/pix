import { AIResponse } from "@pix-ui/react";

export default function Example() {
  return (
    <AIResponse
      status="generating"
      model="gpt-5.2"
      stage="Reviewing treaty renewal…"
      stages={[
        { label: "Read bound slip and prior-year treaty wording", done: true },
        { label: "Diffed exclusion clauses against the 2025 program", done: true },
        { label: "Checking the certificate of currency for lapses", done: false },
        { label: "Drafting renewal recommendation", done: false },
      ]}
      onStop={() => {}}
    />
  );
}
