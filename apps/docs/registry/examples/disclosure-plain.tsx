import { Disclosure } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ width: 320 }}>
      <Disclosure title="Show stack trace" variant="plain" defaultOpen>
        <pre
          style={{
            margin: 0,
            padding: 10,
            background: "var(--surface-alt, #fafaf9)",
            border: "1px solid var(--border, #e4e4e7)",
            borderRadius: 4,
            fontSize: 12,
            overflowX: "auto",
          }}
        >
          at resolveRoute (router.ts:42)
        </pre>
      </Disclosure>
    </div>
  );
}
