import { SavedSearch } from "@pix-ui/react";

export default function Example() {
  return (
    <SavedSearch
      placeholder="Search orders, refs, customer"
      fields={[
        { key: "status", label: "Status", options: ["Matched", "Pending", "Review"] },
        { key: "vendor", label: "Vendor", options: ["Acme Corp", "Globex", "Initech"] },
      ]}
      onSubmit={({ query, filters, url }) => console.log(query, filters, url)}
    />
  );
}
