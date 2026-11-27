# @pix-ui/a2ui

## 0.1.0

### Minor Changes

- 696da89: Render the A2UI (Agent-to-User Interface) 1.0 basic catalog's inputs and containers with PIX. The PIX catalog in `@pix-ui/a2ui` gains `TextField`, `CheckBox`, `ChoicePicker`, `Slider` and `DateTimeInput`, with values two-way bound to the data model and failed `@checks` shown on the field, plus `Image`, `Tabs`, `Modal` and `List`, and the `regex`, `length`, `numeric` and `email` validation functions. `@pix-ui/react` adds `Slider`, a token-styled native range input with a label, value display and min and max labels, and `DateField`, native date, time and date-and-time inputs with label, hint and error. `RadioGroup` gains `hint` and `error`.
- 7b7e906: Add `@pix-ui/a2ui`, so agents that speak A2UI (Agent-to-User Interface) protocol version 1.0 can render PIX components. It ships the PIX catalog (`@pix-ui/a2ui/catalog.json`, catalog id `https://pixui.digitalwithdeep.com/a2ui/catalogs/pix/v1/catalog.json`) with Text, Markdown, Button, Badge, Callout, Alert, MetricCard, DataTable, AIResponse, ToolCall, ApprovalCard, Conversation and Column, Row, Grid, Card and Divider layout, and an `A2UISurface` React renderer that processes `createSurface`, `updateComponents`, `updateDataModel` and `deleteSurface` messages, resolves data bindings and list templates, and reports approvals, rejections, edits and button presses to `onAction` as A2UI action messages.

### Patch Changes

- Updated dependencies [696da89]
- Updated dependencies [3d70f12]
- Updated dependencies [8f3df37]
- Updated dependencies [60def1d]
- Updated dependencies [b9420d0]
- Updated dependencies [df95706]
- Updated dependencies [de11087]
- Updated dependencies [f1eb565]
  - @pix-ui/react@0.2.0
