import type { Metadata } from 'next';
import { BlockViewer } from '@/components/BlockViewer';

export const metadata: Metadata = {
  title: 'Blocks — PIX',
  description:
    'Composition patterns built entirely from PIX components — an AI chat assistant, an LLM eval console, an agent run console and an AI code-review surface. Preview, read the code, copy.',
};

const faint = 'var(--fg3, #78716c)';
const muted = 'var(--fg2, #52525b)';
const ink = 'var(--fg1, #1c1917)';

export default function BlocksPage() {
  return (
    <main className="mx-auto w-full px-6" style={{ color: ink, paddingTop: 64, paddingBottom: 80, maxWidth: 1360 }}>
      <div style={{ font: '600 12px var(--font-mono, ui-monospace, Menlo, monospace)', letterSpacing: '0.08em', textTransform: 'uppercase', color: faint }}>Blocks</div>
      <h1 style={{ font: '700 clamp(30px, 4vw, 44px)/1.1 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.02em', margin: '12px 0 10px' }}>
        Composition patterns, built from the primitives.
      </h1>
      <p style={{ maxWidth: 640, fontSize: 17, lineHeight: 1.6, color: muted, margin: '0 0 36px' }}>
        Full product UIs assembled entirely from PIX components — no custom one-offs. Preview each at
        any size, read the source, and copy it into your app.
      </p>
      <BlockViewer />
    </main>
  );
}
