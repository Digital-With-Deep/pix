// Renders the non-text parts of a thread with PIX components. Copy this file into your app as it is.
import { ApprovalCard, ToolCall } from "@pix-ui/react";
import type { PartMessage } from "@pix-ui/adapters";

export interface Decision {
  approved: boolean;
  reason?: string;
  edits?: Record<string, string>;
}

export function renderPart(message: PartMessage, onDecide: (approvalId: string, decision: Decision) => void) {
  if (message.kind === "tool") return <ToolCall {...message.props} />;
  const { approvalId } = message;
  return (
    <ApprovalCard
      {...message.props}
      onApprove={() => onDecide(approvalId, { approved: true })}
      onReject={(reason) => onDecide(approvalId, { approved: false, reason })}
      onEdit={(edits) => onDecide(approvalId, { approved: true, edits })}
    />
  );
}
