import { TaxonomyTree } from "@pix-ui/react";

export default function Example() {
  return (
    <TaxonomyTree
      caption="Control taxonomy"
      hint="Tenant: acme-us"
      nodes={[
        { label: "Financial controls", depth: 0, code: "FC" },
        { label: "Revenue recognition", depth: 1, code: "FC-01", objective: "O-WHT-01" },
        {
          label: "Regional discount approvals",
          depth: 2,
          code: "FC-01-X1",
          ext: "ext · US01",
          objective: "O-WHT-01B",
        },
        { label: "Expense controls", depth: 1, code: "FC-02", objective: "O-WHT-03" },
      ]}
    />
  );
}
