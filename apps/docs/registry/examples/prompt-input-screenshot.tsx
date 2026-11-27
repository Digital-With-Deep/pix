"use client";
import { PromptInput, type PromptAttachment } from "@pix-ui/react";

// A stand-in for your own capture code. In an app this might call
// navigator.mediaDevices.getDisplayMedia or a native bridge, and resolve
// null when the person cancels.
const thumb =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#e7e5e4"/><rect x="6" y="8" width="44" height="6" fill="#a8a29e"/><rect x="6" y="20" width="30" height="4" fill="#d6d3d1"/><rect x="6" y="28" width="38" height="4" fill="#d6d3d1"/></svg>');

async function captureScreen(): Promise<PromptAttachment> {
  await new Promise((r) => setTimeout(r, 600));
  return { name: "dispatch-board.png", size: 214_000, type: "image/png", preview: thumb, status: "done" };
}

export default function Example() {
  return (
    <PromptInput
      placeholder="What's wrong with this screen?"
      showModelSelector={false}
      plusItems={[
        { label: "Upload files", icon: "upload", meta: "Images and PDFs", action: "attach" },
        { label: "Add screenshot", icon: "spark", meta: "Capture the current view", action: "screenshot" },
      ]}
      onAddScreenshot={captureScreen}
    />
  );
}
