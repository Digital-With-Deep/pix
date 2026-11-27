"use client";
import * as React from "react";
import { MessageActions, type MessageFeedbackDetail } from "@pix-ui/react";

export default function Example() {
  const [last, setLast] = React.useState<MessageFeedbackDetail | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <MessageActions
        text="The Aldermoor depot can take 40 more pallets this week."
        onRegenerate={() => {}}
        onFeedback={() => setLast(null)}
        onFeedbackReason={setLast}
        feedbackReasons={["Wrong numbers", "Out of date", "Missed the question", "Too long"]}
      />
      <span style={{ font: "400 12px var(--font-sans, system-ui)", color: "var(--fg3, #71717a)" }}>
        {last ? `Reported: ${last.reason ?? "no reason"}${last.comment ? ` · "${last.comment}"` : ""}` : "Press thumbs down to see the reason picker."}
      </span>
    </div>
  );
}
