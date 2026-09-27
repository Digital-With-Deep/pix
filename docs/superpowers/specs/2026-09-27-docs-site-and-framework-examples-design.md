# PIX docs site & framework examples — design

**Date:** 2026-09-27
**Status:** Draft for review

## Purpose & intent

Build a public, adoption-driving documentation site for PIX — in the spirit of
[ui.shadcn.com](https://ui.shadcn.com/docs/installation) — that makes it dead-simple to drop
`@pix-ui/*` into a web app, with copy-pasteable installation steps per framework, browsable
component references with live previews, and API-accurate prop tables. Alongside it, ship
runnable starter projects for the three target frameworks.

Success looks like: a developer lands on the site, follows the installation guide for their stack
(Next.js, React/Vite, or Angular), and has a themed PIX component rendering within minutes; and
every component page shows a working preview next to the exact source they can copy.

**In scope (this iteration):** Next.js (App Router), React + Vite, Angular. Docs site with
getting-started, per-framework installation, dark mode, design principles/tokens, a curated set of
component pages, and a CSS-class reference.

**Deferred (later, same patterns):** Vue, Svelte, plain HTML/CDN (the existing
`examples/html-starter` already covers the no-build path), React Native / native token usage,
and full coverage of all 42 React components.

## Decisions (locked with the user)

| Decision | Choice |
| --- | --- |
| Docs framework | Next.js (App Router) + **Fumadocs** (MDX, sidebar/TOC, code blocks) |
| Rendering | **Static export** (`output: "export"`) |
| Hosting | **Firebase Hosting** (global CDN), deployed via `firebase deploy` |
| Search | Static client-side index (Fumadocs + Orama static) |
| Dogfooding | Docs chrome built with `@pix-ui/react` where practical |
| Live previews | **Example registry** (approach A): each demo is a real file; source is extracted by codegen |
| Prop tables | Generated from the hand-written `.d.ts` contracts |
| Target frameworks | Next.js, React/Vite, Angular |
| Example projects | Under `examples/`, install **published npm** packages, not in root build |

## Monorepo layout

Add `apps/*` to `pnpm-workspace.yaml` (packages stay under `packages/*`).

```
apps/
  docs/                      # Next.js + Fumadocs site (workspace member)
    app/                     # App Router; MDX served via Fumadocs
    content/docs/            # .mdx content (getting-started, installation, components, css)
    registry/                # real example files (the single source for previews + code)
      examples/<name>.tsx    # e.g. button-variants.tsx
    registry/__generated__/  # codegen output: source manifest + props.json (git-ignored)
    components/              # docs-only UI (Preview frame, CodeBlock, Sidebar…), dogfooding PIX
    scripts/
      build-registry.mjs     # extract raw source of each registry example → manifest
      build-props.mjs        # parse packages/react .d.ts → props.json
    next.config.mjs          # output: "export"
    source.config.ts         # Fumadocs source config
    firebase.json            # Firebase Hosting config (public: out/)
    package.json
examples/
  nextjs/                    # runnable starter (published npm deps)
  vite-react/                # runnable starter (published npm deps)
  angular/                   # runnable starter (@pix-ui/css via pix-* classes)
  html-starter/  ai-patterns/  pact-console/   # existing, unchanged
```

The docs app depends on `@pix-ui/react` and `@pix-ui/css` via `workspace:*` so the site always
reflects the local build. The `examples/*` starters depend on the **published** versions so they
are honest "copy this to start" projects; they have their own installs and are not part of root
`pnpm build`/`pnpm test`.

## Units & responsibilities

Each unit has one job and a clear interface, so it can be built and tested on its own.

### 1. Registry (source of truth for previews)
- **What:** a directory of real, type-checked example components (`registry/examples/*.tsx`) plus,
  for CSS/Angular demos, HTML snippet + Angular-template pairs (`registry/examples/*.css.ts`
  exporting `{ html, angular }` strings).
- **Interface:** `build-registry.mjs` emits `registry/__generated__/index.ts` mapping
  `name → { Component, source, lang }`. React examples contribute both a live `Component` and the
  file's raw source; CSS examples contribute rendered HTML markup (framework-agnostic visual) and
  the Angular template as the copy source.
- **Depends on:** the example files only. No network.

### 2. Preview component (`<Preview name>`)
- **What:** the framed live-preview + Code-tab widget used inside MDX.
- **Interface:** `name` (registry key), optional `lang` for the code tab label. Renders
  `registry[name].Component` in a bordered, theme-aware frame; a tab toggles to a syntax-highlighted,
  copyable code block of `registry[name].source`.
- **Depends on:** the generated registry, the docs `CodeBlock`, and PIX tokens for the frame.

### 3. Props table (`<PropsTable component>`)
- **What:** renders the public API of a component.
- **Interface:** `component` (name). Reads `registry/__generated__/props.json`.
- **Depends on:** `build-props.mjs`, which parses `packages/react/src/components/<Name>/<Name>.d.ts`
  into `{ name, type, required, default, description }[]`. Uses the TypeScript compiler API for a
  robust parse (not regex). If a component's `.d.ts` can't be parsed, the build fails loudly rather
  than emitting a partial table.

### 4. Docs chrome (dogfooded)
- **What:** site shell — nav, sidebar, tabs, callouts, cards, buttons — built with `@pix-ui/react`
  where it fits Fumadocs' slots; Fumadocs layout primitives fill the rest. Using PIX here is the
  proof-of-system and surfaces real gaps.
- **Interface:** standard Fumadocs layout config + MDX component overrides mapping
  (`h1..h6`, `pre`, `Callout`, `Tabs`, etc.) to PIX-styled equivalents.

### 5. Content (MDX)
- **What:** the prose. One file per page under `content/docs/`.
- **Interface:** MDX with the shared component set (`Preview`, `PropsTable`, `Tabs`, `Callout`,
  `Steps`). Frontmatter: `title`, `description`.

### 6. Example starters
- **What:** three standalone apps a user can copy. Each: minimal app rendering a few PIX components,
  dark-mode toggle, and a README with the exact install/run commands.
- **Interface:** `examples/<framework>/README.md` + normal per-framework scripts.

## Content / information architecture

Sidebar groups (mirrors shadcn's shape):

- **Getting started** — Introduction · Installation (overview) · Dark mode · Design principles ·
  Tokens
- **Installation** — Next.js · Vite (React) · Angular
  - Each guide: install packages → import `@pix-ui/react/styles.css` (or `@pix-ui/css`) → theme
    setup (`data-theme`) → first component → dark-mode toggle → link to the matching `examples/*`
    starter.
- **Components** — one page per component. Initial curated set (~10): Button, Badge, Callout, Alert,
  Tabs, Select, DataTable, MetricCard, AIResponse, PromptInput. Each page: intro, `<Preview>` +
  variants, `<PropsTable>`, notes.
- **CSS classes** — reference for the `@pix-ui/css` `pix-*` classes (the Angular / framework-agnostic
  path), grouped as in `components.css`.

## Framework-specific notes

- **Next.js:** App Router. Import `@pix-ui/react/styles.css` in `app/layout.tsx`; components already
  ship `"use client"` where needed. Dark mode via `data-theme` on `<html>` (+ optional
  `next-themes`).
- **Vite + React:** import the stylesheet in `main.tsx`; identical component usage.
- **Angular:** consumes `@pix-ui/css` — add `@pix-ui/css` to `styles` in `angular.json`, use
  `pix-*` classes in templates (`<button class="pix-btn pix-btn--filled">`). The AI primitives
  (`pix-response`, `pix-thinking`, `pix-prompt`, `pix-claim`/`pix-truth`/`pix-fault`) cover the
  agnostic path. Dark mode via `data-theme="dark"` on a root element.

## Data flow

```
packages/react/**/*.d.ts ──build-props.mjs──▶ props.json ─┐
apps/docs/registry/examples/* ─build-registry.mjs─▶ index.ts ─┤
                                                              ├─▶ MDX (<Preview>, <PropsTable>)
content/docs/**/*.mdx ────────────────────────────────────────┘
                                   │ next build (output: export)
                                   ▼
                              apps/docs/out/  ──firebase deploy──▶ Firebase Hosting CDN
```

Codegen runs in a `prebuild`/`predev` step so previews and prop tables are always current.

## Error handling

- Codegen validates: every `registry/examples/*` has a unique name; `build-props` fails on an
  unparseable `.d.ts`.
- A build check asserts every `<Preview name>`/`<PropsTable component>` referenced in MDX resolves
  to a generated entry (fail the build on a dangling reference).
- Static export: no server-only APIs; search index is generated at build time.

## Testing & CI

- **Docs unit checks:** `build-registry` and `build-props` each have a small Node test asserting a
  known example/`.d.ts` produces the expected manifest shape.
- **Docs build:** `pnpm --filter docs build` (runs codegen + `next build`) is the integration smoke
  test — it typechecks the registry and MDX and fails on dangling `<Preview>`/`<PropsTable>` refs.
- **Examples:** CI builds the `examples/nextjs` and `examples/vite-react` starters. The
  `examples/angular` build is included but allowed to be a separate/optional job (heavier toolchain).
- **New workflow** `.github/workflows/docs.yml`: install → build packages → build docs → (on
  `main`) `firebase deploy`. Firebase auth via a `FIREBASE_SERVICE_ACCOUNT` repo secret and the
  `FirebaseExtended/action-hosting-deploy` action (PR previews + prod on merge).

## Deployment (Firebase Hosting)

- `apps/docs/firebase.json`: `hosting.public = "out"`, SPA-style rewrites off (static export already
  emits per-route HTML), sensible cache headers for `_next/static`.
- One-time: create a Firebase project, enable Hosting, generate a service-account key, add it as the
  `FIREBASE_SERVICE_ACCOUNT` GitHub secret. (Documented in `docs/PUBLISHING.md` or a new
  `docs/DEPLOY-DOCS.md`.)

## Phasing (for the implementation plan)

1. **Scaffold:** `apps/docs` (Next.js + Fumadocs, static export), workspace wiring, one placeholder
   MDX page building locally.
2. **Registry + Preview + CodeBlock:** codegen + the preview widget; one working component preview.
3. **Props codegen + PropsTable:** `.d.ts` parser; one working prop table.
4. **Dogfooded chrome:** MDX component overrides + layout using PIX.
5. **Content:** getting-started, 3 installation guides, ~10 component pages, CSS reference.
6. **Example starters:** Next.js, Vite, Angular + READMEs.
7. **CI + Firebase deploy:** `docs.yml`, example builds, hosting config, deploy docs.

## Open questions / assumptions

- Domain: assume a Firebase-provided domain initially (`<project>.web.app`); a custom domain can be
  attached later.
- The curated 10-component set proves the pattern; expanding to all 42 is follow-up work using the
  same `<Preview>`/`<PropsTable>` machinery.
- TypeScript in `apps/docs` and the React/Vite examples; Angular example uses its standard CLI setup.
