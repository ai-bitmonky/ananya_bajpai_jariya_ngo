'use client';
/* Zariya desktop web app — port of reference/prototype-desktop.html.
   Routing follows lib/nav.tsx; persistent state lives in lib/store.tsx; purely visual state
   (open menu, player position, certificate modal opened from a grid) is local. */
import './desktop.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ZARIYA, course } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav } from '@/lib/nav';
import { Sidebar, Topbar, topTitle, type View } from './Shell';
import { ToastProvider, BRAND } from './ui';
import { useDesk, type Cert } from './model';
import Dashboard from './Dashboard';
import Courses from './Courses';
import CourseView, { initialPlayer, type PlayerState } from './CourseView';
import Schemes from './Schemes';
import Work, { type DrawerStep } from './Work';
import Profile from './Profile';
import Welcome from './Welcome';
import { CertModal } from './Layers';

interface Parsed { view: View; courseId?: string; lesson: number | null; certRoute: boolean; schemeId: string | null; jobId: string | null; step: DrawerStep; edit: boolean; notif: boolean; welcome: boolean }

function parseRoute(seg: string[]): Parsed {
  const p: Parsed = { view: 'home', lesson: null, certRoute: false, schemeId: null, jobId: null, step: 'detail', edit: false, notif: false, welcome: false };
  const [a, b, c, d] = seg;
  if (a === 'courses') {
    if (b && ZARIYA.courses.some((x) => x.id === b)) {
      p.view = 'course'; p.courseId = b;
      if (c === 'lesson' && d && /^\d+$/.test(d)) p.lesson = Math.max(1, Math.min(+d, course(b).lessons));
      if (c === 'certificate') p.certRoute = true;
    } else p.view = 'courses';
  } else if (a === 'schemes') { p.view = 'schemes'; p.schemeId = b && ZARIYA.schemes.some((x) => x.id === b) ? b : null; }
  else if (a === 'work') { p.view = 'work'; p.jobId = b || null; p.step = c === 'apply' ? 'confirm' : c === 'applied' ? 'success' : 'detail'; }
  else if (a === 'profile') { p.view = 'profile'; p.edit = b === 'edit'; }
  else if (a === 'notifications') p.notif = true;
  else if (a === 'welcome') p.welcome = true;
  return p;
}

function Desktop() {
  const { t, L, hydrated } = useZ();
  const { route, replace, back } = useNav();
  const D = useDesk();
  const r = parseRoute(route.seg);
  const [menuS, setMenuS] = useState<null | 'bell' | 'me'>(null);
  const [cert, setCert] = useState<Cert | null>(null);
  const [P, setPState] = useState<PlayerState>(initialPlayer);
  const setP = useCallback((fn: (p: PlayerState) => PlayerState) => setPState(fn), []);
  const menu = menuS ?? (r.notif ? 'bell' : null);

  const setMenu = useCallback((m: null | 'bell' | 'me') => {
    setMenuS(m);
    if (!m && location.pathname === '/notifications') replace('/');
  }, [replace]);

  // view key → crossfade + scroll to top; `.enter` drives the first-paint chart/ring/bar animations
  const viewKey = r.view === 'course' ? 'course:' + r.courseId : r.view;
  const [entering, setEntering] = useState(true);
  const prevKey = useRef(viewKey);
  useEffect(() => {
    if (prevKey.current !== viewKey) { prevKey.current = viewKey; setEntering(true); window.scrollTo({ top: 0 }); }
    const tm = setTimeout(() => setEntering(false), 1400);
    return () => clearTimeout(tm);
  }, [viewKey]);

  // menus and grid-opened certificate close on navigation
  useEffect(() => { setMenuS(null); setCert(null); }, [route.key]);

  useEffect(() => { document.title = `${BRAND} · ${topTitle(r.view, r.courseId, t, L)}`; });

  const closeCertRoute = useCallback(() => replace(`/courses/${r.courseId}`), [replace, r.courseId]);
  const closeWelcome = useCallback(() => back('/'), [back]);

  // outside click closes menus
  useEffect(() => {
    if (!menu) return;
    const f = (e: MouseEvent) => { const el = e.target as Element; if (!el.closest(`[data-menu="${menu}"]`)) setMenu(null); };
    document.addEventListener('click', f);
    return () => document.removeEventListener('click', f);
  }, [menu, setMenu]);

  // Escape closes the top layer
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (cert) { setCert(null); return; }
      if (r.certRoute) { closeCertRoute(); return; }
      if (r.view === 'work' && r.jobId) { const q = new URLSearchParams(location.search).toString(); replace('/work' + (q ? '?' + q : '')); return; }
      if (r.welcome) { closeWelcome(); return; }
      if (menu) setMenu(null);
    };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  });

  if (!hydrated) return <div className="boot" aria-busy="true"><span className="wordmark">{BRAND}</span></div>;

  const routeCert = r.certRoute && r.courseId ? D.certOf(r.courseId) : null;
  let body;
  switch (r.view) {
    case 'courses': body = <Courses onCert={(id) => setCert(D.certOf(id))} />; break;
    case 'course': body = <CourseView id={r.courseId!} lessonParam={r.lesson} P={P} setP={setP} />; break;
    case 'schemes': body = <Schemes selId={r.schemeId} />; break;
    case 'work': body = <Work jobId={r.jobId} step={r.step} />; break;
    case 'profile': body = <Profile edit={r.edit} onCert={setCert} />; break;
    default: body = <Dashboard />;
  }

  return (
    <div className="app">
      <Sidebar view={r.view} />
      <div className="main">
        <Topbar view={r.view} courseId={r.courseId} menu={menu} setMenu={setMenu} />
        <main className="content" id="main" tabIndex={-1}>
          <div key={viewKey} className={`view ${entering ? 'enter' : ''}`} data-view={r.view}>{body}</div>
        </main>
      </div>
      {cert ? <CertModal x={cert} onClose={() => setCert(null)} /> : routeCert ? <CertModal x={routeCert} onClose={closeCertRoute} /> : null}
      {r.welcome ? <Welcome onDone={closeWelcome} /> : null}
    </div>
  );
}

export default function DesktopApp() {
  return (
    <div className="zd">
      <ToastProvider>
        <Desktop />
      </ToastProvider>
    </div>
  );
}
