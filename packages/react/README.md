# @pix-ui/react

React components for **PIX — Primitives for Intelligent eXperiences**. 47 components for AI products: responses, thinking traces, prompt input, execution traces, data tables, metrics, forms and layout.

```sh
npm i @pix-ui/react
```

```jsx
import "@pix-ui/react/styles.css"; // tokens + base + pix-* classes (optional but recommended)
import { AIResponse, PromptInput, DataTable, MetricCard, Button } from "@pix-ui/react";
```

- ESM + CJS, typed (`.d.ts` per component), marked `"use client"` for the Next.js App Router.
- Styling is inline and token-driven with fallbacks, so components render correctly even before the stylesheet loads. The stylesheet adds dark mode (`<html data-theme="dark">`) and element defaults.
- `dist/pix.global.js` is a `<script>` build exposing `window.PIX` (needs global `React`/`ReactDOM`).

See the [root README](../../README.md) for the component list and principles.
