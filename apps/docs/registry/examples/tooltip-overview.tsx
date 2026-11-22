import { Button, Tooltip } from "@pix-ui/react";

const copyPath = "M8 8V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M6 8h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z";

export default function Example() {
  return (
    <Tooltip content="Copy trace ID">
      <Button variant="outline" iconPath={copyPath} aria-label="Copy trace ID" />
    </Tooltip>
  );
}
