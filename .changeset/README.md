# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets). Every PR that
changes a published `@pix-ui/*` package should include a changeset:

```sh
pnpm changeset
```

Pick the affected packages and a bump (patch/minor/major), and write a short summary — it becomes the
changelog entry. Merging to `main` opens a "Version Packages" PR; merging that PR publishes to npm via
the release workflow.
