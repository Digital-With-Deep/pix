# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PIX (Primitives for Intelligent eXperiences) is an open-source design system for AI products, shipped from one token source to every platform. It's a pnpm monorepo (`packages/*`) publishing four npm packages under the `@pix-ui/*` scope.

## Commands

```sh
pnpm install
pnpm build          # builds all packages in dependency order (tokens → css → react/react-native)
pnpm test           # scripts/smoke-test.mjs — requires a build first
pnpm typecheck      # tsc --noEmit across packages
pnpm changeset      # add a changeset with your PR (required for release)
```

- **Build one package:** `pnpm --filter @pix-ui/tokens run build` (same for `css`, `react`, `react-native`).
- **No per-test runner.** `pnpm test` is a single smoke script — it loads every package (ESM + CJS), server-renders every React component with minimal props, checks `window.PIX` from the `<script>` bundle, verifies no legacy product names (`PACT`, `ReconBench`, etc.) leaked into `dist/`, and asserts token invariants (resolved aliases, unitless RN numbers). It reads from `dist/`, so **run `pnpm build` first** or it will fail on missing files.

## Build pipeline (order matters)

The packages form a strict chain — building out of order produces stale output:

1. **`@pix-ui/tokens`** — `src/pix.tokens.json` is the **single source of truth** for color, type, spacing, radius, shadow, motion. `build.mjs` (zero dependencies) resolves `{alias}` references per theme and emits every platform: CSS vars, SCSS, JS/TS (ESM+CJS+`.d.ts`), JSON, React Native (unitless numbers), iOS (Swift/SwiftUI), Android (XML + values-night + Compose Kotlin), and Flutter (Dart). **Never hand-edit `dist/` — edit the JSON and rebuild.**
2. **`@pix-ui/css`** — `build.mjs` reads `@pix-ui/tokens/css` from the tokens `dist/`, concatenates it with `src/base.css` + `src/components.css` into `dist/pix.css`.
3. **`@pix-ui/react`** — `tsup` bundles ESM/CJS + a minified `pix.global.js` IIFE (exposes `window.PIX`, maps `react`/`react-dom` to page globals), then copies hand-written `.d.ts` files and `cp ../css/dist/pix.css dist/styles.css`. **Depends on `@pix-ui/css` being built.**
4. **`@pix-ui/react-native`** — plain `tsc`; consumes tokens only (unitless RN export).

## Conventions

- **React components** live in `packages/react/src/components/<Name>/` as `<Name>.jsx` (implementation) + a **hand-written** `<Name>.d.ts` (the public contract — this is the type source, not generated). New components must be exported from both `src/index.js` and `src/index.d.ts`.
- Components are written with `React.createElement` and **inline styles**, not CSS-in-JS or `.css` imports. Styling uses CSS variables with a literal fallback: `var(--fg1, #1c1917)`. Never use raw hex without the `var(--token, …)` wrapper.
- **React Native** components in `packages/react-native/src` should mirror the React component prop names; they consume `@pix-ui/tokens/react-native` via a `usePixTheme()` provider, not CSS vars.
- Every React component accepts a `loading` prop that renders a skeleton in its own footprint.

## Design rules (enforced in review, some in the smoke test)

- **Claim ≠ truth:** a model's claim (`--claim`, red) and the verified answer (`--truth`, emerald) never share a color; authored faults are amber (`--fault`).
- Identifiers, IDs, amounts, model and tool names are monospace.
- 4.5:1 text contrast in light **and** dark; controls/focus rings 3:1; keyboard-reachable with accessible names; reduced-motion respected.
- Sentence case, no exclamation marks, no emoji in product chrome.

## Releasing

Add a changeset (`pnpm changeset`) with every PR. Merging to `main` opens a "release packages" PR; merging that publishes to npm. First-time publish setup is in `docs/PUBLISHING.md`.
