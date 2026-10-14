'use client';
/* Zariya navigation — one URL scheme shared by both layouts, so a deep link opens the same
   place on a phone or a laptop, and switching layout keeps you where you are.

   Paths
     /                              home
     /courses                       my courses           ?tab=all|ongoing|completed|saved  ?q=
     /courses/:id                   course detail        ?tab=about|lessons|invite|discussion
     /courses/:id/lesson/:n         lesson player
     /courses/:id/certificate       certificate
     /schemes                       schemes              ?tab=all|forme  ?type=central|state|ngo
     /schemes/:id                   scheme detail
     /work                          work                 ?f=all|near|wfh|part|govt  ?skill=
     /work/:id                      job detail
     /work/:id/apply                apply (confirm)
     /work/:id/applied              application sent
     /profile                       profile
     /profile/edit                  edit personal info
     /notifications                 notifications
     /welcome                       optional intro (language → 3 slides → about you). Never required.

   API:  const { route, push, replace, back, depth, dir } = useNav();
         route = { path, seg: string[], q: URLSearchParams, tab: 'home'|'courses'|'schemes'|'work'|'profile'|'other' }
         dir   = 'forward' | 'back' | 'none'   (for mobile push/pop animations)
*/
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Tab = 'home' | 'courses' | 'schemes' | 'work' | 'profile' | 'other';
export interface Route { path: string; seg: string[]; q: URLSearchParams; tab: Tab; key: number }
type Dir = 'forward' | 'back' | 'none';

interface NavCtx {
  route: Route;
  push: (path: string) => void;
  replace: (path: string) => void;
  back: (fallback?: string) => void;
  /** how many in-app entries are behind this one (0 = nothing to go back to inside the app) */
  depth: number;
  dir: Dir;
}

const Ctx = createContext<NavCtx | null>(null);

function parse(full: string, key: number): Route {
  const u = new URL(full, 'http://x');
  const seg = u.pathname.split('/').filter(Boolean);
  const first = seg[0] || '';
  const tab: Tab = first === '' ? 'home' : first === 'courses' ? 'courses' : first === 'schemes' ? 'schemes' : first === 'work' ? 'work' : first === 'profile' ? 'profile' : 'other';
  return { path: u.pathname + u.search, seg, q: u.searchParams, tab, key };
}

let counter = 0;

export function NavProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parse(initialPath, 0));
  const [depth, setDepth] = useState(0);
  const [dir, setDir] = useState<Dir>('none');

  useEffect(() => {
    // adopt the real location after hydration, and tag the entry with our depth
    const here = location.pathname + location.search;
    history.replaceState({ z: 0 }, '', here);
    setRoute(parse(here, ++counter));
    const onPop = (e: PopStateEvent) => {
      const d = (e.state && typeof e.state.z === 'number') ? e.state.z : 0;
      setDepth((prev) => { setDir(d < prev ? 'back' : 'forward'); return d; });
      setRoute(parse(location.pathname + location.search, ++counter));
    };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, []);

  const push = useCallback((path: string) => {
    setDepth((d) => { history.pushState({ z: d + 1 }, '', path); return d + 1; });
    setDir('forward');
    setRoute(parse(path, ++counter));
  }, []);

  const replace = useCallback((path: string) => {
    setDepth((d) => { history.replaceState({ z: d }, '', path); return d; });
    setDir('none');
    setRoute(parse(path, ++counter));
  }, []);

  const back = useCallback((fallback = '/') => {
    if (depth > 0) history.back();
    else { setDir('back'); history.replaceState({ z: 0 }, '', fallback); setRoute(parse(fallback, ++counter)); }
  }, [depth]);

  const value = useMemo(() => ({ route, push, replace, back, depth, dir }), [route, push, replace, back, depth, dir]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useNav must be used inside <NavProvider>');
  return c;
}

/** Build a path with query params, dropping empty values. */
export function href(path: string, q?: Record<string, string | number | null | undefined | false>) {
  if (!q) return path;
  const p = new URLSearchParams();
  for (const k in q) { const v = q[k]; if (v !== null && v !== undefined && v !== false && v !== '') p.set(k, String(v)); }
  const s = p.toString();
  return s ? `${path}?${s}` : path;
}
