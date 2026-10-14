'use client';
/* Zariya app state — shared by the mobile and desktop layouts, so switching layout
   (rotating a tablet, resizing a window) never loses progress. Persisted to localStorage.
   No account needed: everything works for a guest; the profile is prefilled with a sample
   learner (Ananya) that the person can edit or clear.

   Use:  const { s, set, t, L, lang } = useZ();
         set(d => { d.saved.sewing = true })        // immer-style mutate on a clone
*/
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ZARIYA, type Bi, type Course, type Lang } from './data';
import { EXTRA } from './strings';

export type ThemePref = 'system' | 'light' | 'dark';

export interface ZState {
  v: 1;
  lang: Lang;
  theme: ThemePref;
  bigText: boolean;
  readAloud: boolean;
  /** onboarding is optional: false until the person finishes or skips it; never blocks the app */
  introSeen: boolean;
  profile: { name: string; phone: string; village: string; district: string; state: string; education: string; card: 'AAY' | 'BPL' | 'APL' | 'None'; dob: string };
  saved: Record<string, boolean>;
  /** completed lesson numbers per course */
  done: Record<string, number[]>;
  /** jobId -> ISO date applied */
  applied: Record<string, string>;
  /** friend name (en) -> invited */
  invited: Record<string, boolean>;
  /** schemeId -> doc index -> has */
  docs: Record<string, Record<number, boolean>>;
  offline: Record<string, boolean>;
  minutesToday: number;
  unread: number[];
  reminder: boolean;
  /** discussion messages the person posted, per course */
  posts: Record<string, string[]>;
}

const initial = (): ZState => ({
  v: 1,
  lang: 'en',
  theme: 'system',
  bigText: false,
  readAloud: false,
  introSeen: false,
  profile: { name: '', phone: ZARIYA.user.phone, village: '', district: '', state: 'Haryana', education: 'Graduate', card: 'BPL', dob: '1998-03-14' },
  saved: Object.fromEntries(ZARIYA.courses.map((c) => [c.id, c.saved])),
  done: Object.fromEntries(ZARIYA.courses.map((c) => [c.id, Array.from({ length: c.done }, (_, i) => i + 1)])),
  applied: { pottery: isoDaysAgo(6), jain: isoDaysAgo(2) },
  invited: {},
  docs: { pmkvy: { 0: true, 1: true }, nrlm: { 0: true, 1: true }, disha: { 0: true } },
  offline: {},
  minutesToday: ZARIYA.user.minutesToday,
  unread: [0, 1, 2],
  reminder: false,
  posts: {},
});

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const KEY = 'zariya:v1';

type Strings = typeof ZARIYA.i18n & typeof EXTRA;
export type Key = keyof Strings;

interface Ctx {
  s: ZState;
  set: (fn: (draft: ZState) => void) => void;
  reset: () => void;
  lang: Lang;
  /** UI string by key, with {var} substitution */
  t: (k: Key, vars?: Record<string, string | number>) => string;
  /** pick the current language from a bilingual content object */
  L: (o: Bi | null | undefined) => string;
  /** array-valued strings (e.g. weekday initials) */
  tl: (k: Key) => string[];
  hydrated: boolean;
  // derived helpers
  userName: () => string;
  doneN: (c: Course) => number;
  pct: (c: Course) => number;
  isComplete: (c: Course) => boolean;
  nextLesson: (c: Course) => number | null;
}

const ZCtx = createContext<Ctx | null>(null);

export function ZProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<ZState>(initial);
  const [hydrated, setHydrated] = useState(false);
  const first = useRef(true);

  // load once on the client
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1) setS({ ...initial(), ...saved, profile: { ...initial().profile, ...saved.profile } });
      }
    } catch {}
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }, [s, hydrated]);

  // reflect language / theme / text size on <html>
  useEffect(() => {
    const el = document.documentElement;
    el.lang = s.lang;
    if (s.theme === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', s.theme);
    el.classList.toggle('big', s.bigText);
  }, [s.lang, s.theme, s.bigText]);

  const set = useCallback((fn: (d: ZState) => void) => {
    setS((prev) => {
      const d: ZState = structuredClone(prev);
      fn(d);
      return d;
    });
  }, []);

  const reset = useCallback(() => setS(initial()), []);

  const value = useMemo<Ctx>(() => {
    const lang = s.lang;
    const L = (o: Bi | null | undefined) => (o ? (o[lang] ?? o.en) : '');
    const all = { ...ZARIYA.i18n, ...EXTRA } as Record<string, { en: unknown; hi: unknown }>;
    const t = (k: Key, vars?: Record<string, string | number>) => {
      const e = all[k as string];
      if (!e) return String(k);
      let str = String((e as Record<string, unknown>)[lang] ?? e.en);
      if (vars) for (const v in vars) str = str.split('{' + v + '}').join(String(vars[v]));
      return str;
    };
    const tl = (k: Key) => {
      const e = all[k as string];
      const v = e ? ((e as Record<string, unknown>)[lang] ?? e.en) : [];
      return Array.isArray(v) ? (v as string[]) : [String(v)];
    };
    const doneN = (c: Course) => (s.done[c.id] || []).length;
    const pct = (c: Course) => Math.round((doneN(c) / c.lessons) * 100);
    const isComplete = (c: Course) => doneN(c) >= c.lessons;
    const nextLesson = (c: Course) => {
      const d = new Set(s.done[c.id] || []);
      for (let n = 1; n <= c.lessons; n++) if (!d.has(n)) return n;
      return null;
    };
    const userName = () => s.profile.name.trim() || L(ZARIYA.user.name);
    return { s, set, reset, lang, t, L, tl, hydrated, userName, doneN, pct, isComplete, nextLesson };
  }, [s, set, reset, hydrated]);

  return <ZCtx.Provider value={value}>{children}</ZCtx.Provider>;
}

export function useZ() {
  const c = useContext(ZCtx);
  if (!c) throw new Error('useZ must be used inside <ZProvider>');
  return c;
}

/** Stroke icon from a 24×24 path string (paths live in lib/data.ts and lib/icons.ts). */
export function Icon({ d, size = 24, sw = 1.8, className, style }: { d: string; size?: number; sw?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}
