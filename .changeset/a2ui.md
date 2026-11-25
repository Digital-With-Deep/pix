---
"@pix-ui/a2ui": minor
---

Add `@pix-ui/a2ui`, so agents that speak A2UI (Agent-to-User Interface) protocol version 1.0 can render PIX components. It ships the PIX catalog (`@pix-ui/a2ui/catalog.json`, catalog id `https://pixui.digitalwithdeep.com/a2ui/catalogs/pix/v1/catalog.json`) with Text, Markdown, Button, Badge, Callout, Alert, MetricCard, DataTable, AIResponse, ToolCall, ApprovalCard, Conversation and Column, Row, Grid, Card and Divider layout, and an `A2UISurface` React renderer that processes `createSurface`, `updateComponents`, `updateDataModel` and `deleteSurface` messages, resolves data bindings and list templates, and reports approvals, rejections, edits and button presses to `onAction` as A2UI action messages.
