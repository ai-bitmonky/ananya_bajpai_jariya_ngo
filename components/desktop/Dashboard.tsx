'use client';
import { ZARIYA, course, type Job } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav } from '@/lib/nav';
import { Art, Av, FriendStack, Ic, Mark, Ring, Seal, Segs, Tick, WeekChart, nf, BRAND } from './ui';
import { NotifList } from './Shell';
import { U, curriculum, nextThursday, useDesk } from './model';
import { useToast } from './ui';

export function WorkRow({ j }: { j: Job }) {
  const { s, t, L } = useZ();
  const { push } = useNav();
  const ap = !!s.applied[j.id];
  return (
    <div className="wrow">
      <Art o={j} />
      <span className="tx"><b><button className="stretch" style={{ textAlign: 'left' }} onClick={() => push(`/work/${j.id}`)}>{L(j.title)}</button></b><span>{L(j.role)}</span></span>
      <span className="km num">{j.km}<small>{t('km')}</small></span>
      <span className="pay">{L(j.pay).split(' · ')[0]}</span>
      {ap ? <span className="chip leaf fchip"><Ic n="check" s={14} sw={2.6} />{t('applied')}</span>
        : j.friends ? <span className="chip sky fchip"><FriendStack n={j.friends} friends={ZARIYA.friends} />{j.friends === 1 ? t('friendWork') : t('friendsWork', { n: j.friends })}</span>
        : j.urgent ? <span className="chip alert fchip num">{t('seatsLeft', { n: j.left })}</span>
        : <span className="chip fchip">{L(j.type)}</span>}
      <span className="chev" style={{ color: 'var(--fg-3)' }}><Ic n="chevR" s={18} /></span>
    </div>
  );
}

export default function Dashboard() {
  const { s, set, t, L, userName, doneN, pct } = useZ();
  const { push } = useNav();
  const toast = useToast();
  const D = useDesk();
  const c = course('sewing');
  const curN = D.curN(c);
  const cur = curriculum(c)[curN - 1];
  const forMe = ZARIYA.schemes.filter((x) => x.forMe && x.type === 'central').slice(0, 3);
  const pop = ZARIYA.courses.filter((x) => x.popular).slice(0, 4);
  const works = ZARIYA.work.slice(0, 3);
  const togo = Math.max(U.goalMinutes - s.minutesToday, 0);
  const certNames = D.certs.map((x) => (x.cid ? L(course(x.cid).title) : ZARIYA.schemes.find((y) => y.id === x.sid)!.short)).join(' · ');
  const thu = nextThursday();
  const online = ZARIYA.friends.filter((f) => f.online).length;

  return (
    <div className="dash">
      <section className="hero band" aria-labelledby="hello">
        <span className="wordmark wordmark--outline" aria-hidden="true">{BRAND}</span>
        <div>
          <p className="eyebrow">{D.fmtDate(D.now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h2 id="hello">{t('hello')}, {userName()}</h2><p>{t('welcome')}</p>
        </div>
        <div className="hero-r">
          <span className="pill-band"><span className="fl"><Ic n="flame" s={18} /></span><span className="num">{t('dayStreak', { n: U.streakDays })}</span></span>
          <button className="pill-band" onClick={() => push('/schemes')}><Ic n="scheme" s={18} />{t('matchN', { n: D.matchCount })}</button>
        </div>
      </section>

      <div className="dash-main">
        {!s.introSeen ? (
          <section className="card pz" aria-labelledby="pz">
            <span className="pz-ic"><Ic n="globe" s={24} /></span>
            <div className="tx"><h2 id="pz">{t('d_personalise')}</h2><p>{t('d_personaliseSub')}</p></div>
            <button className="btn pri sm" onClick={() => push('/welcome')}>{t('start')}<Ic n="chevR" s={16} /></button>
            <button className="ibtn" aria-label={t('d_dismiss')} title={t('d_dismiss')} onClick={() => set((d) => { d.introSeen = true; })}><Ic n="x" s={20} /></button>
          </section>
        ) : null}

        <div className="r1">
          <article className="card cont hov">
            <Art o={c} />
            <div className="cont-b">
              <p className="eyebrow">{t('continueLearning')}</p>
              <h3>{L(c.title)}</h3>
              <p className="ln">{t('lesson')} {cur.n} · {D.lessonTitle(c, cur)}</p>
              <p className="by">{L(c.by)}</p>
              <div className="prog"><div className="prog-l"><span>{t('lessonsDoneN', { d: doneN(c), n: c.lessons })}</span><b className="num">{pct(c)}%</b></div><Segs c={c} d={doneN(c)} /></div>
              <div className="cont-a">
                <button className="btn pri stretch" onClick={() => push(`/courses/sewing/lesson/${curN}?tab=lessons`)}><Ic n="play" s={18} />{t('continueBtn')}</button>
                <span className="chip line"><Ic n="clock" s={14} /><span className="num">{cur.d}</span> {t('min')}</span>
              </div>
            </div>
          </article>
          <section className="card tile" aria-labelledby="tdy">
            <p className="eyebrow" id="tdy">{t('todaysProgress')}</p>
            <div className="tile-row"><Ring val={s.minutesToday} max={U.goalMinutes} size={92} sw={8} /><p className="cap">{togo ? t('minToGo', { n: togo }) : t('goalMet')}</p></div>
          </section>
          <section className="card tile cert-tile hov" aria-labelledby="crt">
            <p className="eyebrow" id="crt">{t('certificates')}</p>
            <div className="tile-row">
              <div className="cert-n"><b className="num">{D.certs.length}</b><span className="seal"><Seal s={40} /></span></div>
              <div><p className="cap" style={{ margin: '0 0 4px' }}>{certNames}</p><button className="link stretch" style={{ marginLeft: -4 }} onClick={() => push('/profile')}>{t('viewAll')}<Ic n="chevR" s={14} /></button></div>
            </div>
          </section>
        </div>

        <div className="r2">
          <section className="card pad" aria-labelledby="wk">
            <div className="card-h"><div><h2 id="wk">{t('weeklyLearning')}</h2><div className="sub">{t('dailyGoal', { n: U.goalMinutes })}</div></div>
              <div className="wk-sum"><b className="num">{D.weekTotal}</b><span>{t('d_weekTotal')}</span></div></div>
            <WeekChart w={D.weekArr} todayIdx={D.tIdx} />
          </section>
          <section className="card pad" aria-labelledby="fy">
            <div className="card-h"><div><h2 id="fy">{t('forYou')}</h2><div className="sub">{t('matchN', { n: D.matchCount })}</div></div>
              <button className="link" onClick={() => push('/schemes')}>{t('seeAll')}<Ic n="chevR" s={14} /></button></div>
            <div className="list">
              {forMe.map((sc) => (
                <button key={sc.id} className="li" onClick={() => push(`/schemes/${sc.id}`)}>
                  <Mark s={sc} size={44} /><span className="tx"><b>{L(sc.name)}</b><span>{L(sc.tag)}</span></span>
                  <span title={t('youMatch')} aria-label={t('youMatch')} role="img"><Tick s={12} /></span>
                  <span className="chev"><Ic n="chevR" s={18} /></span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section aria-labelledby="pp">
          <div className="sec-h"><h2 id="pp">{t('popular')}</h2><button className="link" onClick={() => push('/courses')}>{t('seeAll')}<Ic n="chevR" s={14} /></button></div>
          <div className="grid4">
            {pop.map((x) => (
              <article key={x.id} className="card ccard hov">
                <Art o={x} title className="ratio-16-11" />
                <h3><button className="stretch" style={{ textAlign: 'left' }} onClick={() => push(`/courses/${x.id}`)}>{L(x.title)}</button></h3>
                <p className="by">{L(x.by)}</p>
                <div className="meta"><span><span className="num">{nf(x.learners)}</span> {t('learners')}</span><span className="star"><Ic n="star" s={14} /><b className="num">{x.rating}</b></span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="card pad" aria-labelledby="wn">
          <div className="card-h"><div><h2 id="wn">{t('nearbyWork')}</h2><div className="sub">{t('companiesHiring')}</div></div><button className="link" onClick={() => push('/work')}>{t('seeAll')}<Ic n="chevR" s={14} /></button></div>
          <div>{works.map((j) => <WorkRow key={j.id} j={j} />)}</div>
        </section>
      </div>

      <aside className="rail" aria-label={t('notifications')}>
        <section className="card pad ncard" aria-labelledby="nt">
          <div className="card-h" style={{ marginBottom: 8 }}><h2 id="nt">{t('notifications')}</h2>{s.unread.length ? <span className="chip blush num">{t('newN', { n: s.unread.length })}</span> : null}</div>
          <NotifList />
        </section>
        <section className="card pad" aria-labelledby="cu">
          <div className="card-h" style={{ marginBottom: 12 }}><h2 id="cu">{t('comingUp')}</h2></div>
          <div className="up">
            <div className="cal" aria-hidden="true"><span>{D.fmtDate(thu, { weekday: 'short' })}</span><b className="num">{thu.getDate()}</b></div>
            <div><p>{t('shgMeet')}</p>
              <button className={`btn ${s.reminder ? 'sec' : 'ghost'} sm`} aria-pressed={s.reminder} onClick={() => { const on = !s.reminder; set((d) => { d.reminder = on; }); if (on) toast(t('d_reminderSet')); }}>
                <Ic n={s.reminder ? 'check' : 'bell'} s={16} />{s.reminder ? t('reminderOn') : t('remind')}
              </button></div>
          </div>
        </section>
        <section className="card pad" aria-labelledby="fo">
          <div className="card-h" style={{ marginBottom: 6 }}><h2 id="fo">{t('friendsOnline')}</h2><span className="chip leaf num">{t('onlineNow', { n: online })}</span></div>
          {ZARIYA.friends.map((f, i) => <div key={i} className="fr"><Av x={f} online={f.online} /><span className="tx"><b>{L(f.name)}</b><span className={f.online ? 'live' : ''}>{L(f.status)}</span></span></div>)}
        </section>
      </aside>
    </div>
  );
}
