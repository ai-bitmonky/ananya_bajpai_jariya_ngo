'use client';
/* Shared mobile building blocks: icons, course art, scheme marks, avatars, progress, top bar, search. */
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Icon, useZ } from '@/lib/store';
import { ZARIYA, type Bi, type Course, type Friend, type Scheme } from '@/lib/data';
import { I, F, type IconKey } from './icons';
import { buzz, useM } from './ctx';
import { ZU } from './content';

type V = CSSProperties & Record<`--${string}`, string | number>;
export const cssv = (o: Record<string, string | number>) => o as V;

/** stroke icon from the icon map (or a raw path) */
export function Ic({ k, s = 24, sw = 1.8, style, className }: { k: IconKey | string; s?: number; sw?: number; style?: CSSProperties; className?: string }) {
  return <Icon d={(I as Record<string, string>)[k] ?? k} size={s} sw={sw} style={style} className={className} />;
}

/** filled glyph */
export function Fill({ d, s = 24 }: { d: string; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
  );
}
export const Star = ({ s = 14 }: { s?: number }) => <Fill d={I.star} s={s} />;
export const PlayIc = ({ s = 20 }: { s?: number }) => <Fill d={F.play} s={s} />;

/** gradient flame (never an emoji) */
export function Flame({ s = 24 }: { s?: number }) {
  const id = 'fl' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="var(--alert)" /><stop offset="1" stopColor="var(--gold)" /></linearGradient></defs>
      <path fill={`url(#${id})`} d="M12 22c4.2 0 7-2.7 7-6.6 0-3.6-2.4-5.9-3.9-8.3-.5 2-1.6 3.2-3 3.6.4-3.3-.8-6.3-3.7-8.7.3 3.8-3.4 6.8-3.4 11.5C5 19.3 7.8 22 12 22z" />
      <path fill="var(--gold-pale)" opacity=".75" d="M12 20c-1.8 0-3-1.2-3-2.9 0-1.9 1.6-3 2.4-4.6.9 1.4 3.6 2.6 3.6 4.6 0 1.7-1.2 2.9-3 2.9z" />
    </svg>
  );
}

type Arty = { art: [string, string]; icon: string; title: Bi };
/** Course / work art: gradient + block-print + stroked icon, optional title. */
export function Art({ o, title = true, cls = '', children, style }: { o: Arty; title?: boolean; cls?: string; children?: ReactNode; style?: CSSProperties }) {
  const { L } = useZ();
  return (
    <div className={`art ${cls}`} style={{ ...cssv({ '--a0': o.art[0], '--a1': o.art[1] }), ...style }} aria-hidden={title ? undefined : true}>
      {title && <span className="art-t">{L(o.title)}</span>}
      <svg className="art-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={o.icon} /></svg>
      {children}
    </div>
  );
}

/** Scheme mark: rounded square in the scheme hue with its short name. */
export function Mark({ s, size = 44 }: { s: Scheme; size?: number }) {
  const parts = s.short.split('-');
  const longest = Math.max(...parts.map((p) => p.length));
  const fs = Math.min(size * 0.34, (size * 1.2) / Math.max(longest, 1.5));
  return (
    <span className="mark" style={cssv({ '--hue': s.hue, width: size, height: size, fontSize: +fs.toFixed(1) })} aria-hidden="true">
      {parts.flatMap((p, i) => (i ? [<br key={'b' + i} />, p] : [p]))}
    </span>
  );
}

export function Avatar({ f, cls = '', children, style }: { f: Pick<Friend, 'hue' | 'initial'>; cls?: string; children?: ReactNode; style?: CSSProperties }) {
  return <span className={`av ${cls}`} style={{ ...cssv({ '--hue': f.hue }), ...style }} aria-hidden="true">{f.initial}{children}</span>;
}

/** the learner's own avatar */
export function MeAv({ cls = 'av--me' }: { cls?: string }) {
  const { s } = useZ();
  const n = s.profile.name.trim();
  return <span className={`av ${cls}`} aria-hidden="true">{n ? n.slice(0, 1).toUpperCase() : ZU.initials}</span>;
}

export function PBar({ p, cls = '' }: { p: number; cls?: string }) {
  return (
    <div className={`pbar ${cls}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}>
      <i style={cssv({ '--p': p })} />
    </div>
  );
}

export const Tick = () => <span className="tick" aria-hidden="true"><Ic k="check" s={14} sw={3} /></span>;

export function LangChip({ band = false }: { band?: boolean }) {
  const { s, set, t } = useZ();
  return (
    <button className={`lang ${band ? 'lang--band' : ''}`} aria-label={t('switchLang')} onClick={() => { set((d) => { d.lang = d.lang === 'en' ? 'hi' : 'en'; }); buzz(); }}>
      <span className={s.lang === 'en' ? 'on' : ''}>EN</span><span className={s.lang === 'hi' ? 'on' : ''}>हिं</span>
    </button>
  );
}

export function Bell({ band = false }: { band?: boolean }) {
  const { s, t } = useZ();
  const m = useM();
  return (
    <button className={`ib ${band ? 'on-band' : ''}`} aria-label={t('notifications')} onClick={() => m.openSheet({ kind: 'notifs' })}>
      <Ic k="bell" />{s.unread.length > 0 && <span className="dot" />}
    </button>
  );
}

export function BackBtn({ cls = '', label }: { cls?: string; label?: string }) {
  const { t } = useZ();
  const m = useM();
  return <button className={`ib ${cls}`} aria-label={label ?? t('backL')} onClick={() => m.back()}><Ic k="back" /></button>;
}

export function TopBar({ title, back = false, right, lined = false, bell = true }: { title: ReactNode; back?: boolean; right?: ReactNode; lined?: boolean; bell?: boolean }) {
  const { t } = useZ();
  const m = useM();
  return (
    <header className={`bar ${lined ? 'lined' : ''}`}>
      {back ? <BackBtn /> : <button className="av-btn" aria-label={t('profile')} onClick={() => m.go('/profile')}><MeAv /></button>}
      <h1 className="bar-t">{title}</h1>
      <div className="bar-r">{right}<LangChip />{bell && <Bell />}</div>
    </header>
  );
}

/** Search pill with simulated voice search (mic → "Listening…" → fills the query → My Courses). */
export function SearchPill({ value = '', flat = false }: { value?: string; flat?: boolean }) {
  const { t } = useZ();
  const m = useM();
  const [listening, setListening] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (inp.current) inp.current.value = value; }, [value]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = inp.current?.value.trim() || '';
    inp.current?.blur();
    m.tab(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
  };
  const mic = () => {
    if (listening || !inp.current) return;
    buzz();
    inp.current.value = '';
    setListening(true);
    timers.current.push(window.setTimeout(() => {
      setListening(false);
      const q = t('voiceQ');
      if (inp.current) inp.current.value = q;
      timers.current.push(window.setTimeout(() => m.tab(`/courses?q=${encodeURIComponent(q)}`), 260));
    }, 1800));
  };
  return (
    <form className={`search ${flat ? 'search--flat' : ''} ${listening ? 'listening' : ''}`} role="search" onSubmit={submit}>
      <Ic k="search" s={22} />
      <input ref={inp} type="search" name="q" defaultValue={value} placeholder={listening ? t('listening') : t('search')} aria-label={t('search')} enterKeyHint="search" autoComplete="off" />
      <button type="button" className="mic" aria-label={t('speak')} onClick={mic}>
        <Ic k="mic" s={22} sw={2} />
        <span className="lbars" aria-hidden="true"><i /><i /><i /></span>
      </button>
    </form>
  );
}

export function Ring({ v, max, size = 44 }: { v: number; max: number; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.min(v / max, 1));
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={5} />
        <circle className="ring-v" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--leaf)" strokeWidth={5} strokeLinecap="round" strokeDasharray={c.toFixed(1)} strokeDashoffset={off.toFixed(1)} style={cssv({ '--c': c.toFixed(1) })} />
      </svg>
      <b className="num">{v}</b>
    </span>
  );
}

/** number formatting in the chosen language */
export function useNf() {
  const { lang } = useZ();
  return (n: number) => Number(n).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN');
}

/** "3 h 10 min" */
export function useHm() {
  const { t } = useZ();
  return (m: number) => (m >= 60 ? `${Math.floor(m / 60)} ${t('hrs')}${m % 60 ? ' ' + (m % 60) + ' ' + t('min') : ''}` : `${m} ${t('min')}`);
}

export const certCourses = (doneN: (c: Course) => number) => ZARIYA.courses.filter((c) => doneN(c) >= c.lessons);

/** Sheet header */
export function SheetHead({ title, onClose }: { title: ReactNode; onClose: () => void }) {
  const { t } = useZ();
  return (
    <div className="sheet-h"><h2>{title}</h2><button className="ib" aria-label={t('closeL')} onClick={onClose}><Ic k="close" /></button></div>
  );
}

/** Language cards (onboarding + language sheet) */
export function LangCards({ sel, onPick }: { sel: string; onPick: (code: string) => void }) {
  const { t } = useZ();
  return (
    <>
      {ZARIYA.languages.map((l) => (
        <button key={l.code} className="lcard press" aria-pressed={sel === l.code} lang={l.code} onClick={() => onPick(l.code)}>
          <b>{l.native}</b>
          <span className="lc-b"><small lang="en">{l.name}</small>{l.code === 'en' || l.code === 'hi' ? null : <span className="chip">{t('langSoon')}</span>}</span>
        </button>
      ))}
    </>
  );
}
