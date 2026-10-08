// Maps a {accent, neutral, radius, font} choice to the CSS variables PIX
// components actually read, mirroring PIX's own token-CSS structure:
//   :root  → raw scales (neutral→zinc+stone, accent→emerald) + semantic LIGHT + radius + font
//   .dark  → semantic DARK
// PIX components read the raw scales directly for accents/borders and the
// semantic tokens (--fg*, --surface, --border, --accent…) for everything that
// flips between light and dark — so overriding all three re-themes them fully.
// The meaning colours (--claim red, --truth emerald, --fault amber) are left
// untouched, so a theme never collapses the claim-vs-truth distinction.
import { palette, type Shade } from './tailwind-palette';

export interface ThemeChoice {
  accent: string;
  neutral: string;
  radius: number; // base (radius-lg) in px
  font: string;
}

export const RADII = [
  { label: 'Square', px: 0 },
  { label: 'Small', px: 4 },
  { label: 'Default', px: 6 },
  { label: 'Medium', px: 8 },
  { label: 'Large', px: 10 },
  { label: 'Full', px: 16 },
];

export const FONTS = [
  { id: 'system', label: 'System', stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { id: 'inter', label: 'Inter', stack: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: 'serif', label: 'Serif', stack: 'Georgia, Cambria, "Times New Roman", Times, serif' },
];

const SHADES: Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return `rgb(${n(0)} ${n(2)} ${n(4)} / ${a})`;
}

function radiusScale(base: number): Record<string, string> {
  const r = (n: number) => `${Math.max(0, Math.round(n))}px`;
  return {
    '--radius-sm': r(base / 3),
    '--radius-md': r((base * 2) / 3),
    '--radius-lg': r(base),
    '--radius-xl': r((base * 4) / 3),
    '--radius-2xl': r((base * 5) / 3),
  };
}

export interface ComputedTheme {
  common: Record<string, string>; // raw scales + radius + font (mode-independent)
  light: Record<string, string>; // semantic light
  dark: Record<string, string>; // semantic dark
}

export function computeTheme(c: ThemeChoice): ComputedTheme {
  const N = palette[c.neutral];
  const A = palette[c.accent];

  // Raw scales: PIX uses emerald as the accent and zinc/stone as the neutrals.
  const common: Record<string, string> = {};
  for (const sh of SHADES) {
    common[`--emerald-${sh}`] = A[sh];
    common[`--zinc-${sh}`] = N[sh];
    common[`--stone-${sh}`] = N[sh];
  }
  Object.assign(common, radiusScale(c.radius), { '--font-sans': c.font });

  const light: Record<string, string> = {
    '--bg': '#ffffff',
    '--bg-subtle': N[50],
    '--bg-muted': N[100],
    '--surface': '#ffffff',
    '--surface-alt': N[50],
    '--fg1': N[900],
    '--fg2': N[600],
    '--fg3': N[500],
    '--fg-muted': N[400],
    '--fg-inverse': '#ffffff',
    '--border': N[200],
    '--border-strong': N[300],
    '--divider': N[100],
    '--accent': A[500],
    '--accent-hover': A[600],
    '--accent-bg': A[50],
    '--accent-fg': A[700],
  };

  const dark: Record<string, string> = {
    '--bg': N[950],
    '--bg-subtle': N[900],
    '--bg-muted': N[800],
    '--surface': N[900],
    '--surface-alt': N[800],
    '--fg1': N[100],
    '--fg2': N[400],
    '--fg3': N[500],
    '--fg-muted': N[600],
    '--fg-inverse': N[900],
    '--border': N[800],
    '--border-strong': N[700],
    '--divider': N[800],
    '--accent': A[400],
    '--accent-hover': A[300],
    '--accent-bg': rgba(A[500], 0.1),
    '--accent-fg': A[400],
  };

  return { common, light, dark };
}

/** Flat style object for the preview pane in a given mode. */
export function previewVars(t: ComputedTheme, mode: 'light' | 'dark'): Record<string, string> {
  return { ...t.common, ...(mode === 'light' ? t.light : t.dark) };
}

function block(sel: string, vars: Record<string, string>): string {
  return `${sel} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
}

export function toCss(t: ComputedTheme): string {
  return block(':root', { ...t.common, ...t.light }) + '\n\n' + block('[data-theme="dark"], .dark', t.dark) + '\n';
}
