import { Button, Menu } from "@pix-ui/react";

const dotsPath = "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z";

export default function Example() {
  return (
    <Menu
      trigger={<Button variant="outline" iconPath={dotsPath} aria-label="More actions" />}
      items={[
        { label: "Rename", onSelect: () => console.log("rename") },
        {
          label: "Move to",
          items: [
            { label: "Evaluations", onSelect: () => console.log("move: evaluations") },
            { label: "Archived runs", onSelect: () => console.log("move: archived") },
            {
              label: "Shared with team",
              items: [
                { label: "Reconciliation", onSelect: () => console.log("move: reconciliation") },
                { label: "Fraud review", onSelect: () => console.log("move: fraud review") },
              ],
            },
          ],
        },
        { separator: true },
        { label: "Delete run", tone: "danger", onSelect: () => console.log("delete") },
      ]}
    />
  );
}
