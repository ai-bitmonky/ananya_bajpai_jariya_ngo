'use client';
/* Lesson player: real-time playback (1 s = 20 s of the 20:00 video), ±10 s, scrubber, speed,
   subtitles (HI/EN), save offline; at the end an overshoot tick + next lesson / certificate. */
import { useEffect, useRef, useState } from 'react';
import { useZ } from '@/lib/store';
import { course } from '@/lib/data';
import { EXTRA } from '@/lib/strings';
import { buzz, useM, type ScreenProps } from '../ctx';
import { F } from '../icons';
import { Art, BackBtn, Fill, Ic, SheetHead, cssv } from '../ui';
import { Sheet } from '../Sheet';
import { I } from '../icons';
import { SPEEDS, VLEN, curriculum, mmss } from '../content';

interface PlayerState { pos: number; playing: boolean; speed: number; subs: boolean; subLang: 'en' | 'hi'; todo: Record<number, boolean>; finished: boolean; q: 'ds' | 'hd' }

export function Lesson({ id, n, active }: ScreenProps & { id: string; n: number }) {
  const { s, set, t, L, lang, doneN, isComplete, nextLesson } = useZ();
  const m = useM();
  const c = course(id);
  const lessons = curriculum(c);
  const l = lessons[n - 1] || lessons[0];
  const next = lessons[n] || null;
  const isDone = (s.done[id] || []).includes(n);
  const complete = isComplete(c);

  const [v, setV] = useState<PlayerState>(() => ({
    pos: nextLesson(c) === n && !isDone ? 420 : 0, playing: false, speed: 1, subs: true, subLang: lang, todo: {}, finished: false, q: 'ds',
  }));
  const [opts, setOpts] = useState(false);
  const sc = useRef<HTMLDivElement>(null);
  const upd = (f: (x: PlayerState) => Partial<PlayerState>) => setV((x) => ({ ...x, ...f(x) }));

  const complete1 = () => {
    if (!(s.done[id] || []).includes(n)) set((d) => { const a = (d.done[id] ||= []); if (!a.includes(n)) a.push(n); });
    upd(() => ({ finished: true, playing: false, pos: VLEN }));
    buzz();
    m.toast(t('markedDone', { n }));
  };
  const completeRef = useRef(complete1);
  completeRef.current = complete1;

  // playback clock
  useEffect(() => {
    if (!v.playing) return;
    const tm = window.setInterval(() => setV((x) => ({ ...x, pos: Math.min(VLEN, x.pos + 2 * x.speed) })), 100);
    return () => clearInterval(tm);
  }, [v.playing]);
  useEffect(() => { if (v.playing && v.pos >= VLEN) completeRef.current(); }, [v.playing, v.pos]);
  // pause when another screen covers this one
  useEffect(() => { if (!active) setV((x) => (x.playing ? { ...x, playing: false } : x)); }, [active]);

  const play = () => {
    buzz();
    upd((x) => (x.finished ? { finished: false, pos: 0, playing: true } : { playing: !x.playing }));
  };
  const seek = (dd: number) => upd((x) => ({ pos: Math.max(0, Math.min(VLEN - 1, x.pos + dd)) }));
  const cycleSpeed = () => upd((x) => ({ speed: SPEEDS[(SPEEDS.indexOf(x.speed as 1) + 1) % SPEEDS.length] }));
  const toggleSubs = () => upd((x) => ({ subs: !x.subs }));
  const toggleSubLang = () => upd((x) => ({ subLang: x.subLang === 'hi' ? 'en' : 'hi', subs: true }));
  const off = !!s.offline[id];
  const saveOffline = () => { if (off) return; set((d) => { d.offline[id] = true; }); m.toast(t('savedOffline')); };
  const goNext = () => { if (next) m.swap(`/courses/${id}/lesson/${next.n}`, 'push'); };
  const goCert = () => m.go(`/courses/${id}/certificate`);
  const markDone = () => { complete1(); sc.current?.scrollTo({ top: 0, behavior: 'smooth' }); };

  const sub = EXTRA.sub1[v.subLang];

  return (
    <>
      <div className="ldark">
        <header className="lbar">
          <BackBtn />
          <span className="lbar-t num">{t('lessonOf', { n, m: c.lessons })}</span>
          <button className="ib" aria-label={t('lessonOptions')} onClick={() => setOpts(true)}><Ic k="dots" s={26} sw={3} /></button>
        </header>
        <div className="player" style={cssv({ '--a0': c.art[0] })} role="group" aria-label={t('lessonVideo')}>
          <svg className="pl-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={c.icon} /></svg>
          <div className="pl-mid">
            <button className="pl-sk" aria-label={t('back10')} onClick={() => seek(-10)}><Ic k={I.rew} s={30} sw={1.6} /><b>10</b></button>
            <button className="pl-big" aria-label={v.playing ? t('pause') : t('play')} onClick={play}>{v.playing ? <Fill d={F.pause} s={30} /> : <Fill d={F.playBig} s={32} />}</button>
            <button className="pl-sk" aria-label={t('fwd10')} onClick={() => seek(10)}><Ic k={I.fwd} s={30} sw={1.6} /><b>10</b></button>
          </div>
          {v.subs && !v.finished && <p className="subt">{sub}</p>}
          <div className="pl-bot">
            <span className="num pl-cur">{mmss(v.pos)}</span>
            <input className="scrub" type="range" min={0} max={VLEN} step={1} value={Math.round(v.pos)} style={cssv({ '--p': v.pos / VLEN })}
              aria-label={`${t('lesson')} ${n}`} aria-valuetext={`${mmss(v.pos)} / ${mmss(VLEN)}`}
              onChange={(e) => upd(() => ({ pos: +e.target.value, finished: false }))} />
            <span className="num" style={{ textAlign: 'right' }}>{mmss(VLEN)}</span>
          </div>
          {v.finished && (
            <div className="ldone" role="status">
              <span className="okc"><Ic k="check" s={32} sw={3} /></span>
              <h2>{complete ? t('allLessonsDone') : t('lessonDone')}</h2>
              {complete ? (
                <button className="btn" onClick={goCert}><Ic k="award" s={20} sw={2} />{t('getCertificate')}</button>
              ) : next ? (
                <button className="btn" onClick={goNext}>{t('nextLesson')}<Ic k="chev" s={18} sw={2.4} /></button>
              ) : null}
            </div>
          )}
        </div>
        <div className="lctl">
          <button className="dchip" aria-label={t('speed')} onClick={cycleSpeed}><Ic k="speed" s={18} /><span className="num">{v.speed}×</span></button>
          <button className="dchip" aria-pressed={v.subs} aria-label={t('subtitles')} onClick={toggleSubs}><Ic k="cc" s={18} />{t('subtitles')}</button>
          <button className="dchip" aria-label={`${t('subtitles')} ${t('language')}`} onClick={toggleSubLang}><Ic k="globe" s={18} />{v.subLang === 'hi' ? 'HI' : 'EN'}</button>
          <button className={`dchip ${off ? 'is-ok' : ''}`} aria-label={t('download')} onClick={saveOffline}><Ic k={off ? 'check' : 'dl'} s={18} sw={2} />{off ? t('offline') : t('download')}</button>
        </div>
      </div>
      <div className="scroll" ref={sc}>
        <div className="lhead">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>{L(c.title)}</p>
          <h1>{L(l.t)}</h1>
          <p className="sub num" style={{ marginTop: 4 }}>{t('minsN', { n: l.d })} · {L(c.by).split(' · ')[0]}</p>
        </div>
        <section className="card todo">
          <h3>{t('whatToDo')}</h3>
          {([1, 2, 3] as const).map((i) => (
            <button key={i} className="trow" aria-pressed={!!v.todo[i]} onClick={() => { buzz(); upd((x) => ({ todo: { ...x.todo, [i]: !x.todo[i] } })); }}>
              <span className="tbox"><Ic k="check" s={18} sw={3} /></span>
              <div className="row-b"><p className="step num">0{i}</p><p className="row-t">{t(`todo${i}`)}</p></div>
            </button>
          ))}
        </section>
        <div className="pad" style={{ marginTop: 16 }}>
          {complete ? (
            <button className="btn btn--block" style={{ background: 'var(--gold)', color: 'var(--ink)' }} onClick={goCert}><Ic k="award" s={22} sw={2} />{t('getCertificate')}</button>
          ) : isDone ? (
            <div className="btn btn--leaf btn--block" role="status"><Ic k="check" s={20} sw={2.6} />{t('lessonDone')}</div>
          ) : (
            <button className="btn btn--block" onClick={markDone}><Ic k="check" s={20} sw={2.6} />{t('markDone')}</button>
          )}
        </div>
        {next ? (
          <>
            <p className="eyebrow" style={{ padding: '22px 16px 0' }}>{t('upNext')}</p>
            <button className="card unext press" onClick={goNext}>
              <Art o={c} title={false} cls="art--sq" />
              <div className="row-b"><p className="muted num">{t('lesson')} {next.n} · {t('minsN', { n: next.d })}</p><p className="row-t clamp2">{L(next.t)}</p></div>
              <span className="chev"><Ic k="chev" s={20} /></span>
            </button>
          </>
        ) : <div style={{ height: 24 }} />}
      </div>

      <Sheet open={opts} onClose={() => setOpts(false)} label={t('lessonOptions')}>
        <SheetHead title={t('lessonOptions')} onClose={() => setOpts(false)} />
        <div className="sheet-b">
          <p className="eyebrow" style={{ margin: '4px 0 8px' }}>{t('speed')}</p>
          <div className="seg" role="tablist" style={cssv({ '--n': 3, '--i': SPEEDS.indexOf(v.speed as 1), margin: '0 0 18px' })}>
            <span className="seg-ind" />
            {SPEEDS.map((x) => <button key={x} role="tab" aria-selected={v.speed === x} className="num" onClick={() => upd(() => ({ speed: x }))}>{x}×</button>)}
          </div>
          <button className="row" aria-pressed={v.subs} onClick={toggleSubs}>
            <span className="nic" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}><Ic k="cc" /></span>
            <span className="row-b row-t">{t('subtitles')}</span><span className="sw" />
          </button>
          <button className="row" onClick={toggleSubLang}>
            <span className="nic" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}><Ic k="globe" /></span>
            <span className="row-b row-t">{t('subtitles')} · {t('language')}</span><span className="chip">{v.subLang === 'hi' ? 'हिन्दी' : 'English'}</span>
          </button>
          <p className="eyebrow" style={{ margin: '16px 0 8px' }}>{t('quality')}</p>
          <div className="seg" role="tablist" style={cssv({ '--n': 2, '--i': v.q === 'hd' ? 1 : 0, margin: '0 0 8px' })}>
            <span className="seg-ind" />
            <button role="tab" aria-selected={v.q !== 'hd'} onClick={() => upd(() => ({ q: 'ds' }))}>{t('dataSaver')}</button>
            <button role="tab" aria-selected={v.q === 'hd'} onClick={() => upd(() => ({ q: 'hd' }))}>{t('hd')}</button>
          </div>
        </div>
        <div className="sheet-f"><button className="btn btn--block" onClick={() => setOpts(false)}>{t('done')}</button></div>
      </Sheet>
    </>
  );
}
