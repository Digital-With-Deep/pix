"use client";
import * as React from "react";
import { PromptInput, type PromptAttachment } from "@pix-ui/react";

export default function Example() {
  const [files, setFiles] = React.useState<PromptAttachment[]>([
    { id: "seed-1", name: "freight-rates-q3.csv", size: 48_200, type: "text/csv", status: "done" },
  ]);

  // Stand-in for a real upload: moves each new file from 0 to 100% and marks it done.
  const upload = (added: PromptAttachment[]) => {
    for (const file of added) {
      if (file.error) continue;
      let progress = 0;
      const tick = setInterval(() => {
        progress = Math.min(100, progress + 20);
        setFiles((cur) => cur.map((f) => (f.id === file.id ? { ...f, progress, status: progress === 100 ? "done" : "uploading" } : f)));
        if (progress === 100) clearInterval(tick);
      }, 300);
    }
  };

  return (
    <PromptInput
      placeholder="Ask about these shipments"
      showPlusMenu={false}
      showModelSelector={false}
      showAttachButton
      accept="image/*,.pdf,.csv"
      maxFileSize={10 * 1024 * 1024}
      attachments={files}
      onAttachmentsChange={(next) => setFiles(next.map((f) => (f.error || f.status ? f : { ...f, status: "uploading", progress: 0 })))}
      onAttach={upload}
      hint="Attach, drop or paste images, PDFs and CSVs up to 10 MB"
    />
  );
}
