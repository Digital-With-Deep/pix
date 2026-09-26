# Contributing to PIX

Thanks for helping build **PIX — Primitives for Intelligent eXperiences**.

## Setup

```sh
pnpm install
pnpm build      # tokens → css → react, react-native
pnpm test       # smoke test: loads every package, renders every React component
pnpm typecheck
```

## Where things live

| Path | What |
| --- | --- |
| `packages/tokens/src/pix.tokens.json` | The single source of truth for colour, type, spacing, radius, shadow, motion. `build.mjs` generates every platform. |
| `packages/css/src` | Element defaults and `pix-*` classes for non-React use. |
| `packages/react/src/components/<Name>/` | `<Name>.jsx` (implementation) + `<Name>.d.ts` (the public contract). Export new files from `src/index.js` and `src/index.d.ts`. |
| `packages/react-native/src` | Native implementations; aim for the same prop names as the React component. |
| `examples/` | Static pages that load the local builds. |

## Rules of the system

- Style with tokens (`var(--accent)`, `usePixTheme().color.accent`), never raw hex, and keep the fallback in React inline styles (`var(--fg1, #1c1917)`).
- Text meets 4.5:1 contrast in light **and** dark; controls and focus rings 3:1.
- Identifiers, IDs, amounts, model and tool names are monospace.
- An AI claim and the ground truth never share a colour (`--claim` vs `--truth`).
- Every interactive element is reachable by keyboard and has an accessible name.
- Sentence case, no exclamation marks, no emoji in product chrome.

## Releasing

Add a changeset (`pnpm changeset`) with your PR. Merging to `main` opens a "release packages" PR; merging that publishes to npm.

By contributing you agree your work is released under the MIT License and to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
