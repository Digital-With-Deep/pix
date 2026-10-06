import * as React from "react";
import { Select } from "@pix-ui/react";

export default function Example() {
  const [value, setValue] = React.useState("us-east");

  return (
    <Select
      label="Deploy region"
      placeholder="Choose a region"
      value={value}
      onChange={setValue}
      options={[
        { value: "us-east", label: "US East (N. Virginia)", meta: "us-east-1", group: "Americas" },
        { value: "us-west", label: "US West (Oregon)", meta: "us-west-2", group: "Americas" },
        { value: "eu-west", label: "Europe (Ireland)", meta: "eu-west-1", group: "Europe" },
        { value: "eu-central", label: "Europe (Frankfurt)", meta: "eu-central-1", group: "Europe" },
        { value: "ap-south", label: "Asia Pacific (Mumbai)", meta: "ap-south-1", group: "Asia Pacific" },
        { value: "ap-northeast", label: "Asia Pacific (Tokyo)", meta: "ap-northeast-1", group: "Asia Pacific" },
      ]}
    />
  );
}
