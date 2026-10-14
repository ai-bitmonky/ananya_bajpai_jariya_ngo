'use client';
import { ZARIYA, type Course } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav, href } from '@/lib/nav';
import { Art, Ic, Progress, Seal, hrs, nf, sv } from './ui';
import { useDesk } from './model';
import { useToast } from './ui';

type CTab = 'all' | 'ongoing' | 'completed' | 'saved';
type Sort = 'recent' | 'popular' | 'short';
const TABS: CTab[] = ['all', 'ongoing', 'completed', 'saved'];
const SORTS: [Sort, 'sortRecent' | 'sortPopular' | 'sortShort'][] = [['recent', 'sortRecent'], ['popular', 'sortPopular'], ['short', 'sortShort']];

export function useHeart() {
  const { s, set, t } = useZ();
  const toast = useToast();
  return (id: string) => { const on = !s.saved[id]; set((d) => { d.saved[id] = on; }); toast(on ? t('savedToast') : t('unsavedToast')); };
}

function CourseCard({ c, onCert }: { c: Course; onCert: (id: string) => void }) {
  const { s, t, L, doneN, pct } = useZ();
  const { push } = useNav();
  const D = useDesk();
  const heart = useHeart();
  const st = D.cState(c), saved = !!s.saved[c.id];
  return (
    <article className="card cc hov">
      <div style={{ position: 'relative' }}>
        <Art o={c} className="ratio-16-10" /><span className="lvl">{L(c.level)}</span>
        <button className="heart" aria-pressed={saved} aria-label={`${saved ? t('savedCourse') : t('saveCourse')}: ${L(c.title)}`} onClick={() => heart(c.id)}><Ic n="heart" s={20} /></button>
      </div>
      <div className="cc-b">
        <h3><button className="stretch" style={{ textAlign: 'left' }} onClick={() => push(`/courses/${c.id}`)}>{L(c.title)}</button></h3>
        <p className="by">{L(c.by)}</p>
        <div className="cc-f">
          {st === 'completed' ? (
            <div className="cc-m"><button className="badge-cert" onClick={() => onCert(c.id)}><span className="seal"><Seal s={24} /></span>{t('certificate')}</button><span className="star"><Ic n="star" s={14} /><b className="num">{c.rating}</b></span></div>
          ) : st === 'ongoing' ? (
            <><div className="cc-m"><span>{t('lessonsDoneN', { d: doneN(c), n: c.lessons })}</span><b className="num">{pct(c)}%</b></div><Progress p={pct(c)} /></>
          ) : (
            <>
              <div className="cc-m"><span><Ic n="clock" s={14} /> <span className="num">{c.lessons}</span> {t('lessons')} · <span className="num">{hrs(c.mins)}</span> {t('hrs')}</span><span className="star"><Ic n="star" s={14} /><b className="num">{c.rating}</b></span></div>
              <div className="cc-m"><span className="chip line">{t('notStarted')}</span><span><span className="num">{nf(c.learners)}</span> {t('learners')}</span></div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Courses({ onCert }: { onCert: (id: string) => void }) {
  const { s, t } = useZ();
  const { route, replace } = useNav();
  const D = useDesk();
  const tabQ = route.q.get('tab') as CTab | null;
  const tab: CTab = tabQ && TABS.includes(tabQ) ? tabQ : 'all';
  const q = route.q.get('q') || '';
  const sortQ = route.q.get('sort') as Sort | null;
  const sort: Sort = sortQ && SORTS.some(([k]) => k === sortQ) ? sortQ : 'recent';
  const go = (o: { tab?: CTab; q?: string; sort?: Sort }) => replace(href('/courses', { tab: (o.tab ?? tab) === 'all' ? null : o.tab ?? tab, q: o.q ?? q, sort: (o.sort ?? sort) === 'recent' ? null : o.sort ?? sort }));

  const matchQ = (c: Course) => { if (!q) return true; const l = q.toLowerCase(); return [c.title.en, c.title.hi, c.by.en, c.by.hi].some((x) => x.toLowerCase().includes(l)); };
  let list = ZARIYA.courses.filter(matchQ);
  if (tab === 'ongoing') list = list.filter((c) => D.cState(c) === 'ongoing');
  if (tab === 'completed') list = list.filter((c) => D.cState(c) === 'completed');
  if (tab === 'saved') list = list.filter((c) => s.saved[c.id]);
  const rank = { ongoing: 0, new: 1, completed: 2 } as const;
  const pctOf = (c: Course) => (s.done[c.id] || []).length / c.lessons;
  list = [...list];
  if (sort === 'recent') list.sort((a, b) => rank[D.cState(a)] - rank[D.cState(b)] || pctOf(b) - pctOf(a));
  if (sort === 'popular') list.sort((a, b) => b.learners - a.learners);
  if (sort === 'short') list.sort((a, b) => a.mins - b.mins);

  const cnt = { all: ZARIYA.courses.length, ongoing: ZARIYA.courses.filter((c) => D.cState(c) === 'ongoing').length, completed: ZARIYA.courses.filter((c) => D.cState(c) === 'completed').length, saved: ZARIYA.courses.filter((c) => s.saved[c.id]).length };
  const savedEmpty = tab === 'saved' && !q;

  return (
    <>
      <div className="sumrow">
        <div className="card stat"><span className="si"><Ic n="book" s={22} /></span><div><b className="num">{cnt.ongoing}</b><span>{t('ongoing')}</span></div></div>
        <div className="card stat"><span className="si leaf"><Ic n="check" s={22} sw={2.4} /></span><div><b className="num">{cnt.completed}</b><span>{t('completed')}</span></div></div>
        <div className="card stat"><span className="si gold"><Ic n="award" s={22} /></span><div><b className="num">{D.certs.length}</b><span>{t('certificates')}</span></div></div>
        <div className="card stat"><span className="si sky"><Ic n="clock" s={22} /></span><div><b className="num">{D.weekTotal}</b><span>{t('d_weekTotal')}</span></div></div>
      </div>
      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label={t('courses')} style={sv({ '--x': TABS.indexOf(tab) })}>
          {TABS.map((k) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => go({ tab: k })}>{t(k)}<span className="cnt num">{cnt[k]}</span></button>)}
        </div>
        <label className="field grow"><Ic n="search" s={18} /><input type="search" value={q} placeholder={t('searchMine')} aria-label={t('searchMine')} onChange={(e) => go({ q: e.target.value })} /></label>
        <label className="field"><Ic n="sort" s={18} /><span className="sr">{t('sort')}</span>
          <select aria-label={t('sort')} value={sort} onChange={(e) => go({ sort: e.target.value as Sort })}>{SORTS.map(([k, key]) => <option key={k} value={k}>{t(key)}</option>)}</select>
        </label>
      </div>
      <div className="cgrid" aria-live="polite">
        {list.length ? list.map((c) => <CourseCard key={c.id} c={c} onCert={onCert} />) : (
          <div className="empty">
            <span className="em-ic"><Ic n={savedEmpty ? 'heart' : 'search'} s={32} /></span>
            <p>{savedEmpty ? t('emptySaved') : t('noMatch', { q })}</p>
            {savedEmpty ? <button className="btn sec" onClick={() => go({ tab: 'all' })}>{t('seeAll')}</button> : <button className="btn sec" onClick={() => go({ q: '' })}>{t('clearSearch')}</button>}
          </div>
        )}
      </div>
    </>
  );
}
