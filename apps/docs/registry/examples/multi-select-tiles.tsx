import * as React from "react";
import { MultiSelect } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState(["slack"]);

  return (
    <MultiSelect
      variant="tiles"
      label="Integrations to enable"
      value={value}
      onChange={setValue}
      columns={2}
      options={[
        { value: "slack", label: "Slack", description: "Post alerts to a channel." },
        { value: "pagerduty", label: "PagerDuty", description: "Page the on-call rotation." },
        { value: "jira", label: "Jira", description: "Open a ticket automatically." },
        { value: "webhook", label: "Webhook", description: "Send a raw HTTP callback." },
      ]}
    />
  );
}
