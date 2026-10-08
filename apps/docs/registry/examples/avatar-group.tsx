import { AvatarGroup } from "@pix-ui/react";

export default function Example() {
  return (
    <AvatarGroup
      max={4}
      size="md"
      tone="accent"
      avatars={["Priya Shah", "Marcus Webb", "Jordan Lee", "Review bot", "Dana Kim", "Eval pipeline"]}
    />
  );
}
