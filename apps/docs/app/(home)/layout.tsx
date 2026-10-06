import type { Metadata } from 'next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

const title = 'PIX — Primitives for Intelligent eXperiences';
const description =
  'An open-source design system for AI products. Tokens, CSS, React and React Native from one source — with primitives for responses, reasoning, sources and the difference between what a model claimed and what is true.';

export const metadata: Metadata = {
  metadataBase: new URL('https://pixui.digitalwithdeep.com'),
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://pixui.digitalwithdeep.com',
    siteName: 'PIX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
