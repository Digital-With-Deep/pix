'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@pix-ui/react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center text-center flex-1 gap-4 px-4">
      <h1 className="text-3xl font-bold">PIX</h1>
      <p className="max-w-md" style={{ color: 'var(--fg2, #52525b)' }}>
        Primitives for Intelligent eXperiences — an open-source design system for AI products.
      </p>
      <Button variant="primary" onClick={() => router.push('/docs')}>
        Go to docs
      </Button>
    </div>
  );
}
