import { CoverageMatrix } from "@pix-ui/react";

export default function Example() {
  return <CoverageMatrix loading assertions={["ARI", "CIT", "SCP", "TCS"]} rows={[]} />;
}
