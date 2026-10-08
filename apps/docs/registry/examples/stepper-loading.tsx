import { Stepper } from "@pix-ui/react";

export default function Example() {
  return (
    <Stepper
      loading
      steps={["Account", "Workspace", "Data source", "Review"]}
      current={2}
    />
  );
}
