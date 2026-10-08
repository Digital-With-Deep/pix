import { Disclosure } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ width: 320 }}>
      <Disclosure title="Advanced" meta="3 settings" defaultOpen>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>Request timeout: 30s</span>
          <span>Max retries: 2</span>
          <span>Streaming: on</span>
        </div>
      </Disclosure>
    </div>
  );
}
