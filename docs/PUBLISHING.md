# Publishing PIX (first release)

One-time setup, about 15 minutes.

1. **npm org** — sign in at npmjs.com → *Add Organization* → name it `pix-ui` (free for public packages). This reserves the `@pix-ui/*` scope.
2. **GitHub repo** — the repo lives at `github.com/Digital-With-Deep/pix`. Wire it up and push:
   ```sh
   git remote add origin git@github.com:Digital-With-Deep/pix.git
   git push -u origin main
   ```
3. **Token** — npmjs.com → Access Tokens → *Generate New Token* (Granular, publish access to `@pix-ui`). Add it to the GitHub repo as the secret `NPM_TOKEN`.
4. **Let the Release workflow open its PR** — GitHub repo → *Settings* → *Actions* → *General* → *Workflow permissions*: tick **Allow GitHub Actions to create and approve pull requests** and save. Without it the Release workflow builds the "Version Packages" branch but fails with "GitHub Actions is not permitted to create or approve pull requests", so nothing reaches npm. If the token in step 3 only covers named packages, give it the whole `@pix-ui` scope so new packages (such as `@pix-ui/adapters`, `@pix-ui/a2ui` and `@pix-ui/mcp`) can be published for the first time.
5. **First publish** — either merge a changeset (the Release workflow publishes), or from your machine:
   ```sh
   pnpm install && pnpm build && pnpm test
   npm login
   pnpm -r --filter "./packages/*" publish --access public
   ```
6. **Check** — `npm view @pix-ui/react` and try `examples/html-starter` with the jsDelivr URLs.

Before going public, replace the placeholder contact in `CODE_OF_CONDUCT.md`.

## Using it before it's on npm

```sh
pnpm build
cd packages/react && npm pack   # → pix-ui-react-0.1.0.tgz
cd your-app && npm i /path/to/pix-ui-tokens-0.1.0.tgz /path/to/pix-ui-css-0.1.0.tgz /path/to/pix-ui-react-0.1.0.tgz
```
