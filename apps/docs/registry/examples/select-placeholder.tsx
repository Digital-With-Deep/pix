import { Select } from "@pix-ui/react";

export default function Example() {
  return (
    <Select
      label="Environment"
      placeholder="Select environment"
      hint="Deploys target this environment by default."
      options={[
        { value: "production", label: "Production", meta: "prod" },
        { value: "staging", label: "Staging", meta: "stg" },
        { value: "development", label: "Development", meta: "dev" },
      ]}
    />
  );
}
