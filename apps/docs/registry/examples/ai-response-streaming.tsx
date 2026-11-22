import { AIResponse } from "@pix-ui/react";

export default function Example() {
  return (
    <AIResponse
      status="streaming"
      model="Payables agent"
      onStop={() => {}}
      text={"The bank returned the payment with code **R03**, which means the account no longer exists.\n\nNorthwind sent new details on Nov 18, so the next step is"}
    />
  );
}
