'use client';
import * as React from 'react';
import { computeTheme, previewVars, type ThemeChoice } from './theme-compute';

const KEY = 'pix-theme';

export function saveTheme(choice: ThemeChoice) {
  try {
    localStorage.setItem(KEY, JSON.stringify(choice));
    window.dispatchEvent(new Event('pix-theme-change'));
  } catch {
    /* storage unavailable */
  }
}

export function loadTheme(): ThemeChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ThemeChoice) : null;
  } catch {
    return null;
  }
}

function isDark(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement;
  return el.classList.contains('dark') || el.getAttribute('data-theme') === 'dark';
}

// A stable string snapshot (raw theme JSON + mode) so useSyncExternalStore has
// a primitive to compare. JSON never contains "|", so the split is safe.
function snapshot(): string {
  let raw = '';
  try {
    raw = localStorage.getItem(KEY) ?? '';
  } catch {
    raw = '';
  }
  return `${raw}|${isDark() ? 'dark' : 'light'}`;
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('pix-theme-change', cb);
  window.addEventListener('storage', cb);
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  return () => {
    window.removeEventListener('pix-theme-change', cb);
    window.removeEventListener('storage', cb);
    obs.disconnect();
  };
}

/**
 * CSS-variable overrides for the saved designer theme in the current light/dark
 * mode, or null when none is saved. Reacts to theme changes (same tab) and to
 * the light/dark class flipping on <html>.
 */
export function usePixThemeVars(): Record<string, string> | null {
  const snap = React.useSyncExternalStore(subscribe, snapshot, () => '');
  return React.useMemo(() => {
    const sep = snap.lastIndexOf('|');
    const raw = snap.slice(0, sep);
    const mode = snap.slice(sep + 1) === 'dark' ? 'dark' : 'light';
    if (!raw) return null;
    let choice: ThemeChoice | null = null;
    try {
      choice = JSON.parse(raw) as ThemeChoice;
    } catch {
      return null;
    }
    return choice ? previewVars(computeTheme(choice), mode) : null;
  }, [snap]);
}
