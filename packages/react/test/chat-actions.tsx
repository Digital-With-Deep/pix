import * as React from "react";
import { AIResponse, Conversation, MessageActions, PromptInput, type MessageFeedbackVote, type PromptAttachment } from "../src/index";

export const ChatActionsDemo = () => {
  const [files, setFiles] = React.useState<PromptAttachment[]>([]);
  const [vote, setVote] = React.useState<MessageFeedbackVote>(null);
  const actions = (
    <MessageActions text="Answer" onCopy={(t) => void t} onRegenerate={() => {}} feedback={vote} onFeedback={setVote}
      onFeedbackReason={(d) => void [d.vote, d.reason, d.comment]} feedbackReasons={["Wrong total"]} onBranch={() => {}}
      labels={{ copied: "Copied to clipboard" }} tooltipPlacement="bottom" />
  );
  return (
    <div>
      <PromptInput attachments={files} onAttachmentsChange={setFiles} onAttach={(added) => added.forEach((a) => void a.file)}
        onRemoveAttachment={(a) => void a.id} accept="image/*,.pdf" multiple maxFileSize={10 * 1024 * 1024} showAttachButton
        onAddScreenshot={async () => new Blob([], { type: "image/png" })} label="Ask the agent" />
      <PromptInput defaultAttachments={[{ id: "a", name: "notes.txt", status: "uploading", progress: 40 }]} plusItems={[{ label: "Screenshot", action: "screenshot" }]}
        onAddScreenshot={async () => null} />
      <AIResponse text="Answer" actions={actions} />
      <Conversation messages={[{ role: "assistant", content: "Hi", actions }]} />
      <MessageActions loading />
      <MessageActions text={() => "lazy"} defaultFeedback="up" disabled><button>More</button></MessageActions>
    </div>
  );
};
