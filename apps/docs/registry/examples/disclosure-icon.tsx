import { Disclosure } from "@pix-ui/react";

const plugIcon = (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 3v4m6-4v4M7 7h10v4a5 5 0 01-10 0V7zm5 9v5" />
  </svg>
);

export default function Example() {
  return (
    <div style={{ width: 320 }}>
      <Disclosure title="Connected providers" meta="2 active" icon={plugIcon}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>OpenAI — gpt-4.1</span>
          <span>Anthropic — claude-sonnet</span>
        </div>
      </Disclosure>
    </div>
  );
}
