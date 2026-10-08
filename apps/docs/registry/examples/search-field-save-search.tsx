import * as React from "react";
import { SearchField } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("status:open priority:1");

  return (
    <SearchField
      placeholder="Search tickets"
      value={value}
      onChange={setValue}
      onSubmit={(query) => console.log("submit", query)}
      savedSearches={["Open P1s", "Assigned to me"]}
      onSaveSearch={(query) => console.log("save", query)}
    />
  );
}
