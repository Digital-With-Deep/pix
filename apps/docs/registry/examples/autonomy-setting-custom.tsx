import { AutonomySetting } from "@pix-ui/react";

export default function Example() {
  return (
    <AutonomySetting
      label="Ticket triage"
      defaultValue="autonomous"
      descriptions={{
        autonomous: "The agent assigns and closes duplicate tickets without asking. Each action can be undone for 15 minutes.",
      }}
      style={{ width: "100%", maxWidth: 620 }}
    />
  );
}
