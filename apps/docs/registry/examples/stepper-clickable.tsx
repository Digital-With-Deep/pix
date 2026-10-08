import { Stepper } from "@pix-ui/react";

export default function Example() {
  return (
    <Stepper
      steps={["Account", "Workspace", "Data source", "Review"]}
      current={2}
      onStepClick={() => {}}
    />
  );
}
