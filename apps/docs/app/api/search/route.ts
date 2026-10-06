import { searchAPI } from '@/lib/static-search';

// Prerendered to a static JSON asset by `next build` (output: 'export');
// this route carries no server/runtime dependency in the exported site.
export const revalidate = false;

export const { staticGET: GET } = searchAPI;
