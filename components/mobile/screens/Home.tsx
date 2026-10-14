'use client';
import { useEffect, useState } from 'react';
import { useZ } from '@/lib/store';
import { ZARIYA, course, type Job } from '@/lib/data';
import { buzz, useM, type ScreenProps } from '../ctx';
import { Art, Bell, Flame, Ic, LangChip, Mark, MeAv, PBar, PlayIc, Ring, SearchPill, Star, Tick, cssv, useNf } from '../ui';
import { WM, ZU, curriculum } from '../content';

/* The 500 ms skeleton shows once per app load (and again after finishing the intro). */
let homeLoaded = false;
export const resetHomeSkeleton = () => { homeLoaded = false; };

export function WorkRow({ w }: { w: Job }) {
  const { s, t, L } = useZ();
  const m = useM();
  const fr = w.friends;
  return (
    <button className="card wrow press" onClick={() => m.go(`/work/${w.id}`)}>
      <Art o={w} title={false} cls="art--sq" />
      <div className="row-b">
        <p className="row-t clamp1">{L(w.title)}</p>
        <p className="sub clamp1">{L(w.role)}</p>
        <div className="wmeta">
          <span className="pay num">{L(w.pay).split(' · ')[0]}</span>
          {fr > 0 && <span className="chip chip--leaf" style={{ minHeight: 24, padding: '2px 8px' }}><Ic k="users" s={14} />{fr === 1 ? t('friendWork') : t('friendsWork', { n: fr })}</span>}
          {s.applied[w.id] && <span className="chip chip--leaf" style={{ minHeight: 24, padding: '2px 8px' }}><Ic k="check" s={14} sw={2.4} />{t('applied')}</span>}
        </div>
      </div>
      <div className="wkm"><b className="num">{w.km}</b><small>{t('km')}</small></div>
    </button>
  );
}

function nextThursday() {
  const d = new Date();
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7));
  return d.getDate();
}

export function Home(_: ScreenProps) {
  const { s, set, t, L, userName, doneN, nextLesson } = useZ();
  const m = useM();
  const nf = useNf();
  const [loaded, setLoaded] = useState(homeLoaded);
  useEffect(() => {
    if (loaded) return;
    const tm = window.setTimeout(() => { homeLoaded = true; setLoaded(true); }, 500);
    return () => clearTimeout(tm);
  }, [loaded]);

  const band = (
    <header className="band home-band">
      <span className="wm-bleed wordmark wordmark--outline" aria-hidden="true">{WM}</span>
      <div className="band-row">
        <button className="av-btn" aria-label={t('profile')} onClick={() => m.go('/profile')}><MeAv cls="av--band" /></button>
        <div className="band-r"><LangChip band /><Bell band /></div>
      </div>
      <h1 className="greet">{t('hello')}, {userName()}</h1>
      <p className="greet-sub">{t('welcome')}</p>
      <SearchPill />
    </header>
  );

  if (!loaded) {
    return (
      <div className="scroll" aria-busy="true">
        {band}
        <div className="stats2"><div className="sk" style={{ height: 72 }} /><div className="sk" style={{ height: 72 }} /></div>
        <div className="sec"><div className="sk" style={{ height: 24, width: '46%', borderRadius: 8, marginBottom: 14 }} /><div className="sk" style={{ height: 196 }} /></div>
        <div className="sec"><div className="sk" style={{ height: 24, width: '52%', borderRadius: 8, marginBottom: 14 }} /><div style={{ display: 'flex', gap: 12 }}><div className="sk" style={{ height: 150, flex: 1 }} /><div className="sk" style={{ height: 150, width: '30%' }} /></div></div>
      </div>
    );
  }

  const c = course('sewing');
  const curN = nextLesson(c);
  const cur = curN ? curriculum(c)[curN - 1] : null;
  const forMe = ZARIYA.schemes.filter((x) => x.forMe && x.type === 'central').slice(0, 3);
  const pop = ZARIYA.courses.filter((x) => x.popular);
  const jobs = ZARIYA.work.slice(0, 2);
  const shg = t('shgMeet').split(' · ');
  let i = 2;

  return (
    <div className="scroll">
      {band}
      <div className="stats2">
        <div className="card stat rise" style={cssv({ '--i': 0 })}>
          <span className="flame"><Flame /></span>
          <div><b className="num">{ZU.streakDays}</b><small>{t('streakShort')}</small></div>
        </div>
        <div className="card stat rise" style={cssv({ '--i': 1 })}>
          <Ring v={s.minutesToday} max={ZU.goalMinutes} />
          <div><b className="num" style={{ fontSize: 17 }}>{s.minutesToday}/{ZU.goalMinutes}</b><small>{t('todaysProgress')}</small></div>
        </div>
      </div>

      {!s.introSeen && (
        <section className="sec rise" style={cssv({ '--i': i++ })}>
          <div className="card pers">
            <span className="pers-wm wordmark" aria-hidden="true">{WM}</span>
            <button className="ib x" aria-label={t('m_notNow')} onClick={() => { buzz(); set((d) => { d.introSeen = true; }); }}><Ic k="close" s={20} /></button>
            <div className="pers-top">
              <span className="nic"><Ic k="globe" s={22} sw={2} /></span>
              <div className="row-b"><h3>{t('m_personalise')}</h3><p className="sub">{t('m_personaliseSub')}</p></div>
            </div>
            <div className="pers-act">
              <button className="btn btn--sm" onClick={() => m.go('/welcome')}>{t('start')}<Ic k="chev" s={18} sw={2.4} /></button>
              <button className="btn btn--sm btn--ghost" onClick={() => { buzz(); set((d) => { d.introSeen = true; }); }}>{t('m_notNow')}</button>
            </div>
          </div>
        </section>
      )}

      <section className="sec rise" style={cssv({ '--i': i++ })}>
        <div className="sec-h"><h2>{t('continueLearning')}</h2></div>
        <article className="card hero">
          <button className="hero-top press" style={{ width: '100%', textAlign: 'left' }} onClick={() => m.go('/courses/sewing')}>
            <Art o={c} title={false} cls="art--sq" />
            <div style={{ minWidth: 0 }}>
              <p className="hero-eb clamp1">{cur ? `${t('lesson')} ${cur.n} · ${L(cur.t)}` : t('allLessonsDone')}</p>
              <h3 className="clamp2">{L(c.title)}</h3>
              <p className="muted clamp1" style={{ marginTop: 2 }}>{L(c.by)}</p>
            </div>
          </button>
          <div className="hero-p"><PBar p={doneN(c) / c.lessons} /><span className="num">{doneN(c)}/{c.lessons}</span></div>
          <button className="btn btn--block" onClick={() => m.go(`/courses/sewing/lesson/${curN ?? 1}`)}>
            <PlayIc />{t('continueBtn')} · {t('lesson')} {curN ?? 1}
          </button>
        </article>
      </section>

      <section className="sec rise" style={cssv({ '--i': i++ })}>
        <div className="sec-h"><h2>{t('forYou')}</h2><button className="link" onClick={() => m.tab('/schemes')}>{t('seeAll')}<Ic k="chev" s={18} /></button></div>
        <p className="sub" style={{ margin: '-6px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}><Tick />{t('matchN', { n: ZARIYA.schemes.filter((x) => x.forMe).length })}</p>
        <div className="hs">
          {forMe.map((x) => (
            <button key={x.id} className="card schm press" onClick={() => m.go(`/schemes/${x.id}`)}>
              <span className="schm-top"><Mark s={x} /><span className="chip chip--line">{t(x.type)}</span></span>
              <b>{x.short}</b>
              <p className="clamp2">{L(x.tag)}</p>
              <span className="match-pill"><Tick />{t('youMatch')}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sec rise" style={cssv({ '--i': i++ })}>
        <div className="sec-h"><h2>{t('popular')}</h2><button className="link" onClick={() => m.tab('/courses')}>{t('seeAll')}<Ic k="chev" s={18} /></button></div>
        <div className="hs">
          {pop.map((x) => (
            <button key={x.id} className="pop press" onClick={() => m.go(`/courses/${x.id}`)}>
              <Art o={x} />
              <div className="pop-m">
                <p className="sub clamp1">{L(x.by)}</p>
                <p className="muted num"><Star />{x.rating} · {nf(x.learners)} {t('learners')}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="sec rise" style={cssv({ '--i': i++ })}>
        <div className="sec-h"><h2>{t('nearbyWork')}</h2><button className="link" onClick={() => m.tab('/work')}>{t('seeAll')}<Ic k="chev" s={18} /></button></div>
        {jobs.map((w) => <WorkRow key={w.id} w={w} />)}
      </section>

      <section className="sec rise" style={cssv({ '--i': i++ })}>
        <div className="sec-h"><h2>{t('comingUp')}</h2></div>
        <button className="card shg press" aria-pressed={s.reminder} onClick={() => {
          buzz();
          const on = !s.reminder;
          set((d) => { d.reminder = on; });
          if (on) m.toast(t('reminderSet'));
        }}>
          <span className="cal"><small>{t('thu')}</small><b className="num">{nextThursday()}</b></span>
          <div className="row-b"><p className="row-t">{shg[0]}</p><p className="sub">{shg.slice(1).join(' · ')}</p></div>
          {s.reminder
            ? <span className="chip chip--leaf"><Ic k="check" s={16} sw={2.4} />{t('reminderOn')}</span>
            : <span className="chip chip--sky"><Ic k="bell" s={16} />{t('remindMe')}</span>}
        </button>
      </section>
    </div>
  );
}
