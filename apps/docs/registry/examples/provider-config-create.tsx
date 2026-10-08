import { ProviderConfig, type ProviderDefinition } from "@pix-ui/react";

const providers: ProviderDefinition[] = [
  {
    value: "openai-compatible",
    label: "OpenAI-compatible",
    description: "Any endpoint that implements the OpenAI chat completions API.",
    auth: [
      { value: "api_key", label: "API key", secretLabel: "API key" },
      { value: "workload_identity", label: "Workload identity", secret: false, note: "Grant this workspace's service account access on the provider's side." },
    ],
    fields: [
      { key: "baseUrl", label: "Base URL", required: true, type: "url", placeholder: "https://api.example.com/v1" },
      { key: "orgId", label: "Organization ID", placeholder: "org-48217" },
    ],
    behaviors: [
      { key: "retryOn429", label: "Retry on rate limit", description: "Automatically retry once with backoff on a 429.", default: true },
      { key: "logPrompts", label: "Log full prompts", description: "Store the full request body for debugging. Off by default for sensitive data." },
    ],
    models: [
      { name: "GPT-4.1", id: "gpt-4.1" },
      { name: "GPT-4.1 mini", id: "gpt-4.1-mini" },
    ],
  },
  {
    value: "azure-openai",
    label: "Azure OpenAI",
    description: "An Azure OpenAI resource and deployment.",
    auth: [{ value: "api_key", label: "API key", secretLabel: "API key" }],
    fields: [
      { key: "resourceUrl", label: "Resource URL", required: true, type: "url", placeholder: "https://my-resource.openai.azure.com" },
      { key: "deployment", label: "Deployment name", required: true, placeholder: "gpt-4-prod" },
    ],
  },
];

export default function Example() {
  return (
    <ProviderConfig
      providers={providers}
      existingNames={["azure-eastus-prod"]}
      onSubmit={(value) => console.log("submit", value)}
      onCancel={() => console.log("cancel")}
      onTest={async () => ({ ok: true, message: "Connection succeeded." })}
    />
  );
}
