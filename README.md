<p align="center"><img src="assets/pix-mark.svg" width="56" height="56" alt=""></p>

<h1 align="center">PIX</h1>
<p align="center"><b>Primitives for Intelligent eXperiences</b><br>An open-source design system for AI products — tokens, CSS, React and React Native from one source.</p>

<p align="center">
<a href="https://www.npmjs.com/package/@pix-ui/react"><img alt="npm" src="https://img.shields.io/npm/v/@pix-ui/react?label=%40pix-ui%2Freact"></a>
<a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-10b981"></a>
</p>

---

AI interfaces have their own primitives: a response that streams, a trace of what the model did, the sources it cited, a prompt with tools attached, the difference between what the model *claimed* and what is *true*. PIX makes those first-class, next to the usual buttons, tables and forms, and keeps them legible enough to defend in a review.

## Packages

| Package | For | Install |
| --- | --- | --- |
| [`@pix-ui/tokens`](packages/tokens) | Every platform: CSS vars, SCSS, JS/TS, JSON, **iOS** (Swift/SwiftUI), **Android** (XML + Compose), **Flutter**, React Native | `npm i @pix-ui/tokens` |
| [`@pix-ui/css`](packages/css) | Any web framework or plain HTML — `pix-*` classes | `npm i @pix-ui/css` |
| [`@pix-ui/react`](packages/react) | React 18+ / Next.js — 47 components | `npm i @pix-ui/react` |
| [`@pix-ui/react-native`](packages/react-native) | iOS & Android via React Native / Expo | `npm i @pix-ui/react-native` |

## Quick start

**React**

```jsx
import "@pix-ui/react/styles.css";
import { AIResponse, PromptInput, Button } from "@pix-ui/react";

export function Assistant() {
  return (
    <>
      <AIResponse
        model="gpt-5" duration="1.4s" tokens="2,140 tokens"
        text="Both runs skipped the certificate read."
        thinking={"Filtered 42 runs\nGrouped by the tool call each omits"}
        citations={[{ label: "run #0042", note: "execution trace" }]}
        onCopy={() => {}} onFeedback={(v) => {}}
      />
      <PromptInput placeholder="Ask a follow-up…" tools={["Replay run"]} />
      <Button variant="filled">Run evaluation</Button>
    </>
  );
}
```

**No build step** — `<script>` tags expose `window.PIX`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pix-ui/react/dist/styles.css">
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@pix-ui/react/dist/pix.global.js"></script>
<script>
  const { Button } = window.PIX;
  ReactDOM.createRoot(document.getElementById("app")).render(React.createElement(Button, null, "Hello"));
</script>
```

**Vue, Svelte, Angular, HTML** — `import "@pix-ui/css"` and use `<button class="pix-btn pix-btn--filled">`.

**React Native** — wrap in `<PixProvider>` and use `@pix-ui/react-native`.

**SwiftUI / Compose / Flutter** — copy `node_modules/@pix-ui/tokens/dist/{ios,compose,flutter}` into your app: `Color.Pix.accent`, `PixLightColors.accent`, `PixColors.light.accent`.

Dark mode everywhere: `data-theme="dark"` (web), device setting (native).

## Components

| Group | React | React Native |
| --- | --- | --- |
| **AI** | `AIResponse` `ThinkingTrace` `PromptInput` `InferenceChain` `ExecutionTrace` `FingerprintDiff` `InvariantPanel` `CodeEditor` `InlineCode` | `AIResponse` `ThinkingTrace` `PromptInput` |
| **Data** | `DataTable` `MetricCard` `BarChart` `RateBars` `CoverageMatrix` `StageFlow` `TaxonomyTree` `AuditLog` `UsageMeter` | `MetricCard` |
| **Inputs** | `Button` `Select` `MultiSelect` `RadioGroup` `Switch` `SearchField` `SavedSearch` `FormActions` `ProviderConfig` | `Button` `Switch` `TextField` |
| **Feedback** | `Alert` `AlertAction` `Callout` `Badge` `EmptyState` `Skeleton` `LicenseBanner` | `Callout` `Badge` `Skeleton` |
| **Layout & navigation** | `Page` `Stack` `Grid` `Split` `Tabs` `Menu` `Stepper` `Disclosure` `NextSteps` `GettingStarted` `PlanCard` `Avatar` `AvatarGroup` | `Stack` `Card` `Avatar` `Text` |

Every React component accepts `loading` to render a skeleton in its own footprint.

## Design principles

1. **Legible over impressive.** Verdicts in words, identifiers in monospace, no chart that exists only to look analytical.
2. **Show the work.** Reasoning, tool calls and sources sit one click from every answer.
3. **Claim ≠ truth.** What a model said (`--claim`, red) and the verified answer (`--truth`, emerald) never share a colour; authored faults are amber (`--fault`).
4. **Calm chrome.** Warm stone neutrals, one emerald accent used sparingly, sentence case, no emoji.
5. **Accessible by default.** 4.5:1 text contrast in both themes, keyboard reachable, reduced-motion respected.

## Examples

`examples/html-starter` (plain HTML), `examples/ai-patterns` (assistant page, sidebar panel, inline entry points) and `examples/pact-console` — a full agent-evaluation console built on PIX, where the system started.

Minimal per-framework starters, each installing PIX from npm:

| Starter | Framework | Package |
| --- | --- | --- |
| [`examples/nextjs`](examples/nextjs) | Next.js (App Router) | `@pix-ui/react` |
| [`examples/vite-react`](examples/vite-react) | Vite + React | `@pix-ui/react` |
| [`examples/angular`](examples/angular) | Angular (standalone components) | `@pix-ui/css` |

## Documentation

The docs site (component reference, guides, live previews) is built from [`apps/docs`](apps/docs) with Fumadocs and deployed to Firebase Hosting. It is not live yet — the URL will be `<your-project>.web.app` once a maintainer creates the Firebase project and adds the deploy secret, per [`docs/DEPLOY-DOCS.md`](docs/DEPLOY-DOCS.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Released under the [MIT License](LICENSE).
