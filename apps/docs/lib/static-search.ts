import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

/**
 * Search server built from the docs content source.
 *
 * `staticGET` (re-exported by `app/api/search/route.ts`) is prerendered by
 * Next.js into a static JSON asset at build time when `output: 'export'` is
 * set, so it carries no server/runtime dependency in the exported site. The
 * client side consumes it via `staticClient` from
 * `fumadocs-core/search/client/orama-static` (see `components/search.tsx`).
 *
 * See: https://www.fumadocs.dev/docs/headless/search/orama#static-export
 */
export const searchAPI = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
