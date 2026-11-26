# Changelog

All notable changes to PIX are recorded here, newest first. The four `@pix-ui/*` packages
are versioned together and follow [semantic versioning](https://semver.org). Per-package
release notes are also written to `packages/*/CHANGELOG.md` by Changesets at publish time.

This file is the source for the [changelog page](https://pixui.digitalwithdeep.com/docs/changelog)
on the docs site — edit here, not there.

## Unreleased — PIX 0.3

### Fixed

- Form field borders now meet the 3:1 non-text contrast of WCAG (Web Content Accessibility
  Guidelines) 2.1 success criterion 1.4.11 on every surface, in light and dark ([#45](https://github.com/Digital-With-Deep/pix/issues/45)). Most had been
  1.2:1 to 1.5:1. New colour tokens in `@pix-ui/tokens`: `border-field` (3.34:1 or more in
  light, 3.40:1 or more in dark), `border-field-hover` and `focus-ring` (5.03:1 and 7.89:1 or more).
  `TextField`, `Textarea`, `Select`, `MultiSelect`, `SearchField`, `Checkbox`, `RadioGroup`, the
  off `Switch` track and `PromptInput` use them in `@pix-ui/react`, as do the matching `pix-*`
  classes in `@pix-ui/css` and `TextInput`, `PromptInput` and `Switch` in
  `@pix-ui/react-native`. Cards, tables and dividers keep the lighter `border`. The focus border
  and the global `:focus-visible` outline move from `accent` (2.54:1 on white) to `focus-ring`.
  `PromptInput` now shows a focus border, and CSS fields gain a hover border.
- `Switch` without a `label` dropped its `aria-label`, so a bare switch had no accessible name. It
  now passes `aria-label` and `aria-labelledby` to the track. `AuditLog` histogram bars are
  labelled with their time bucket and event count ([#45](https://github.com/Digital-With-Deep/pix/issues/45)).

### Added

- `pnpm test` runs a token contrast test (`scripts/contrast-test.mjs`) that recomputes body and
  secondary text (4.5:1), field borders, the invalid border and the focus ring (3:1) on every
  surface from the built tokens, and lists any pair that falls short.
- The screenshot workflow also checks every live example on the component pages for form
  controls and buttons without an accessible name and images without alt text
  (`scripts/a11y-pages.mjs`).

## Unreleased — PIX 0.2

PIX 0.2: components for agent interfaces, the everyday basics around them, and new ways to build
with PIX from AI coding tools and agent frameworks. Each entry names its pull request.

### Added

- **Agent interface components** in `@pix-ui/react` ([#32](https://github.com/Digital-With-Deep/pix/pull/32)):
  - `ApprovalCard`, the human-in-the-loop (HITL) step: what an agent wants to do, the risk,
    whether it can be undone, a before and after table, evidence chips and an optional countdown.
    Approve, reject (optionally with a required reason) or edit the values inline. A decided card
    stays as a receipt.
  - `ToolCall`: one tool call with its name, status (queued, running, done, failed or waiting for
    approval), input, output, error, duration and a Retry button. It opens by itself when it needs
    attention.
  - `Conversation`: a chat thread that keeps streaming text in view, stops following when the
    reader scrolls up and offers a jump back to the latest message. Turns can hold any PIX
    component.
  - `Markdown`: a renderer for model output with no dependencies. It builds React elements, never
    injects HTML (HyperText Markup Language), and holds back half-written syntax while it streams.
  - `AIResponse` streams: the new `streaming` status renders text as Markdown with a caret and a
    Stop button, and a new `markdown` prop (on by default) turns Markdown rendering on or off.
- **Trust loop components** ([#33](https://github.com/Digital-With-Deep/pix/pull/33)), showing what an agent plans, what an answer rests on, how
  far to trust it and what the agent already did:
  - `PlanView`: the steps an agent intends to take, with substeps and per-step status, and
    Proceed, Edit plan and Do it myself before it runs, then live progress and a summary.
  - `InlineCitation` and `SourcePanel`: a numbered source marker next to a claim, and a panel of
    sources with the quoted passage, each marked verified, unverified or contradicted.
  - `ConfidenceBadge`: confident, low confidence, needs review or check failed, with an optional
    score, scope and reason. It is also in `@pix-ui/react-native`, where the reason shows on tap.
  - `ActionHistory`: what agents did, newest first, with an Undo button while each action's
    undo window is open, and filters by agent and status.
  - `AutonomySetting`: a four-level control for how far an agent may go on a task without asking,
    from Suggest only to Act on its own.
  - The Sentinel block now uses `ConfidenceBadge` and the citation components.
- **Basics pack** ([#34](https://github.com/Digital-With-Deep/pix/pull/34)), the everyday parts a product needs around the agent components, so
  teams don't need a second UI (user interface) kit:
  - `Dialog`: a modal with focus trapping, Escape to close, focus returned to the opener, sizes,
    and an `alertdialog` role for destructive confirmations.
  - `Popover` and `Tooltip`: anchored overlays. Tooltip waits 400 ms on hover and opens at once on
    keyboard focus.
  - `Toast`, `ToastProvider` and `useToast()`: stacked notifications in the PIX tones (info,
    truth, claim and warn). A toast with an action stays until dismissed, so keyboard users can
    reach its button.
  - `TextField`, `Textarea` and `Checkbox`: label, hint, error, required marker, a character
    count, and an indeterminate checkbox state.
  - `Card`: title, description, header action, body and footer.
  - `@pix-ui/css` gains matching `pix-card__*`, `pix-field__*` and `pix-checkbox*` classes.
- **Ways in for AI coding tools** ([#35](https://github.com/Digital-With-Deep/pix/pull/35)):
  - `@pix-ui/mcp`, an MCP (Model Context Protocol) server with no runtime dependencies. Run
    `npx @pix-ui/mcp`, or add it to Claude Code with `claude mcp add pix -- npx -y @pix-ui/mcp`.
    It gives an agent three tools: `list_components`, `get_component` (props, imports, docs text
    and example source) and `suggest_component` (ranks components for a plain-language
    description of a screen).
  - A shadcn-compatible registry: every docs example is published as an item, and
    `npx shadcn add https://pixui.digitalwithdeep.com/r/<example>.json` installs `@pix-ui/react`
    and adds that example to the project.
  - A "Use PIX with AI coding tools" docs page covering the registry, the MCP server and
    `llms.txt`.
- **`@pix-ui/adapters`** ([#36](https://github.com/Digital-With-Deep/pix/pull/36)): turns agent event streams into PIX
  props with a pure `applyEvent(state, event)` reducer that works with `useReducer`. It reads
  Vercel AI SDK (software development kit) UI message stream parts, AG-UI (Agent-User Interaction
  protocol) events and Google ADK (Agent Development Kit) events, and produces messages for
  `Conversation` and props for `ToolCall` and `ApprovalCard`, with helpers for resolving
  approvals and reading a server-sent events (SSE) stream. No dependencies and no React import.
- **`examples/agent-starter`** ([#36](https://github.com/Digital-With-Deep/pix/pull/36)): a Vite, React and TypeScript
  project with a mock agent (no network, no keys) that streams text, runs a tool call and stops
  on an approval card before it acts. Docs gain "Connect an agent" and "Agent starter" guides.
- **`@pix-ui/a2ui`** ([#37](https://github.com/Digital-With-Deep/pix/pull/37)): a PIX catalog and React renderer for A2UI
  (Agent-to-User Interface) v1.0, the open protocol for interfaces that an agent describes. It
  handles surface, component and data model messages, resolves data bindings and functions, and
  sends approve, reject and edit on an `ApprovalCard` back to the agent as actions. A new docs page
  lists the supported components and what is not mapped yet.
- **Agent layouts** on the Blocks page ([#38](https://github.com/Digital-With-Deep/pix/pull/38)), each copyable from its Code tab:
  - Copilot, an agent chat app with tool calls in the thread, an approval card and a live plan.
  - Approvals, an approvals desk with bulk approve, undo and per-task autonomy.
  - Research, a cited research assistant with per-claim confidence and a source panel.
  - Workspace, the settings page where a team sets up an agent.
- **Helm**, a new block that shows a COO's (Chief Operating Officer's) working day at a fictional
  company run as a system of action rather than only a system of intelligence. Agents do the work
  in the background and bring forward only the decisions a person must make: a decision queue of
  approval cards, a Running now panel of live tool calls and a plan, a "Done without you" action
  history with undo, autonomy per agent, and a chief of staff agent to ask. Approving a decision
  starts its tool call.
- A "Use PIX with Claude" docs page ([#38](https://github.com/Digital-With-Deep/pix/pull/38)): add the PIX MCP server to Claude Code, install
  components from the registry, use `llms.txt`, start from a `CLAUDE.md` snippet and try starter
  prompts.
- A screenshot workflow ([#38](https://github.com/Digital-With-Deep/pix/pull/38)): `pnpm screenshots` renders light and dark PNG (Portable
  Network Graphics) images of the new components and layouts from the static docs build, and a
  GitHub Actions workflow publishes them to the `pix-screenshots` branch.
- Component pages now show multiple captioned states and variants per component, with usage
  guidance (when to use, anatomy, accessibility) alongside the live preview and prop table.
- A component showcase on the docs home page, built from real PIX components in light and dark.
- This changelog, published as a docs page generated from `CHANGELOG.md`.
- The PIX mark in the navigation bar, as the favicon, and on the social preview image.

### Fixed

- Links are only rendered for safe schemes in `Markdown`, `AIResponse` citations and
  `ApprovalCard` evidence: `http`, `https`, `mailto`, same-site paths and anchors. Anything else,
  such as a `javascript:` link or a protocol-relative `//` link, renders as plain text ([#32](https://github.com/Digital-With-Deep/pix/pull/32)).
- `Markdown` no longer freezes the page when a stream pauses on a line that is only `|` (the start
  of a table) or on an indented list item with no parent ([#32](https://github.com/Digital-With-Deep/pix/pull/32)).
- `Markdown` no longer loops forever on nested inline syntax, such as a link inside bold text,
  which had run the docs build out of memory ([#32](https://github.com/Digital-With-Deep/pix/pull/32)).

## 2026-10-06 — Custom domain and repository hygiene

### Added

- The docs site is served from the custom domain `pixui.digitalwithdeep.com`, in addition to the
  Firebase default URLs.

### Changed

- Firebase and Google Cloud service-account key files are ignored by git so they cannot be
  committed by accident.

## 2026-09-28 — Docs site and framework starters

### Added

- Documentation site (`apps/docs`) built with Fumadocs and exported as static files for
  Firebase Hosting, deployed automatically on every push to `main`.
  - Live component previews with a copyable code tab, driven by an example registry.
  - Prop tables generated from each component's hand-written `.d.ts` contract.
  - Getting started, install guides for Next.js, Vite and Angular, dark mode, design principles
    and a CSS class reference.
  - Component pages for Button, Badge, Callout, Alert, Tabs, Select, DataTable, MetricCard,
    AIResponse and PromptInput, with a build check that fails on a reference to a missing
    preview or component.
- Framework starters — Next.js (App Router), Vite + React and Angular projects that install PIX
  from npm.
- Continuous integration that builds the docs and the React starters, then deploys the docs.

### Fixed

- The docs test script runs on every supported Node.js version, not only Node 21 and newer.

## 0.1.0 — 2026-09-26

### Added

- Initial public release of the four packages:
  - `@pix-ui/tokens` — one token source generating CSS variables, SCSS, JS/TS, JSON, iOS
    (Swift/SwiftUI), Android (XML + Jetpack Compose), Flutter and React Native, with light and
    dark values for every colour.
  - `@pix-ui/css` — framework-agnostic `pix-*` classes for Vue, Svelte, Angular or plain HTML.
  - `@pix-ui/react` — React components for AI products: responses, thinking traces, prompt
    inputs, data tables, metrics and app primitives, shipped as ESM, CommonJS and a `window.PIX`
    script build, each typed by a hand-written contract.
  - `@pix-ui/react-native` — a theme provider and native components for iOS and Android.
- Dark mode across every platform: `data-theme="dark"` on the web, the device setting on native.
