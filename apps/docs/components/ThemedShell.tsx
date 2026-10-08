'use client';
import * as React from 'react';
import { usePixThemeVars } from '../lib/use-pix-theme';
import { radiusCss } from '../lib/theme-compute';

// Wraps an example app and applies the theme saved in the /themes designer
// (accent, neutral, radius, font) for the current light/dark mode. With no
// saved theme it renders the app untouched, in the default PIX look.
export function ThemedShell({ children }: { children: React.ReactNode }) {
  const vars = usePixThemeVars();
  // Always render the same wrapper (display: contents, so it adds no box and
  // can't disturb the app's layout) — only the variables come and go. Custom
  // properties still inherit to descendants through display: contents.
  return (
    <div className="pix-themed-shell" style={{ display: 'contents', ...(vars ?? {}) } as React.CSSProperties}>
      {vars ? <style>{radiusCss('.pix-themed-shell')}</style> : null}
      {children}
    </div>
  );
}
