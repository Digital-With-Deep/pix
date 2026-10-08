import * as React from "react";
import { Switch } from "@pix-ui/react";

export default function Example() {
  const [email, setEmail] = React.useState(true);
  const [push, setPush] = React.useState(false);
  const [digest, setDigest] = React.useState(true);

  return (
    <div style={{ maxWidth: 360 }}>
      <Switch
        label="Email notifications"
        description="Get a summary of activity once a day."
        checked={email}
        onChange={setEmail}
      />
      <Switch
        label="Push notifications"
        description="Alert me the moment something changes."
        checked={push}
        onChange={setPush}
        divider
      />
      <Switch
        label="Weekly digest"
        description="Requires the Team plan."
        checked={digest}
        onChange={setDigest}
        disabled
        divider
      />
    </div>
  );
}
