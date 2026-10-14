'use client';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { ZARIYA, course } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav, href } from '@/lib/nav';
import { Art, Av, Ic, MeAv, Progress, Tick, hrs, mmss, nf, pad2, sv, useToast } from './ui';
import { curriculum, useDesk } from './model';
import { X } from './content';
import { useHeart } from './Courses';

export interface PlayerState { cid: string; n: number; pos: number; dur: number; playing: boolean; speed: number; subs: 'hi' | 'en' | 'off'; finished: boolean; todo: Record<number, boolean> }
export const initialPlayer = (): PlayerState => ({ cid: '', n: 1, pos: 0, dur: 1200, playing: false, speed: 1, subs: 'hi', finished: false, todo: {} });
type CTab = 'about' | 'lessons' | 'discussion';

export default function CourseView({ id, lessonParam, P, setP }: { id: string; lessonParam: number | null; P: PlayerState; setP: (fn: (p: PlayerState) => PlayerState) => void }) {
  const z = useZ();
  const { s, set, t, L, lang, doneN, pct, isComplete, nextLesson } = z;
  const { route, replace, push } = useNav();
  const toast = useToast();
  const heart = useHeart();
  const D = useDesk();
  const c = course(id) || course('sewing');
  const cur = curriculum(c);
  const done = isComplete(c);
  const tabQ = route.q.get('tab');
  const ctab: CTab = tabQ === 'about' || tabQ === 'discussion' ? tabQ : 'lessons';
  const pwrap = useRef<HTMLElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const [dl, setDl] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const freshLesson = (cid: string, n: number, autoplay: boolean): PlayerState => {
    const cc = course(cid); n = Math.max(1, Math.min(n, cc.lessons));
    return { ...P, cid, n, pos: cid === 'sewing' && n === 7 && doneN(cc) === 6 ? 420 : 0, dur: 1200, playing: autoplay, finished: false, todo: {} };
  };

  // route → player (deep links /courses/:id and /courses/:id/lesson/:n)
  useEffect(() => {
    if (lessonParam != null) { if (P.cid !== c.id || P.n !== lessonParam) setP(() => freshLesson(c.id, lessonParam, false)); }
    else if (P.cid !== c.id) setP(() => freshLesson(c.id, D.curN(c), false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id, lessonParam]);

  // stop playback when leaving the course view
  useEffect(() => () => setP((p) => ({ ...p, playing: false })), [setP]);

  // playback clock (prototype pacing: 250 ms ticks, 5 s × speed)
  useEffect(() => {
    if (!P.playing) return;
    const iv = setInterval(() => setP((p) => ({ ...p, pos: Math.min(p.dur, p.pos + 5 * p.speed) })), 250);
    return () => clearInterval(iv);
  }, [P.playing, setP]);

  const finish = () => {
    const n = P.n;
    setP((p) => ({ ...p, playing: false, pos: p.dur, finished: true }));
    if (P.cid === c.id && n === nextLesson(c)) set((d) => { d.done[c.id] = [...(d.done[c.id] || []), n]; d.minutesToday = Math.min(d.minutesToday + 20, 99); });
    try { navigator.vibrate?.(8); } catch {}
  };
  useEffect(() => { if (P.playing && P.pos >= P.dur) finish(); }); // eslint-disable-line react-hooks/exhaustive-deps

  const tabPath = (tab: CTab) => (tab === 'lessons' ? null : tab);
  const basePath = () => (lessonParam != null ? `/courses/${c.id}/lesson/${lessonParam}` : `/courses/${c.id}`);
  const loadLesson = (n: number, autoplay = false) => {
    if (n > c.lessons) return;
    setP(() => freshLesson(c.id, n, autoplay));
    replace(href(`/courses/${c.id}/lesson/${n}`, { tab: tabPath(ctab) }));
    pwrap.current?.scrollIntoView({ block: 'nearest' });
  };
  const togglePlay = () => setP((p) => (p.finished ? { ...p, finished: false, pos: 0, playing: true } : { ...p, playing: !p.playing }));
  const seek = (a: number) => setP((p) => ({ ...p, pos: Math.max(0, Math.min(p.dur - 1, p.pos + a * 20)) }));
  const openCert = () => push(`/courses/${c.id}/certificate`);

  const scrubClick = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setP((p) => ({ ...p, pos: Math.max(0, Math.min(p.dur - 1, ((e.clientX - r.left) / r.width) * p.dur)) }));
    scrubRef.current?.focus();
  };
  const scrubKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); seek(e.key === 'ArrowRight' ? 10 : -10); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePlay(); }
  };

  const startOffline = () => {
    setDl(0);
    let v = 0;
    const iv = setInterval(() => { v = Math.min(100, v + 10); setDl(v); if (v >= 100) { clearInterval(iv); set((d) => { d.offline[c.id] = true; }); setDl(null); toast(t('savedOffline')); } }, 180);
  };
  const send = (e: FormEvent) => { e.preventDefault(); const v = msg.trim(); if (!v) return; set((d) => { d.posts[c.id] = [...(d.posts[c.id] || []), v]; }); setMsg(''); };

  const posts = s.posts[c.id] || [];
  const isDoneN = (n: number) => (s.done[c.id] || []).includes(n);
  const curNo = D.curN(c);
  const tabs: [CTab, string, number?][] = [['about', t('about')], ['lessons', t('lessonsTab'), c.lessons], ['discussion', t('discuss'), X.discussion.length + posts.length]];
  const [inst, org] = L(c.by).split(' · ');
  const ready = P.cid === c.id;
  const pc = ready ? P : freshLesson(c.id, curNo, false);
  const queue = cur.filter((l) => l.n > pc.n).slice(0, 3);
  const invitedN = ZARIYA.friends.filter((f) => s.invited[f.name.en]).length;

  let panel;
  if (ctab === 'lessons') {
    panel = (
      <div className="lgrid">
        {cur.map((l) => {
          const st = D.lstate(c, l.n), playing = pc.n === l.n;
          return (
            <button key={l.n} className={`lrow ${st} ${playing ? 'playing' : ''}`} aria-current={playing ? 'true' : 'false'} onClick={() => loadLesson(l.n)}>
              <span className="no num">{pad2(l.n)}</span>
              <span className="tx"><b>{D.lessonTitle(c, l)}</b><span><span className="num">{l.d}</span> {t('min')}{st === 'locked' ? ' · ' + t('locked') : ''}</span></span>
              {st === 'cur' ? <span className="rs">{pc.n === l.n && pc.pos > 0 ? t('resume') : t('start')}</span> : null}
              <span className="lst">{st === 'done' ? <Ic n="check" s={16} sw={2.8} /> : st === 'cur' ? <Ic n="play" s={14} sw={2.4} /> : <Ic n="lock" s={14} />}</span>
            </button>
          );
        })}
      </div>
    );
  } else if (ctab === 'about') {
    const learn = c.curriculum ? [3, 7, 8, 9].map((n) => L(c.curriculum![n - 1].t)) : L(c.blurb).split(/(?<=[.।])\s+/).filter(Boolean);
    panel = (
      <div className="about">
        <div>
          <p className="prose">{L(c.blurb)}</p>
          <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 12 }}>{t('whatYouLearn')}</h3>
          <ul className="learn">{learn.map((x, i) => <li key={i}><Tick s={12} /><span>{x}</span></li>)}</ul>
          <div className="instr"><Av x={{ hue: c.art[0], initial: Array.from(inst.trim())[0] }} cls="lg" /><div><span className="eyebrow">{t('instructor')}</span><b>{inst}</b><span>{org || ''}</span></div></div>
        </div>
        <div>
          <div className="facts">
            <div className="fact"><span className="eyebrow">{t('level')}</span><b>{L(c.level)}</b></div>
            <div className="fact"><span className="eyebrow">{t('duration')}</span><b className="num">{hrs(c.mins)} {t('hrs')}</b></div>
            <div className="fact"><span className="eyebrow">{t('lessonsTab')}</span><b className="num">{c.lessons}</b></div>
            <div className="fact"><span className="eyebrow">{t('language')}</span><b>{ZARIYA.languages[1].native}</b></div>
          </div>
          <div className="dl">
            {s.offline[c.id] ? <span className="chip leaf" style={{ height: 46, width: '100%', justifyContent: 'center' }}><Ic n="check" s={16} sw={2.6} />{t('savedOffline')}</span>
              : dl != null ? <div className="dlbar" style={sv({ '--p': dl + '%' })} role="progressbar" aria-valuenow={dl} aria-valuemin={0} aria-valuemax={100}><i /><span className="num">{t('d_downloading', { n: dl })}</span></div>
              : <button className="btn ghost full" onClick={startOffline}><Ic n="download" s={18} />{t('downloadOffline')}</button>}
          </div>
        </div>
      </div>
    );
  } else {
    panel = (
      <>
        <div className="msgs">
          {X.discussion.map((m, i) => (
            <div key={i} className="msg"><Av x={m} cls="sm" /><div className="bub"><div className="who">{L(m.who)}{m.instr ? <span className="chip blush" style={{ height: 20 }}>{t('instructor')}</span> : null}<time>{L(m.when)}</time></div><p>{L(m.t)}</p></div></div>
          ))}
          {posts.map((m, i) => (
            <div key={'p' + i} className="msg me"><MeAv cls="sm" /><div className="bub"><div className="who">{t('you')}<time>{t('justNow')}</time></div><p>{m}</p></div></div>
          ))}
        </div>
        <form className="compose" onSubmit={send}>
          <label className="field"><Ic n="edit" s={18} /><input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t('d_writeMsg')} aria-label={t('d_writeMsg')} autoComplete="off" /></label>
          <button className="btn pri" type="submit"><Ic n="send" s={18} />{t('sendMsg')}</button>
        </form>
      </>
    );
  }

  const cl = cur[pc.n - 1], last = pc.n >= c.lessons, p = (pc.pos / pc.dur) * 100;
  const nDone = isDoneN(pc.n);

  return (
    <div className="cd">
      <div className="cd-main">
        <section className="art cd-hero" style={sv({ '--a0': c.art[0], '--a1': c.art[1] })}>
          <Ic d={c.icon} s={24} sw={1.2} className="ic" />
          <button className="heart" aria-pressed={!!s.saved[c.id]} aria-label={s.saved[c.id] ? t('savedCourse') : t('saveCourse')} onClick={() => heart(c.id)}><Ic n="heart" s={20} /></button>
          <p className="eyebrow">{done ? t('courseDone') : t('continueLearning')}</p>
          <h2>{L(c.title)}</h2>
          <p className="by">{lang === 'hi' ? `${L(c.by)} ${t('byLine')}` : `${t('byLine')} ${L(c.by)}`}</p>
          <div className="hchips">
            <span className="hchip"><Ic n="book" s={14} /><span className="num">{c.lessons}</span> {t('lessons')}</span>
            <span className="hchip"><Ic n="clock" s={14} /><span className="num">{c.mins}</span> {t('min')}</span>
            <span className="hchip">{L(c.level)}</span>
            <span className="hchip"><span className="st"><Ic n="star" s={14} /></span><span className="num">{c.rating}</span> · <span className="num">{nf(c.learners)}</span> {t('learners')}</span>
          </div>
          <div className="cd-hero-a">
            {done ? <button className="btn on-band" onClick={openCert}><Ic n="award" s={18} />{t('getCertificate')}</button>
              : <button className="btn on-band" onClick={() => loadLesson(curNo, true)}><Ic n="play" s={18} />{doneN(c) ? t('resume') : t('start')} · {t('lesson')} {curNo}</button>}
            <span className="prg"><span className="num">{pct(c)}%</span><Progress p={pct(c)} /></span>
          </div>
        </section>
        <div className="ptabs" role="tablist">
          {tabs.map(([k, l, n]) => <button key={k} role="tab" aria-selected={ctab === k} onClick={() => replace(href(basePath(), { tab: tabPath(k) }))}>{l}{n ? <span className="cnt num">{n}</span> : null}</button>)}
        </div>
        <div role="tabpanel">{panel}</div>
      </div>

      <aside className="cd-side" aria-label={t('lessonVideo')}>
        <section className="card pcard" ref={pwrap}>
          <div className={`player ${pc.playing ? 'playing' : ''}`} role="region" aria-label={t('lessonVideo')}>
            <Ic d={c.icon} s={24} sw={1} className="pic" />
            <div className="p-top"><span>{t('lesson')} {pad2(pc.n)} · {pc.playing ? t('nowPlaying') : L(c.title)}</span><span className="num">{t('lessonOf', { n: pc.n, m: c.lessons })}</span></div>
            {pc.finished ? (
              <div className="p-done" role="status"><span className="big"><Ic n="check" s={34} sw={2.6} /></span><h3>{t('lessonDone')}</h3>
                {done ? <button className="btn on-band" onClick={openCert}><Ic n="award" s={18} />{t('getCertificate')}</button>
                  : <button className="btn on-band" onClick={() => loadLesson(pc.n + 1, true)}>{t('nextLesson')}<Ic n="chevR" s={18} /></button>}
              </div>
            ) : (
              <>
                <button className="p-big" aria-label={pc.playing ? t('pause') : t('play')} onClick={togglePlay}><Ic n={pc.playing ? 'pause' : 'play'} s={28} sw={2.4} /></button>
                {pc.subs !== 'off' ? <span className="p-cap" lang={pc.subs}>{X.caption[pc.subs]}</span> : null}
                <div className="p-bot">
                  <div ref={scrubRef} className="scrub" role="slider" tabIndex={0} aria-label={t('seek')} aria-valuemin={0} aria-valuemax={pc.dur} aria-valuenow={Math.round(pc.pos)} aria-valuetext={mmss(pc.pos)} style={sv({ '--p': p + '%' })} onClick={scrubClick} onKeyDown={scrubKey}><div className="tr"><i /><b /></div></div>
                  <div className="p-ctl">
                    <button className="pb" aria-label={t('back10')} onClick={() => seek(-10)}><Ic n="rew" s={20} /></button>
                    <button className="pb" aria-label={pc.playing ? t('pause') : t('play')} onClick={togglePlay}><Ic n={pc.playing ? 'pause' : 'play'} s={20} sw={2.2} /></button>
                    <button className="pb" aria-label={t('fwd10')} onClick={() => seek(10)}><Ic n="fwd" s={20} /></button>
                    <span className="tm num">{mmss(pc.pos)} / {mmss(pc.dur)}</span>
                    <button className="pill sp num" aria-label={`${t('speed')} ${pc.speed}×`} onClick={() => setP((q) => ({ ...q, speed: q.speed === 1 ? 1.25 : q.speed === 1.25 ? 1.5 : 1 }))}>{pc.speed}×</button>
                    <button className="pill" aria-pressed={pc.subs !== 'off'} aria-label={t('subtitles')} onClick={() => setP((q) => ({ ...q, subs: q.subs === 'off' ? 'hi' : q.subs === 'hi' ? 'en' : 'off' }))}><Ic n="cc" s={14} />{pc.subs === 'off' ? '' : pc.subs.toUpperCase()}</button>
                    <button className="pb" aria-label={t('download')} onClick={() => toast(t('savedOffline'))}><Ic n="download" s={18} /></button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="pbody">
            <p className="eyebrow">{t('lesson')} {pc.n} · <span className="num">{cl.d}</span> {t('min')}</p>
            <h3>{D.lessonTitle(c, cl)}</h3>
            <p className="eyebrow" style={{ marginBottom: 6 }}>{t('whatToDo')}</p>
            <ul className="todo">
              {X.todo.map((x, i) => (
                <li key={i}><button role="checkbox" aria-checked={!!pc.todo[i] || nDone} onClick={() => setP((q) => ({ ...q, todo: { ...q.todo, [i]: !q.todo[i] } }))}><span className="cbx"><Ic n="check" s={14} sw={3} /></span><span className="tt">{L(x)}</span></button></li>
              ))}
            </ul>
            {nDone
              ? (done && last ? <button className="btn pri full" onClick={openCert}><Ic n="award" s={18} />{t('getCertificate')}</button>
                : <button className="btn sec full" onClick={() => loadLesson(pc.n + 1)}>{t('nextLesson')}<Ic n="chevR" s={18} /></button>)
              : <button className="btn pri full" onClick={finish}><Ic n="check" s={18} sw={2.4} />{t('markDone')}</button>}
          </div>
        </section>
        {queue.length ? (
          <section className="card pad">
            <div className="card-h" style={{ marginBottom: 8 }}><h2>{t('upNext')}</h2><span className="sub num">{t('lessonsDoneN', { d: doneN(c), n: c.lessons })}</span></div>
            {queue.map((l) => (
              <button key={l.n} className="qrow" onClick={() => loadLesson(l.n)}>
                <Art o={c} /><span className="tx"><b>{pad2(l.n)} · {D.lessonTitle(c, l)}</b><span><span className="num">{l.d}</span> {t('min')}</span></span>
                {D.lstate(c, l.n) === 'locked' ? <span style={{ color: 'var(--fg-3)' }}><Ic n="lock" s={16} /></span> : <Ic n="chevR" s={16} />}
              </button>
            ))}
          </section>
        ) : null}
        <section className="card pad">
          <div className="card-h" style={{ marginBottom: 6 }}><h2>{t('invite')}</h2>{invitedN ? <span className="chip leaf num">{t('invitedN', { n: invitedN })}</span> : null}</div>
          <p style={{ margin: '0 0 8px', fontSize: 'var(--fs-sm)', color: 'var(--fg-2)' }}>{t('learnTogether')}</p>
          {ZARIYA.friends.map((f, i) => {
            const on = !!s.invited[f.name.en];
            return (
              <div key={i} className="inv-row"><Av x={f} cls="sm" online={f.online} /><span className="tx"><b>{L(f.name)}</b><span>{L(f.status)}</span></span>
                <button className="addb" aria-pressed={on} aria-label={`${on ? t('invited') : t('invite')}: ${L(f.name)}`} onClick={() => { set((d) => { d.invited[f.name.en] = !on; }); if (!on) toast(t('inviteSent', { name: L(f.name) })); }}>
                  {on ? <><Ic n="check" s={14} sw={2.6} />{t('invited')}</> : <Ic n="plus" s={18} sw={2.2} />}
                </button>
              </div>
            );
          })}
        </section>
      </aside>
    </div>
  );
}
