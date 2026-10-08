import { Disclosure } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ width: 320 }}>
      <Disclosure title="Install the SDK" meta="2 steps" variant="row">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>1. Install the package.</span>
          <span>2. Add your API key.</span>
        </div>
      </Disclosure>
    </div>
  );
}
