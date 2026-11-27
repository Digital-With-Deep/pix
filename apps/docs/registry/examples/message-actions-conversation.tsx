import { Conversation, MessageActions } from "@pix-ui/react";

const reply = "The Juniper Lane order shipped this morning and should arrive **Thursday**.\n\nThe tracking number is `JL-55821-C`.";

export default function Example() {
  return (
    <Conversation
      height={300}
      messages={[
        { id: "q", role: "user", author: "Ines", time: "10:14", content: "Where is the Juniper Lane order?" },
        {
          id: "a", role: "assistant", author: "Orders agent", time: "10:14", content: reply,
          actions: <MessageActions text={reply} onRegenerate={() => {}} onFeedback={() => {}} onBranch={() => {}} tooltipPlacement="bottom" />,
        },
      ]}
    />
  );
}
