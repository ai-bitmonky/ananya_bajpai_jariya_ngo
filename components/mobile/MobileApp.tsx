'use client';
/* ZARIYA ज़रिया — the phone app shell.
   A stack of screens driven by the URL (lib/nav.tsx): push slides the new screen in from the right
   over the previous one (which shifts left and dims slightly), back reverses it, tab switches
   crossfade. Screens under the top stay mounted (hidden) so scroll position and local state survive.
   Edge-swipe from the left 24px drags the top screen; past 35% it goes back. */
import './mobile.css';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNav } from '@/lib/nav';
import { useZ } from '@/lib/store';
import { MCtx, buzz, D, type GSheet, type MShell, type ResetAnim, type SwapAnim } from './ctx';
import { match, TABS, type Match } from './routes';
import { Ic } from './ui';
import { WM } from './content';
import { Splash } from './screens/Splash';
import { GlobalSheets } from './GlobalSheets';
import { Home } from './screens/Home';
import { Courses } from './screens/Courses';
import { CourseDetail } from './screens/CourseDetail';
import { Lesson } from './screens/Lesson';
import { Certificate } from './screens/Certificate';
import { Schemes } from './screens/Schemes';
import { SchemeDetail } from './screens/SchemeDetail';
import { Work } from './screens/Work';
import { JobDetail } from './screens/JobDetail';
import { Success } from './screens/Success';
import { Profile } from './screens/Profile';
import { EditInfo, Welcome } from './screens/Welcome';

interface Entry { id: number; path: string; key: string; leaving?: boolean }
type AnimT = 'push' | 'pop' | 'tab' | 'fadeIn' | 'resetPop' | 'resetFade' | 'resetPush';
interface Pending { t: AnimT; from: number; to: number }
type Hint = 'push' | 'fade' | 'none' | 'tab' | 'resetPop' | 'resetFade' | 'resetPush';

let uid = 0;
const mk = (path: string): Entry => ({ id: ++uid, path, key: match(path).key });
const SPLASH_KEY = 'zariya:m:splash';
const EASE_ARRIVE = 'cubic-bezier(.16,1,.3,1)';
const EASE_EMPH = 'cubic-bezier(.2,0,0,1)';

function renderScreen(m: Match, path: string, active: boolean): ReactNode {
  const p = { path, active };
  switch (m.kind) {
    case 'home': return <Home {...p} />;
    case 'courses': return <Courses {...p} />;
    case 'course': return <CourseDetail {...p} id={m.id!} />;
    case 'lesson': return <Lesson {...p} id={m.id!} n={m.n!} />;
    case 'cert': return <Certificate {...p} id={m.id!} />;
    case 'schemes': return <Schemes {...p} />;
    case 'scheme': return <SchemeDetail {...p} id={m.id!} />;
    case 'work': return <Work {...p} />;
    case 'job': return <JobDetail {...p} id={m.id!} />;
    case 'success': return <Success {...p} id={m.id!} />;
    case 'profile': return <Profile {...p} />;
    case 'info': return <EditInfo {...p} />;
    case 'welcome': return <Welcome {...p} step={m.step!} />;
  }
}

export default function MobileApp() {
  const { hydrated, t, s } = useZ();
  const nav = useNav();
  const [boot, setBoot] = useState<'pre' | 'splash' | 'out' | 'done'>('pre');
  const stackOn = boot === 'out' || boot === 'done';

  /* ---------- boot: splash only on the first load of a session, on Home ---------- */
  useEffect(() => {
    if (!hydrated || boot !== 'pre') return;
    let seen = true;
    try { seen = !!sessionStorage.getItem(SPLASH_KEY); sessionStorage.setItem(SPLASH_KEY, '1'); } catch { /* private mode */ }
    setBoot(!seen && location.pathname === '/' ? 'splash' : 'done');
  }, [hydrated, boot]);

  /* ---------- stack ---------- */
  const [entries, setEntries] = useState<Entry[]>([]);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const [anim, setAnim] = useState<{ from: number; to: number } | null>(null);
  const pending = useRef<Pending | null>(null);
  const hint = useRef<Hint | null>(null);
  const pendingReset = useRef<{ path: string; anim: ResetAnim } | null>(null);
  const skipAnim = useRef(false);
  const running = useRef<Animation[]>([]);
  const els = useRef(new Map<number, HTMLElement>());
  const stage = useRef<HTMLElement>(null);
  const navRef = useRef(nav);
  navRef.current = nav;

  const live = entries.filter((e) => !e.leaving);
  const top = live[live.length - 1];
  const topM = top ? match(top.path) : null;

  // react to every route change
  useLayoutEffect(() => {
    if (!stackOn) return;
    const { route, dir, depth } = navRef.current;
    const path = route.path;
    if (pendingReset.current && dir === 'back') {
      const pr = pendingReset.current;
      pendingReset.current = null;
      hint.current = pr.anim === 'pop' ? 'resetPop' : pr.anim === 'fade' ? 'resetFade' : 'resetPush';
      navRef.current.replace(pr.path);
      return;
    }
    running.current.forEach((a) => a.cancel());
    running.current = [];
    const h = hint.current; hint.current = null;
    const skip = skipAnim.current; skipAnim.current = false;
    const key = match(path).key;
    const list = entriesRef.current.filter((e) => !e.leaving);
    if (!list.length) { setEntries([mk(path)]); setAnim(null); return; }
    const cur = list[list.length - 1];
    let next: Entry[];
    let p: Pending | null = null;
    if (h === 'resetPop' || h === 'resetFade' || h === 'resetPush') {
      const ne = mk(path);
      if (h === 'resetPush') next = [{ ...cur, leaving: true }, ne];
      else next = [ne, { ...cur, leaving: true }];
      p = { t: h, from: cur.id, to: ne.id };
    } else if (dir === 'forward') {
      const ne = mk(path);
      next = [...list, ne];
      p = { t: 'push', from: cur.id, to: ne.id };
    } else if (dir === 'back') {
      let kept: Entry[], removed: Entry[];
      if (list.length > depth + 1) { kept = list.slice(0, depth + 1); removed = list.slice(depth + 1); }
      else { kept = list.slice(0, -1); removed = [cur]; }
      const last = kept[kept.length - 1];
      if (!last || last.key !== key) kept = [...kept, mk(path)];
      else if (last.path !== path) kept = [...kept.slice(0, -1), { ...last, path }];
      const out = removed[removed.length - 1];
      const to = kept[kept.length - 1];
      if (skip) next = kept;
      else { next = [...kept, { ...out, leaving: true }]; p = { t: 'pop', from: out.id, to: to.id }; }
    } else if (cur.key === key) {
      next = [...list.slice(0, -1), { ...cur, path }];
    } else {
      const ne = mk(path);
      if (h === 'tab') { next = [{ ...cur, leaving: true }, ne]; p = { t: 'tab', from: cur.id, to: ne.id }; }
      else if (h === 'fade') { next = [...list.slice(0, -1), { ...cur, leaving: true }, ne]; p = { t: 'fadeIn', from: cur.id, to: ne.id }; }
      else if (h === 'push') { next = [...list.slice(0, -1), { ...cur, leaving: true }, ne]; p = { t: 'push', from: cur.id, to: ne.id }; }
      else next = [...list.slice(0, -1), ne];
    }
    pending.current = p;
    setAnim(p ? { from: p.from, to: p.to } : null);
    setEntries(next);
  }, [nav.route.key, stackOn]);

  // run the transition once the new stack is in the DOM
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    const from = els.current.get(p.from), to = els.current.get(p.to);
    const done = () => {
      running.current.forEach((a) => a.cancel());
      running.current = [];
      setEntries((es) => (es.some((e) => e.leaving) ? es.filter((e) => !e.leaving) : es));
      setAnim(null);
    };
    if (!from || !to) { done(); return; }
    const o = (ms: number, easing = EASE_ARRIVE): KeyframeAnimationOptions => ({ duration: D(ms), easing, fill: 'both' });
    const list: Animation[] = [];
    switch (p.t) {
      case 'push':
        list.push(to.animate([{ transform: 'translateX(100%)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], o(560)));
        list.push(from.animate([{ transform: 'none', filter: 'brightness(1)' }, { transform: 'translateX(-28%)', filter: 'brightness(.94)' }], o(560)));
        buzz();
        break;
      case 'pop': {
        const ct = getComputedStyle(from).transform;
        list.push(from.animate([{ transform: ct === 'none' ? 'none' : ct }, { transform: 'translateX(100%)' }], o(420, EASE_EMPH)));
        list.push(to.animate([{ transform: 'translateX(-28%)', filter: 'brightness(.94)' }, { transform: 'none', filter: 'brightness(1)' }], o(420, EASE_EMPH)));
        break;
      }
      case 'tab': list.push(to.animate([{ opacity: 0 }, { opacity: 1 }], o(160, 'ease-out'))); break;
      case 'fadeIn': list.push(to.animate([{ opacity: 0 }, { opacity: 1 }], o(220, 'ease-out'))); break;
      case 'resetPop': list.push(from.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], o(420, EASE_EMPH))); break;
      case 'resetFade': list.push(from.animate([{ opacity: 1 }, { opacity: 0 }], o(200, EASE_EMPH))); break;
      case 'resetPush': list.push(to.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], o(560))); break;
    }
    running.current = list;
    list[0].finished.then(done).catch(() => { /* superseded by a newer navigation */ });
  }, [entries]);

  /* ---------- toasts ---------- */
  const [toastS, setToast] = useState<{ id: number; msg: string; ok: boolean; out: boolean } | null>(null);
  const toastT = useRef<number[]>([]);
  const toast = useCallback((msg: string, ok = true) => {
    toastT.current.forEach(clearTimeout);
    const id = Date.now();
    setToast({ id, msg, ok, out: false });
    toastT.current = [
      window.setTimeout(() => setToast((x) => (x && x.id === id ? { ...x, out: true } : x)), 2400),
      window.setTimeout(() => setToast((x) => (x && x.id === id ? null : x)), 2700),
    ];
  }, []);
  useEffect(() => () => toastT.current.forEach(clearTimeout), []);

  /* ---------- sheets ---------- */
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [sheetN, setSheetN] = useState(0);
  const sheetNRef = useRef(0);
  const sheetCount = useCallback((d: 1 | -1) => { sheetNRef.current += d; setSheetN(sheetNRef.current); }, []);
  const [gsheet, setGsheet] = useState<GSheet | null>(null);
  const gsheetRef = useRef(gsheet);
  gsheetRef.current = gsheet;

  /* ---------- navigation API ---------- */
  const go = useCallback((path: string) => { setGsheet(null); navRef.current.push(path); }, []);
  const swap = useCallback((path: string, a: SwapAnim = 'none') => { setGsheet(null); hint.current = a; navRef.current.replace(path); }, []);
  const setQuery = useCallback((path: string) => { hint.current = null; navRef.current.replace(path); }, []);
  const reset = useCallback((path: string, a: ResetAnim = 'pop') => {
    setGsheet(null);
    const d = navRef.current.depth;
    if (d > 0) { pendingReset.current = { path, anim: a }; history.go(-d); }
    else { hint.current = a === 'pop' ? 'resetPop' : a === 'fade' ? 'resetFade' : 'resetPush'; navRef.current.replace(path); }
  }, []);
  const tab = useCallback((path: string) => {
    buzz();
    const cur = entriesRef.current.filter((e) => !e.leaving).pop();
    const key = match(path).key;
    if (navRef.current.depth > 0) { reset(path, 'fade'); return; }
    if (cur && cur.key === key) {
      if (cur.path === path) els.current.get(cur.id)?.querySelector('.scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
      else setQuery(path);
      return;
    }
    hint.current = 'tab';
    navRef.current.replace(path);
  }, [reset, setQuery]);
  const closeSheet = useCallback(() => {
    setGsheet(null);
    const cur = entriesRef.current.filter((e) => !e.leaving).pop();
    if (cur) {
      const pn = cur.path.split('?')[0];
      if (pn === '/notifications') setQuery('/');
      else if (/^\/work\/[^/]+\/apply$/.test(pn)) setQuery(pn.replace(/\/apply$/, ''));
    }
  }, [setQuery]);
  const back = useCallback(() => {
    if (gsheetRef.current) { closeSheet(); return; }
    const cur = entriesRef.current.filter((e) => !e.leaving).pop();
    navRef.current.back(cur ? match(cur.path).parent : '/');
  }, [closeSheet]);
  const openSheet = useCallback((sh: GSheet) => setGsheet(sh), []);

  const ctx = useMemo<MShell>(() => ({ go, swap, setQuery, tab, reset, back, toast, sheet: gsheet, openSheet, closeSheet, host, sheetCount }),
    [go, swap, setQuery, tab, reset, back, toast, gsheet, openSheet, closeSheet, host, sheetCount]);

  // deep link to /notifications opens the sheet over Home
  useEffect(() => {
    if (stackOn && nav.route.path.split('?')[0] === '/notifications') setGsheet({ kind: 'notifs' });
  }, [nav.route.key, stackOn, nav.route.path]);

  // Escape = back (sheets catch it first)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || sheetNRef.current > 0) return;
      const cur = entriesRef.current.filter((x) => !x.leaving).pop();
      if (cur && !match(cur.path).root) back();
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [back]);

  /* ---------- edge swipe back ---------- */
  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    let sx: number | null = null, sy = 0, dx = 0, locked = false;
    let cur: HTMLElement | undefined, under: HTMLElement | undefined;
    const ts = (e: TouchEvent) => {
      const l = entriesRef.current.filter((x) => !x.leaving);
      if (l.length < 2 || sheetNRef.current > 0 || running.current.length) return;
      const tch = e.touches[0], r = st.getBoundingClientRect();
      if (tch.clientX - r.left > 24) return;
      sx = tch.clientX; sy = tch.clientY; dx = 0; locked = false;
      cur = els.current.get(l[l.length - 1].id); under = els.current.get(l[l.length - 2].id);
    };
    const tm = (e: TouchEvent) => {
      if (sx == null || !cur || !under) return;
      const tch = e.touches[0];
      dx = Math.max(0, tch.clientX - sx);
      if (!locked) {
        if (Math.abs(tch.clientY - sy) > 12 && dx < 12) { sx = null; return; }
        if (dx < 6) return;
        locked = true; under.style.visibility = 'visible';
      }
      const w = st.offsetWidth;
      cur.style.transform = `translateX(${dx}px)`;
      cur.style.boxShadow = 'var(--sh-3)';
      under.style.transform = `translateX(${-28 + (28 * dx) / w}%)`;
    };
    const te = () => {
      if (sx == null) return;
      sx = null;
      if (!locked || !cur || !under) return;
      const w = st.offsetWidth, c = cur, u = under;
      const opt: KeyframeAnimationOptions = { duration: D(260), easing: 'ease-out', fill: 'both' };
      const clear = () => { c.style.boxShadow = ''; u.style.transform = ''; u.style.visibility = ''; u.getAnimations().forEach((x) => x.cancel()); };
      if (dx > w * 0.35) {
        const a = c.animate([{ transform: `translateX(${dx}px)` }, { transform: 'translateX(100%)' }], opt);
        u.animate([{ transform: u.style.transform }, { transform: 'none' }], opt);
        a.finished.then(() => { clear(); skipAnim.current = true; back(); }).catch(() => {});
      } else {
        const a = c.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], opt);
        u.animate([{ transform: u.style.transform }, { transform: 'translateX(-28%)' }], opt);
        a.finished.then(() => { c.getAnimations().forEach((x) => x.cancel()); c.style.transform = ''; clear(); }).catch(() => {});
      }
    };
    st.addEventListener('touchstart', ts, { passive: true });
    st.addEventListener('touchmove', tm, { passive: true });
    st.addEventListener('touchend', te);
    st.addEventListener('touchcancel', te);
    return () => { st.removeEventListener('touchstart', ts); st.removeEventListener('touchmove', tm); st.removeEventListener('touchend', te); st.removeEventListener('touchcancel', te); };
  }, [stackOn, back]);

  /* ---------- chrome: tab bar, toast offset, status-bar colour ---------- */
  const lastTab = useRef<string>('home');
  if (topM?.root) lastTab.current = topM.kind;
  const tabsOn = !!topM?.root && stackOn;
  const app = useRef<HTMLDivElement | null>(null);
  const setApp = useCallback((el: HTMLDivElement | null) => { app.current = el; setHost(el); }, []);

  useLayoutEffect(() => {
    const a = app.current;
    if (!a || !top) return;
    const foot = els.current.get(top.id)?.querySelector<HTMLElement>(':scope > .foot, :scope > .fill-c > .foot');
    a.style.setProperty('--toast-b', topM?.root ? 'calc(var(--tabh) + 12px)' : foot ? `${foot.offsetHeight + 12}px` : 'calc(24px + env(safe-area-inset-bottom))');
  });

  useEffect(() => {
    const band = boot === 'pre' ? location.pathname === '/' : boot !== 'done' || !!topM?.band;
    const c = band ? '#7B1E2E' : getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#FBF4EE';
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', c));
  }, [boot, topM?.band, s.theme]);

  /* ---------- render ---------- */
  if (boot === 'pre') {
    const band = nav.route.path.split('?')[0] === '/';
    return (
      <div className="zm">
        <div className="zm-app" data-tabs="off">
          <div className={`zm-boot ${band ? 'band' : ''}`} aria-busy="true"><span className="wordmark">{WM}</span></div>
        </div>
      </div>
    );
  }

  const visible = (e: Entry) => e.leaving || e.id === top?.id || (!!anim && (e.id === anim.from || e.id === anim.to));
  return (
    <MCtx.Provider value={ctx}>
      <div className="zm">
        <div className="zm-app" ref={setApp} data-tabs={tabsOn ? 'on' : 'off'}>
          <main className="zm-stage" ref={stage} inert={sheetN > 0}>
            {stackOn && entries.map((e) => {
              const m = match(e.path);
              const isTop = !e.leaving && e.id === top?.id;
              return (
                <section key={e.id} ref={(el) => { if (el) els.current.set(e.id, el); else els.current.delete(e.id); }}
                  className={`screen scr-${m.kind} ${m.root ? 'is-root' : ''} ${visible(e) ? '' : 'is-hidden'}`}
                  inert={!isTop} aria-hidden={isTop ? undefined : true}>
                  {renderScreen(m, e.path, isTop)}
                </section>
              );
            })}
          </main>
          {stackOn && (
            <nav className="zm-tabbar" aria-label={t('mainNav')} inert={!tabsOn || sheetN > 0}>
              {TABS.map((x) => {
                const on = lastTab.current === x.k;
                return (
                  <button key={x.k} className="tab" aria-current={on ? 'page' : undefined} onClick={() => tab(x.path)}>
                    <span className="tab-i"><Ic k={x.icon} s={24} sw={on ? 2.1 : 1.8} /></span>
                    <span className="tab-l">{t(x.label)}</span>
                  </button>
                );
              })}
            </nav>
          )}
          <div className="zm-toast" role="status" aria-live="polite">
            {toastS && (
              <div key={toastS.id} className={`t ${toastS.out ? 'out' : ''}`}>
                {toastS.ok && <Ic k="check" s={20} sw={2.4} />}<span>{toastS.msg}</span>
              </div>
            )}
          </div>
          {stackOn && <GlobalSheets />}
          {(boot === 'splash' || boot === 'out') && (
            <Splash leaving={boot === 'out'} onDone={() => setBoot((b) => (b === 'splash' ? 'out' : b))} onGone={() => setBoot('done')} />
          )}
        </div>
      </div>
    </MCtx.Provider>
  );
}
