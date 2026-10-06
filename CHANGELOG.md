# Changelog

All notable changes to PIX are recorded here, newest first. The four `@pix-ui/*` packages
are versioned together and follow [semantic versioning](https://semver.org). Per-package
release notes are also written to `packages/*/CHANGELOG.md` by Changesets at publish time.

This file is the source for the [changelog page](https://pixui.digitalwithdeep.com/docs/changelog)
on the docs site — edit here, not there.

## Unreleased

### Added

- Component pages now show multiple captioned states and variants per component, with usage
  guidance (when to use, anatomy, accessibility) alongside the live preview and prop table.
- A component showcase on the docs home page, built from real PIX components in light and dark.
- This changelog, published as a docs page generated from `CHANGELOG.md`.
- The PIX mark in the navigation bar, as the favicon, and on the social preview image.

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
