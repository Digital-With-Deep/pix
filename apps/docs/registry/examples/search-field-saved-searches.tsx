import * as React from "react";
import { SearchField } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("");
  const [activeSaved, setActiveSaved] = React.useState("Open P1s");

  return (
    <SearchField
      placeholder="Search tickets"
      value={value}
      onChange={setValue}
      onSubmit={(query) => console.log("submit", query)}
      savedSearches={[
        { name: "Open P1s", query: "status:open priority:1", count: 12 },
        { name: "Assigned to me", query: "assignee:me", count: 4 },
        { name: "Needs triage", query: "label:triage", count: 7 },
      ]}
      activeSaved={activeSaved}
      onSelectSaved={(saved) => {
        setActiveSaved(saved.name);
        setValue(saved.query ?? "");
      }}
      onDeleteSaved={(saved) => console.log("delete", saved.name)}
      shortcut="/"
    />
  );
}
