import { AIResponse, MessageActions } from "@pix-ui/react";

const answer =
  "Two of the five Lakeview stores ran out of oat milk on Saturday.\n\n" +
  "Both had their delivery moved from Friday to Monday when the route changed, so the weekend ran on Thursday's stock.";

export default function Example() {
  return (
    <AIResponse
      model="ops-assistant"
      duration="3.1s"
      text={answer}
      actions={<MessageActions text={answer} onRegenerate={() => {}} onFeedback={() => {}} onFeedbackReason={() => {}} onBranch={() => {}} />}
    />
  );
}
