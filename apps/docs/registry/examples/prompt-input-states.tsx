import { PromptInput } from "@pix-ui/react";

export default function Example() {
  return (
    <PromptInput
      placeholder="Ask about this contract"
      showPlusMenu={false}
      showModelSelector={false}
      showAttachButton
      defaultValue="Which clauses changed since the last renewal?"
      defaultAttachments={[
        { id: "a", name: "harbor-pine-msa-v4.pdf", size: 1_840_000, type: "application/pdf", status: "uploading", progress: 64 },
        { id: "b", name: "redlines-scan.tiff", size: 31_500_000, type: "image/tiff", status: "error", error: "Over the 25 MB limit" },
        { id: "c", name: "renewal-notes.txt", size: 3_100, type: "text/plain", status: "done" },
      ]}
      hint="Send waits until every upload has finished"
    />
  );
}
