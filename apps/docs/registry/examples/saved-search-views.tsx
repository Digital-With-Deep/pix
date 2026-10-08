import * as React from "react";
import { SavedSearch } from "@pix-ui/react";

export default function Example() {
  const [activeView, setActiveView] = React.useState<string | undefined>("Needs review");

  return (
    <SavedSearch
      placeholder="Search orders, refs, customer"
      fields={[
        { key: "status", label: "Status", options: ["Matched", "Pending", "Review"] },
        { key: "vendor", label: "Vendor", options: ["Acme Corp", "Globex", "Initech"] },
      ]}
      views={[
        { name: "Needs review", shared: true, filters: [{ field: "status", op: "is", values: ["Review"] }] },
        { name: "My vendors", filters: [{ field: "vendor", op: "is", values: ["Acme Corp"] }] },
      ]}
      activeView={activeView}
      onSelectView={(view) => setActiveView(view ? view.name : undefined)}
      onSaveView={(view) => console.log("saved", view)}
      onDeleteView={(view) => console.log("delete", view)}
    />
  );
}
