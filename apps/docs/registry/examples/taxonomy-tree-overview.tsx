import { TaxonomyTree } from "@pix-ui/react";

export default function Example() {
  return (
    <TaxonomyTree
      caption="Control taxonomy"
      hint="42 nodes"
      nodes={[
        { label: "Financial controls", depth: 0, code: "FC" },
        { label: "Revenue recognition", depth: 1, code: "FC-01", objective: "O-WHT-01" },
        { label: "Cut-off testing", depth: 2, code: "FC-01-A", objective: "O-WHT-02" },
        { label: "Expense controls", depth: 1, code: "FC-02", objective: "O-WHT-03" },
      ]}
    />
  );
}
