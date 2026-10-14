'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ZARIYA, course } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav, href } from '@/lib/nav';
import { Ic, MeAv, BRAND } from './ui';
import { useDesk, useIsDark, U } from './model';
import type { IconName } from './icons';

export type View = 'home' | 'courses' | 'course' | 'schemes' | 'work' | 'profile';
const NAV: [Exclude<View, 'course'>, IconName, string][] = [['home', 'home', '/'], ['courses', 'book', '/courses'], ['schemes', 'scheme', '/schemes'], ['work', 'work', '/work'], ['profile', 'user', '/profile']];
const navKey = { home: 'home', courses: 'courses', schemes: 'schemes', work: 'work', profile: 'profile' } as const;

export function Sidebar({ view }: { view: View }) {
  const { s, set, t, lang } = useZ();
  const { push } = useNav();
  const { matchCount } = useDesk();
  const dark = useIsDark();
  const root = view === 'course' ? 'courses' : view;
  return (
    <aside className="side">
      <button className="brand" onClick={() => push('/')} aria-label={`${t('appName')} — ${t('home')}`}><span className="wordmark brand-wm">{BRAND}</span><span className="brand-en">{ZARIYA.i18n.appName.en.toUpperCase()}</span></button>
      <nav className="nav" aria-label={t('mainNav')}>
        {NAV.map(([v, k, p]) => (
          <button key={v} className="nav-i" data-tip={t(navKey[v])} aria-current={root === v ? 'page' : undefined} onClick={() => push(p)}>
            <Ic n={k} s={22} /><span className="t">{t(navKey[v])}</span>
            {v === 'schemes' ? <span className="nav-badge num" aria-label={t('matchN', { n: matchCount })}>{matchCount}</span> : null}
          </button>
        ))}
      </nav>
      <div className="side-sep" />
      <div className="side-card"><span className="flame"><Ic n="flame" s={26} /></span><span><b className="num">{t('dayStreak', { n: U.streakDays })}</b><span className="num">{s.minutesToday} / {U.goalMinutes}</span> {t('min')} · {t('today')}</span></div>
      <div className="side-foot">
        <div className="seg" role="group" aria-label={t('language')}>
          <button aria-pressed={lang === 'en'} lang="en" aria-label="English" onClick={() => set((d) => { d.lang = 'en'; })}>{t('langEn')}</button>
          <button aria-pressed={lang === 'hi'} lang="hi" aria-label="हिन्दी" onClick={() => set((d) => { d.lang = 'hi'; })}>{t('langHi')}</button>
        </div>
        <button className="row-switch" role="switch" aria-checked={dark} aria-label={t('darkMode')} onClick={() => set((d) => { d.theme = dark ? 'light' : 'dark'; })}>
          <span className="lbl"><Ic n="moon" s={20} /><span className="t">{t('darkMode')}</span></span><span className="sw" />
        </button>
        <span className="side-wm wordmark wordmark--outline" aria-hidden="true">{BRAND}</span>
      </div>
    </aside>
  );
}

const KIND_IC: Record<string, IconName> = { work: 'work', friend: 'users', scheme: 'scheme' };
const NOTIF_GO: Record<string, string> = { work: '/work/ku', friend: '/courses/sewing', scheme: '/schemes/tejaswini' };

export function NotifList() {
  const { s, set, L } = useZ();
  const { push } = useNav();
  return (
    <>
      {ZARIYA.notifications.map((n, i) => (
        <div key={i} className={`ni ${s.unread.includes(i) ? 'unread' : ''}`}>
          <span className={`nk ${n.kind}`}><Ic n={KIND_IC[n.kind]} s={18} /></span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <button className="stretch" style={{ textAlign: 'left' }} onClick={() => { set((d) => { d.unread = d.unread.filter((x) => x !== i); }); push(NOTIF_GO[n.kind]); }}><p>{L(n.t)}</p></button>
            <time>{L(n.when)}</time>
          </div>
        </div>
      ))}
    </>
  );
}

export function Topbar({ view, courseId, menu, setMenu }: { view: View; courseId?: string; menu: null | 'bell' | 'me'; setMenu: (m: null | 'bell' | 'me') => void }) {
  const { s, set, t, L, lang, userName } = useZ();
  const { route, push } = useNav();
  const routeQ = view === 'courses' ? route.q.get('q') || '' : '';
  const [q, setQ] = useState(routeQ);
  const [listening, setListening] = useState(false);
  const lt = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setQ(routeQ); }, [routeQ]);
  useEffect(() => () => { if (lt.current) clearTimeout(lt.current); }, []);

  const unread = s.unread.length;
  const crumbs: [string, string?][] = [[t('appName'), '/']];
  if (view === 'home') crumbs.push([t('dashboard')]);
  else if (view === 'course' && courseId) { crumbs.push([t('courses'), '/courses']); crumbs.push([L(course(courseId).title)]); }
  else crumbs.push([t(view as 'courses')]);
  const title = topTitle(view, courseId, t, L);

  const submit = (e: FormEvent) => { e.preventDefault(); setMenu(null); push(href('/courses', { q: q.trim() })); };
  const mic = () => {
    if (listening) return;
    setListening(true);
    try { navigator.vibrate?.(8); } catch {}
    lt.current = setTimeout(() => { setListening(false); push(href('/courses', { q: lang === 'hi' ? 'सिलाई' : 'sewing' })); }, 1800);
  };

  return (
    <header className="top">
      <div className="top-title">
        <nav className="crumbs" aria-label="breadcrumb">
          {crumbs.map(([label, go], i) => i === crumbs.length - 1
            ? <span key={i} className="cur" aria-current="page">{label}</span>
            : <span key={i} style={{ display: 'contents' }}><button onClick={() => push(go!)}>{label}</button><span aria-hidden="true">/</span></span>)}
        </nav>
        <h1>{title}</h1>
      </div>
      <form className={`search ${listening ? 'listening' : ''}`} role="search" onSubmit={submit}>
        <Ic n="search" s={18} />
        <input type="search" placeholder={t('search')} aria-label={t('search')} autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="listen-ov" aria-hidden="true"><span className="eq"><i /><i /><i /></span>{t('listening')}</span>
        <button type="button" className="mic" aria-label={t('speak')} onClick={mic}><Ic n="mic" s={18} /></button>
      </form>
      <div style={{ position: 'relative' }} data-menu="bell">
        <button className="ibtn" aria-label={`${t('notifications')}${unread ? ' · ' + t('newN', { n: unread }) : ''}`} aria-expanded={menu === 'bell'} onClick={() => setMenu(menu === 'bell' ? null : 'bell')}>
          <Ic n="bell" s={22} />{unread ? <i className="dot" /> : null}
        </button>
        {menu === 'bell' ? (
          <div className="pop wide" role="dialog" aria-label={t('notifications')}>
            <div className="pop-h"><h3>{t('notifications')}</h3>{unread ? <button className="link" onClick={() => set((d) => { d.unread = []; })}>{t('d_markRead')}</button> : null}</div>
            <div className="ncard" style={{ padding: '0 16px' }}><NotifList /></div>
          </div>
        ) : null}
      </div>
      <div style={{ position: 'relative' }} data-menu="me">
        <button className="me" aria-label={t('account')} aria-expanded={menu === 'me'} onClick={() => setMenu(menu === 'me' ? null : 'me')}>
          <MeAv cls="sm" /><span className="nm">{userName()}</span><span className="chev"><Ic n="chevD" s={16} /></span>
        </button>
        {menu === 'me' ? (
          <div className="pop" role="menu" aria-label={t('account')}>
            <button className="menu-i" role="menuitem" onClick={() => { setMenu(null); push('/profile'); }}><Ic n="user" s={18} />{t('profile')}</button>
            <button className="menu-i" role="menuitem" onClick={() => { setMenu(null); push('/profile?section=settings'); }}><Ic n="gear" s={18} />{t('settings')}</button>
            <button className="menu-i" role="menuitem" onClick={() => { setMenu(null); push('/welcome'); }}><Ic n="globe" s={18} />{t('d_langIntro')}</button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function topTitle(view: View, courseId: string | undefined, t: ReturnType<typeof useZ>['t'], L: ReturnType<typeof useZ>['L']) {
  if (view === 'home') return t('overview');
  if (view === 'course' && courseId) return L(course(courseId).title);
  if (view === 'work') return t('companiesHiring');
  return t(view as 'courses');
}
