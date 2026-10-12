import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { findNeighbour } from 'fumadocs-core/page-tree';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';

const CHEVRON_L = 'M15 18l-6-6 6-6';
const CHEVRON_R = 'M9 18l6-6-6-6';

function Chevron({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

// Compact arrow buttons for the top action row (shadcn-style prev/next).
// `name` is typed `unknown` (only read for the aria-label, never rendered) so
// it doesn't depend on which @types/react copy fumadocs' findNeighbour resolves
// — the two can diverge in the monorepo and break the type check otherwise.
function NavArrow({ dir, url, name }: { dir: 'prev' | 'next'; url: string; name: unknown }) {
  return (
    <Link
      href={url}
      aria-label={`${dir === 'prev' ? 'Previous' : 'Next'}: ${typeof name === 'string' ? name : ''}`}
      className="inline-flex size-8 items-center justify-center rounded-md border text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      <Chevron d={dir === 'prev' ? CHEVRON_L : CHEVRON_R} />
    </Link>
  );
}


export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const neighbours = findNeighbour(source.getPageTree(), page.url);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
        <div className="ms-auto flex items-center gap-1.5">
          {neighbours.previous ? <NavArrow dir="prev" url={neighbours.previous.url} name={neighbours.previous.name} /> : null}
          {neighbours.next ? <NavArrow dir="next" url={neighbours.next.url} name={neighbours.next.name} /> : null}
        </div>
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
