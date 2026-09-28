# docs

This is the PIX documentation site — a Next.js app built with [Fumadocs](https://fumadocs.dev) that documents the `@pix-ui` component library. See the [PIX repository](https://github.com/Digital-With-Deep/pix) for the rest of the monorepo, including the component packages this site documents.

It is a Next.js app with [Static Export](https://nextjs.org/docs/app/guides/static-exports) configured.

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

Collections are defined with the [Macro API](https://fumadocs.dev/docs/mdx/macro) in `lib/source.ts`.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn more

- [PIX repository](https://github.com/Digital-With-Deep/pix) - the monorepo this site documents, including `@pix-ui/react` and `@pix-ui/css`.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Fumadocs](https://fumadocs.dev) - learn about the framework powering this site.
