'use client';
/* Mobile shell context: navigation helpers with animation hints, toasts, global sheets. */
import { createContext, useContext } from 'react';

export type GSheet = { kind: 'notifs' } | { kind: 'lang' } | { kind: 'apply'; id: string };
export type SwapAnim = 'push' | 'fade' | 'none';
export type ResetAnim = 'pop' | 'fade' | 'push';

export interface MShell {
  /** push a screen (slides in from the right) */
  go: (path: string) => void;
  /** replace the top screen, optionally animated */
  swap: (path: string, anim?: SwapAnim) => void;
  /** change only the query of the top screen (filters, tabs) — no animation, state kept */
  setQuery: (path: string) => void;
  /** switch bottom tab (crossfade) */
  tab: (path: string) => void;
  /** clear the stack and land on a root screen */
  reset: (path: string, anim?: ResetAnim) => void;
  back: () => void;
  toast: (msg: string, ok?: boolean) => void;
  sheet: GSheet | null;
  openSheet: (s: GSheet) => void;
  closeSheet: () => void;
  /** where sheets are portalled */
  host: HTMLElement | null;
  /** sheets report open/close so the stage can go inert and Escape closes the sheet first */
  sheetCount: (delta: 1 | -1) => void;
}

export const MCtx = createContext<MShell | null>(null);

export function useM() {
  const c = useContext(MCtx);
  if (!c) throw new Error('useM outside mobile shell');
  return c;
}

/** light haptic tick */
export const buzz = () => {
  try {
    // only after a real tap (Chrome logs an error for vibrate() without user activation)
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua && !ua.hasBeenActive) return;
    navigator.vibrate?.(8);
  } catch { /* not supported */ }
};

export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const D = (ms: number) => (reducedMotion() ? 1 : ms);

export interface ScreenProps {
  path: string;
  /** true while this screen is the top of the stack */
  active: boolean;
}

export function parsePath(path: string) {
  const u = new URL(path, 'http://x');
  return { pathname: u.pathname, seg: u.pathname.split('/').filter(Boolean), q: u.searchParams };
}
