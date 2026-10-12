import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import type { CSSProperties } from 'react';

// Widen the docs shell to a shadcn-like full-width layout (fumadocs defaults to
// 97rem). --fd-layout-width is read by #nd-docs-layout for the content grid.
const wide = { '--fd-layout-width': '110rem' } as CSSProperties;

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={source.getPageTree()} containerProps={{ style: wide }} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
