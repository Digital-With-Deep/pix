import { RadioGroup } from "@pix-ui/react";

export default function Example() {
  return (
    <RadioGroup
      loading
      label="Notification frequency"
      options={[{ value: "realtime", label: "Real-time" }]}
    />
  );
}
