import { Button, Tooltip } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", padding: "36px 72px" }}>
      <Tooltip content="Above" placement="top"><Button variant="outline" size="sm">Top</Button></Tooltip>
      <Tooltip content="Below" placement="bottom"><Button variant="outline" size="sm">Bottom</Button></Tooltip>
      <Tooltip content="To the left" placement="left"><Button variant="outline" size="sm">Left</Button></Tooltip>
      <Tooltip content="To the right" placement="right"><Button variant="outline" size="sm">Right</Button></Tooltip>
    </div>
  );
}
