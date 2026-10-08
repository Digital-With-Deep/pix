import * as React from "react";
import { CodeEditor } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState(
    `system: "You are a careful release-notes editor."\ntemperature: 0.2\nmax_tokens: 800`
  );

  return (
    <CodeEditor
      value={value}
      onChange={setValue}
      language="yaml"
      title="prompt.yaml"
      lineNumbers
      status="Unsaved changes"
    />
  );
}
