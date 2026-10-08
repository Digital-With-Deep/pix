import { Button, Menu } from "@pix-ui/react";

const dotsPath = "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z";

export default function Example() {
  return (
    <Menu
      trigger={<Button variant="outline" iconPath={dotsPath} aria-label="More actions" />}
      items={[
        { heading: "Run" },
        { label: "Replay run", shortcut: "⌘R", onSelect: () => console.log("replay") },
        { label: "Export trace", shortcut: "⌘E", onSelect: () => console.log("export") },
        { separator: true },
        { heading: "Danger zone" },
        { label: "Cancel run", disabled: true },
        { label: "Delete run", tone: "danger", onSelect: () => console.log("delete") },
      ]}
    />
  );
}
