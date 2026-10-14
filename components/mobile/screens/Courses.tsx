'use client';
import type { MouseEvent } from 'react';
import { useZ } from '@/lib/store';
import { href } from '@/lib/nav';
import { ZARIYA } from '@/lib/data';
import { buzz, parsePath, useM, type ScreenProps } from '../ctx';
import { Art, Ic, PBar, SearchPill, TopBar, cssv } from '../ui';

const CTABS = ['all', 'ongoing', 'completed', 'saved'] as const;
type CTab = (typeof CTABS)[number];

/** toggles saved + replays the heart pop + toast (shared with course detail) */
export function useHeart() {
  const { s, set, t } = useZ();
  const m = useM();
  return (id: string, e: MouseEvent<HTMLElement>) => {
    const on = !s.saved[id];
    set((d) => { d.saved[id] = on; });
    buzz();
    const b = e.currentTarget;
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    m.toast(on ? t('savedToast') : t('removedToast'));
  };
}

export function Courses({ path }: ScreenProps) {
  const { s, t, L, doneN, pct } = useZ();
  const m = useM();
  const heart = useHeart();
  const { q: sp } = parsePath(path);
  const tabQ = sp.get('tab');
  const tab: CTab = (CTABS as readonly string[]).includes(tabQ || '') ? (tabQ as CTab) : 'all';
  const q = sp.get('q') || '';
  const idx = CTABS.indexOf(tab);

  const ql = q.toLowerCase().trim();
  let list = ZARIYA.courses.filter((c) => {
    const d = doneN(c);
    switch (tab) {
      case 'ongoing': return d > 0 && d < c.lessons;
      case 'completed': return d >= c.lessons;
      case 'saved': return !!s.saved[c.id];
      default: return true;
    }
  });
  if (ql) list = list.filter((c) => [c.title.en, c.title.hi, c.by.en, c.by.hi, c.blurb.en, c.blurb.hi].join(' ').toLowerCase().includes(ql));
  const rank = (c: (typeof list)[number]) => { const d = doneN(c); return d > 0 && d < c.lessons ? 0 : d >= c.lessons ? 1 : 2; };
  list = [...list].sort((a, b) => rank(a) - rank(b));

  return (
    <>
      <TopBar title={t('courses')} />
      <div className="scroll">
        <div className="pad" style={{ paddingTop: 4 }}><SearchPill flat value={q} /></div>
        {q && (
          <div className="qrow">
            <span className="clamp1">{t('results', { q })}</span>
            <button className="link" onClick={() => m.setQuery(href('/courses', { tab: tab === 'all' ? null : tab }))}><Ic k="close" s={16} />{t('clear')}</button>
          </div>
        )}
        <div className="seg" role="tablist" style={cssv({ '--n': 4, '--i': idx })}>
          <span className="seg-ind" />
          {CTABS.map((k) => (
            <button key={k} role="tab" aria-selected={k === tab} onClick={() => { buzz(); m.setQuery(href('/courses', { tab: k === 'all' ? null : k, q })); }}>{t(k)}</button>
          ))}
        </div>
        <ul className="clist" key={tab + '|' + q}>
          {!list.length ? (
            <li className="empty"><span className="ei"><Ic k={tab === 'saved' ? 'heart' : 'courses'} s={28} /></span><p>{tab === 'saved' ? t('emptySaved') : q ? t('noMatch', { q }) : t('noCourses')}</p></li>
          ) : list.map((c, i) => {
            const d = doneN(c), done = d >= c.lessons;
            return (
              <li key={c.id} className="card crow rise" style={cssv({ '--i': i })}>
                <button className="crow-main press" onClick={() => m.go(`/courses/${c.id}`)}>
                  <Art o={c} title={false} cls="art--sq" />
                  <div className="row-b">
                    <h3 className="clamp2">{L(c.title)}</h3>
                    <p className="sub clamp1">{L(c.by)}</p>
                    {done ? (
                      <div className="cprog"><span className="chip chip--gold"><Ic k="award" s={16} />{t('certificate')}</span></div>
                    ) : d > 0 ? (
                      <div className="cprog"><PBar p={d / c.lessons} /><span className="num">{pct(c)}%</span></div>
                    ) : (
                      <div className="cprog"><span className="chip chip--leaf">{t('free')}</span><span className="muted" style={{ textAlign: 'left' }}>{t('lessonsN', { n: c.lessons })}</span></div>
                    )}
                  </div>
                  <span className="chev"><Ic k="chev" s={20} /></span>
                </button>
                <button className="heart" aria-pressed={!!s.saved[c.id]} aria-label={`${t('saveCourse')}: ${L(c.title)}`} onClick={(e) => heart(c.id, e)}>
                  <span><Ic k="heart" s={18} sw={2} /></span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
