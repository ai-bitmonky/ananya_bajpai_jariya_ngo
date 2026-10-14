'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useZ } from '@/lib/store';
import { href } from '@/lib/nav';
import { ZARIYA, course } from '@/lib/data';
import { buzz, D, parsePath, useM, type ScreenProps } from '../ctx';
import { Art, Avatar, BackBtn, Ic, MeAv, PBar, PlayIc, Star, Tick, cssv, useHm } from '../ui';
import { curriculum } from '../content';
import { useHeart } from './Courses';

const DTABS = [['about', 'about'], ['lessons', 'lessonsTab'], ['invite', 'invite'], ['discuss', 'discuss']] as const;
type DTab = (typeof DTABS)[number][0];

/** header turns solid once the hero has scrolled away (course + job detail) */
export function useSolid(heroSel: string) {
  const sc = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const el = sc.current;
    if (!el) return;
    const on = () => { const h = el.querySelector<HTMLElement>(heroSel); if (h && h.offsetHeight) setSolid(el.scrollTop > h.offsetHeight - 70); };
    el.addEventListener('scroll', on, { passive: true });
    requestAnimationFrame(on);
    return () => el.removeEventListener('scroll', on);
  }, [heroSel]);
  return { sc, solid };
}

function Msg({ av, name, txt, when, cls = '' }: { av: ReactNode; name?: string; txt: string; when: string; cls?: string }) {
  return <div className={`msg ${cls}`}>{av}<div className="bub">{name && <b>{name}</b>}<p>{txt}</p><small className="num">{when}</small></div></div>;
}

export function CourseDetail({ path, id }: ScreenProps & { id: string }) {
  const { s, set, t, L, doneN, pct, nextLesson } = useZ();
  const m = useM();
  const heart = useHeart();
  const hm = useHm();
  const c = course(id);
  const lessons = curriculum(c);
  const { q } = parsePath(path);
  const tq = q.get('tab');
  const tab: DTab = DTABS.some(([k]) => k === tq) ? (tq as DTab) : 'about';
  const { sc, solid } = useSolid('.chero');
  const tabsRef = useRef<HTMLDivElement>(null);
  const d = doneN(c), complete = d >= c.lessons, curN = nextLesson(c);

  const [fq, setFq] = useState('');
  const [dl, setDl] = useState<number | null>(null);
  const dlT = useRef<number | undefined>(undefined);
  useEffect(() => () => clearInterval(dlT.current), []);
  const startDl = () => {
    buzz();
    let p = 0;
    setDl(0);
    clearInterval(dlT.current);
    dlT.current = window.setInterval(() => {
      p = Math.min(100, p + 7);
      setDl(p);
      if (p >= 100) {
        clearInterval(dlT.current);
        setDl(null);
        set((x) => { x.offline[id] = true; });
        m.toast(t('savedOffline'));
      }
    }, 110);
  };

  const pickTab = (k: DTab) => {
    buzz();
    m.setQuery(href(`/courses/${id}`, { tab: k === 'about' ? null : k }));
    const el = sc.current, tabs = tabsRef.current;
    if (el && tabs) {
      const stickAt = tabs.offsetTop - parseFloat(getComputedStyle(tabs).top);
      requestAnimationFrame(() => { if (el.scrollTop > stickAt) el.scrollTop = stickAt; });
    }
  };

  const posts = s.posts[id] || [];
  const msgIn = useRef<HTMLInputElement>(null);
  const send = (e: FormEvent) => {
    e.preventDefault();
    const v = msgIn.current?.value.trim();
    if (!v) return;
    set((x) => { (x.posts[id] ||= []).push(v); });
    buzz();
    if (msgIn.current) msgIn.current.value = '';
    requestAnimationFrame(() => { const el = sc.current; if (el) el.scrollTop = el.scrollHeight; msgIn.current?.focus(); });
  };

  let panel;
  if (tab === 'lessons') {
    panel = (
      <div className="rise">
        {lessons.map((l) => {
          const done = (s.done[id] || []).includes(l.n), isCur = curN === l.n, lock = !done && !isCur;
          return (
            <button key={l.n} className={`lrow press ${done ? 'is-done' : ''} ${isCur ? 'is-cur' : ''} ${lock ? 'is-lock' : ''}`} onClick={() => m.go(`/courses/${id}/lesson/${l.n}`)}>
              <span className="lnum num">{done ? <Ic k="check" s={20} sw={2.6} /> : String(l.n).padStart(2, '0')}</span>
              <div className="row-b">
                <p className="row-t clamp2">{L(l.t)}</p>
                <p className="muted num">{t('lesson')} {l.n} · {t('minsN', { n: l.d })}{lock ? ' · ' + t('locked') : ''}</p>
              </div>
              <span className="lend">
                {isCur ? <span className="chip" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}><PlayIc s={14} />{t('resume')}</span> : lock ? <Ic k="lock" s={18} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    );
  } else if (tab === 'invite') {
    const ql = fq.toLowerCase();
    const fr = ZARIYA.friends.filter((f) => !ql || (f.name.en + f.name.hi).toLowerCase().includes(ql));
    panel = (
      <div className="rise">
        <div className="card inv-intro"><span className="ei"><Ic k="users" s={26} /></span><p className="sub" style={{ color: 'var(--fg)' }}>{t('learnTogether')}</p></div>
        <div className="search search--flat" style={{ marginBottom: 8 }}>
          <Ic k="search" s={22} />
          <input type="search" value={fq} onChange={(e) => setFq(e.target.value)} placeholder={t('searchFriends')} aria-label={t('searchFriends')} autoComplete="off" />
        </div>
        <div className="flist">
          {fr.map((f) => {
            const k = f.name.en, on = !!s.invited[k];
            return (
              <div key={k} className="frow">
                <Avatar f={f}>{f.online && <i className="online" />}</Avatar>
                <div className="row-b"><p className="row-t">{L(f.name)}</p><p className="muted">{L(f.status)}</p></div>
                <button className={`addb ${on ? 'is-on' : ''}`} aria-pressed={on} aria-label={`${t('invite')}: ${L(f.name)}`} onClick={(e) => {
                  if (on) return;
                  set((x) => { x.invited[k] = true; });
                  buzz();
                  e.currentTarget.animate([{ transform: 'scale(.8)' }, { transform: 'scale(1.06)' }, { transform: 'none' }], { duration: D(420), easing: 'ease-out' });
                  m.toast(t('inviteSent', { name: L(f.name) }));
                }}>
                  {on ? <><Ic k="check" s={18} sw={2.6} />{t('invited')}</> : <Ic k="plus" s={22} sw={2.2} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else if (tab === 'discuss') {
    const F = ZARIYA.friends, inst = L(c.by).split(' · ')[0];
    panel = (
      <div className="rise">
        <Msg av={<Avatar f={F[0]} />} name={L(F[0].name)} txt={t('msg1')} when={t('msgT1')} />
        <Msg av={<Avatar f={F[1]} />} name={L(F[1].name)} txt={t('msg2')} when={t('msgT2')} />
        <Msg av={<Avatar f={{ hue: 'var(--gold)', initial: inst[0] }} />} name={`${inst} · ${t('instructor')}`} txt={t('msg3')} when={t('msgT3')} cls="inst-msg" />
        {posts.map((x, i) => <Msg key={i} av={<MeAv />} txt={x} when={t('now')} cls="me" />)}
        <form className="compose" onSubmit={send}>
          <input ref={msgIn} name="m" placeholder={t('writeMsg')} aria-label={t('writeMsg')} autoComplete="off" />
          <button className="addb" aria-label={t('sendMsg')}><Ic k="send" s={22} sw={2} /></button>
        </form>
      </div>
    );
  } else {
    const L4 = [0.15, 0.35, 0.62, 0.85].map((f) => lessons[Math.min(lessons.length - 1, Math.floor(f * lessons.length))]);
    const [iname, org] = L(c.by).split(' · ');
    panel = (
      <div className="rise">
        <p className="blurb">{L(c.blurb)}</p>
        <div className="card learn"><h3>{t('whatYouLearn')}</h3><ul>{L4.map((l, i) => <li key={i}><Tick /><span>{L(l.t)}</span></li>)}</ul></div>
        <div className="inst">
          <Avatar f={{ hue: 'var(--gold)', initial: iname[0] }} />
          <div className="row-b">
            <p className="eyebrow">{t('instructor')}</p>
            <p className="row-t">{iname}{org && <> · <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{org}</span></>}</p>
            <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{t('instructorBio')}</p>
          </div>
        </div>
        <div className="dlbtn">
          {s.offline[id] ? (
            <div className="btn btn--leaf btn--block" role="status"><Ic k="check" s={20} sw={2.4} />{t('savedOffline')}</div>
          ) : dl !== null ? (
            <div className="dlbar" role="progressbar" aria-valuenow={dl} aria-valuemin={0} aria-valuemax={100}><i style={cssv({ '--p': dl / 100 })} /><span className="num">{t('downloading', { n: dl })}</span></div>
          ) : (
            <button className="btn btn--line btn--block" onClick={startDl}><Ic k="dl" s={20} sw={2} />{t('downloadOffline')}</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fill-c ${solid ? 'solid' : ''}`}>
      <div className="cbar">
        <BackBtn cls="ib--glass" />
        <span className="cbar-t">{L(c.title)}</span>
        <button className="ib ib--glass" aria-pressed={!!s.saved[id]} aria-label={t('saveCourse')} onClick={(e) => heart(id, e)}><Ic k="heart" s={22} sw={2} /></button>
      </div>
      <div className="scroll" ref={sc}>
        <Art o={c} title={false} cls="chero" />
        <div className="cd-head">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>{complete ? t('completed') : d ? t('ofLessons', { d, n: c.lessons }) : t('free')}</p>
          <h1>{L(c.title)}</h1>
          <p className="sub" style={{ marginTop: 4 }}>{t('byLine')} {L(c.by)}</p>
          <div className="mchips">
            <span className="chip"><Ic k="courses" /><span className="num">{t('lessonsN', { n: c.lessons })}</span></span>
            <span className="chip"><Ic k="clock" /><span className="num">{hm(c.mins)}</span></span>
            <span className="chip"><Ic k="bolt" />{L(c.level)}</span>
            <span className="chip chip--gold"><Star s={16} /><span className="num">{c.rating}</span></span>
          </div>
          {d > 0 && !complete && <div className="cprog" style={{ marginTop: 16 }}><PBar p={d / c.lessons} /><span className="num">{pct(c)}%</span></div>}
        </div>
        <div className="tabs" role="tablist" ref={tabsRef}>
          {DTABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => pickTab(k)}>{t(label)}</button>)}
        </div>
        <div className="tabp" role="tabpanel" key={tab}>{panel}</div>
      </div>
      <div className="foot">
        {complete ? (
          <button className="btn btn--block" style={{ background: 'var(--gold)', color: 'var(--ink)' }} onClick={() => m.go(`/courses/${id}/certificate`)}><Ic k="award" s={22} sw={2} />{t('getCertificate')}</button>
        ) : (
          <button className="btn btn--block" onClick={() => m.go(`/courses/${id}/lesson/${curN ?? 1}`)}><PlayIc />{d ? t('resume') : t('start')} · {t('lesson')} {curN ?? 1}</button>
        )}
      </div>
    </div>
  );
}
