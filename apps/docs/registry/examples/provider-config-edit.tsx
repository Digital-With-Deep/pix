import { ProviderConfig, type ProviderDefinition } from "@pix-ui/react";

const providers: ProviderDefinition[] = [
  {
    value: "openai-compatible",
    label: "OpenAI-compatible",
    description: "Any endpoint that implements the OpenAI chat completions API.",
    auth: [{ value: "api_key", label: "API key", secretLabel: "API key" }],
    fields: [{ key: "baseUrl", label: "Base URL", required: true, type: "url", placeholder: "https://api.example.com/v1" }],
    behaviors: [{ key: "retryOn429", label: "Retry on rate limit", description: "Automatically retry once with backoff on a 429.", default: true }],
    models: [
      { name: "GPT-4.1", id: "gpt-4.1" },
      { name: "GPT-4.1 mini", id: "gpt-4.1-mini" },
    ],
  },
];

export default function Example() {
  return (
    <ProviderConfig
      mode="edit"
      providers={providers}
      value={{
        provider: "openai-compatible",
        name: "openai-prod",
        auth: "api_key",
        fields: { baseUrl: "https://api.example.com/v1" },
        headers: [],
        modelScope: "selected",
        models: ["gpt-4.1"],
        customModels: [],
        behavior: { retryOn429: true },
      }}
      onSubmit={(value) => console.log("submit", value)}
      onCancel={() => console.log("cancel")}
      onTest={async () => ({ ok: true, message: "Connection succeeded." })}
    />
  );
}
