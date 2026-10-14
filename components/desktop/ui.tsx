'use client';
/* Desktop primitives — ported 1:1 from the prototype's string helpers (art, av, mark, tick,
   progress, ring, weekChart, sealSvg, qrSvg, segs). */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { I, type IconName } from './icons';
import type { Bi, Course, Job, Scheme, Friend } from '@/lib/data';
import { useZ } from '@/lib/store';

export const BRAND = 'ज़रिया';
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const mmss = (s: number) => pad2(Math.floor(s / 60)) + ':' + pad2(Math.floor(s % 60));
export const nf = (n: number) => Number(n).toLocaleString('en-IN');
export const hrs = (mins: number) => Math.round(mins / 6) / 10;
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;
export const sv = (o: CSSVars) => o as CSSProperties;

export function Ic({ n, d, s = 20, sw = 1.8, className, style }: { n?: IconName; d?: string; s?: number; sw?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d={n ? I[n] : d} />
    </svg>
  );
}

export function Art({ o, title, className = '' }: { o: Course | Job; title?: boolean; className?: string }) {
  const { L } = useZ();
  return (
    <div className={`art ${className}`} style={sv({ '--a0': o.art[0], '--a1': o.art[1] })} aria-hidden="true">
      <Ic d={o.icon} s={24} sw={1.3} className="ic" />
      {title ? <span className="at">{L(o.title)}</span> : null}
    </div>
  );
}

type AvLike = { hue?: string; initial?: string; i?: string; name?: Bi; who?: Bi };
export function Av({ x, cls = '', online = false }: { x: AvLike; cls?: string; online?: boolean }) {
  const { L, lang } = useZ();
  const n = x.name || x.who;
  const ini = n && lang === 'hi' ? Array.from(L(n))[0] : (x.initial || x.i || '');
  return <span className={`av ${cls}`} style={sv({ '--h': x.hue || 'var(--rose)' })} aria-hidden="true">{ini}{online ? <i className="on" /> : null}</span>;
}
export function MeAv({ cls = '' }: { cls?: string }) {
  const { userName } = useZ();
  return <span className={`av ${cls}`} style={sv({ '--h': 'var(--maroon-soft)' })} aria-hidden="true">{Array.from(userName())[0]}</span>;
}
export function FriendStack({ n, friends }: { n: number; friends: Friend[] }) {
  return <span className="stack">{friends.slice(0, n).map((f, i) => <Av key={i} x={f} cls="xs" />)}</span>;
}

export function Mark({ s, size = 48 }: { s: Scheme; size?: number }) {
  const n = s.short.length;
  const fs = n <= 4 ? size * 0.3 : n <= 5 ? size * 0.26 : n <= 7 ? size * 0.21 : size * 0.19;
  return <span className="mark" style={sv({ '--h': s.hue, width: size, height: size, fontSize: fs })} aria-hidden="true"><span>{s.short}</span></span>;
}

export function Tick({ s = 14 }: { s?: number }) {
  return <span className="tick" style={{ width: s + 8, height: s + 8 }}><Ic n="check" s={s} sw={2.6} /></span>;
}

export function Progress({ p }: { p: number }) {
  const { t } = useZ();
  return <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p} aria-label={t('progressL')}><i style={sv({ '--w': p + '%' })} /></div>;
}

export function Segs({ c, d }: { c: Course; d: number }) {
  const { t } = useZ();
  return (
    <div className="segs" style={sv({ '--n': c.lessons })} role="progressbar" aria-valuemin={0} aria-valuemax={c.lessons} aria-valuenow={d} aria-label={t('lessonsDoneN', { d, n: c.lessons })}>
      {Array.from({ length: c.lessons }, (_, i) => <i key={i} className={i < d ? 'd' : i === d ? 'c' : ''} style={sv({ '--i': i })} />)}
    </div>
  );
}

export function Seal({ s = 64 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="currentColor"><path d="M32 4l5 4.6 6.6-1.2 2.6 6.2 6.2 2.6-1.2 6.6L60 32l-4.6 5 1.2 6.6-6.2 2.6-2.6 6.2-6.6-1.2L32 60l-5-4.6-6.6 1.2-2.6-6.2-6.2-2.6 1.2-6.6L4 32l4.6-5-1.2-6.6 6.2-2.6 2.6-6.2 6.6 1.2z" opacity=".95" /></g>
      <circle cx="32" cy="32" r="17" fill="none" stroke="var(--surface)" strokeWidth="1.6" opacity=".9" />
      <path d="M24 32.5l5.5 5.5L41 26.5" fill="none" stroke="var(--surface)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Qr({ seed, size = 72 }: { seed: string; size?: number }) {
  const d = useMemo(() => {
    let x = 0; for (const ch of seed) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
    const n = 15, cell = size / n; let r = '';
    const finder = (i: number, j: number) => { for (const [a, b] of [[0, 0], [0, n - 7], [n - 7, 0]]) { const u = i - a, v = j - b; if (u >= 0 && u < 7 && v >= 0 && v < 7) return (u === 0 || u === 6 || v === 0 || v === 6 || (u >= 2 && u <= 4 && v >= 2 && v <= 4)) ? 1 : 0; } return -1; };
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let on = finder(i, j); if (on === -1) { x = (x * 1103515245 + 12345) >>> 0; on = (x >>> 16) & 1; } if (on) r += `M${(j * cell).toFixed(2)} ${(i * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`; }
    return r;
  }, [seed, size]);
  return <svg className="qr" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true"><path d={d} fill="currentColor" /></svg>;
}

/** Today's-minutes ring (single value against goal; dataviz: one hue, track in accent-soft). */
export function Ring({ val, max, size = 104, sw = 9 }: { val: number; max: number; size?: number; sw?: number }) {
  const { t } = useZ();
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.min(val / max, 1));
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${val} / ${max} ${t('min')}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="trk" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} />
        <circle className="val" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} strokeDasharray={c} strokeDashoffset={off} style={sv({ '--c': c })} />
      </svg>
      <div className="mid"><b>{val}</b><span>/ {max} {t('min')}</span></div>
    </div>
  );
}

/** Week bar chart — single series, one scale (0–60), hairline grid, ≤24px bars with 4px data-end,
    today emphasised and direct-labelled, hover/focus tooltip per bar, table fallback for AT. */
export function WeekChart({ w, todayIdx }: { w: number[]; todayIdx: number }) {
  const { t, tl } = useZ();
  const max = 60, days = tl('days'), names = tl('dayNames');
  return (
    <>
      <div className="chart" role="figure" aria-label={t('chartAlt')}>
        <div className="ch-y num" aria-hidden="true"><span style={{ top: 0 }}>60</span><span style={{ top: '50%' }}>30</span><span style={{ top: '100%' }}>0</span></div>
        <div className="ch-plot">
          <div className="ch-g" style={{ top: 0 }} /><div className="ch-g faint" style={{ top: '50%' }} />
          <div className="ch-cols">
            {w.map((v, i) => (
              <div key={i} className={`ch-col ${i === todayIdx ? 'today' : i > todayIdx ? 'future' : ''}`} tabIndex={0} role="img" aria-label={`${names[i]}: ${v} ${t('min')}`} style={sv({ '--v': Math.min(v, max) / max, '--i': i })}>
                <div className="ch-bar" />
                {i === todayIdx ? <span className="ch-val num">{v}</span> : null}
                <span className="ch-tip"><b className="num">{v}</b> {t('min')}<br />{names[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ch-x" aria-hidden="true">{days.map((d, i) => <span key={i} className={i === todayIdx ? 'today' : ''}>{i === todayIdx ? t('today') : d}</span>)}</div>
      </div>
      <table className="sr"><caption>{t('chartAlt')}</caption><tbody>{w.map((v, i) => <tr key={i}><th>{names[i]}</th><td>{v} {t('min')}</td></tr>)}</tbody></table>
    </>
  );
}

/* ---------------- toasts ---------------- */
interface ToastItem { id: number; msg: string; ok: boolean; out: boolean }
const ToastCtx = createContext<(msg: string, ok?: boolean) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const n = useRef(0);
  const toast = useCallback((msg: string, ok = true) => {
    const id = ++n.current;
    setItems((x) => [...x, { id, msg, ok, out: false }]);
    try { navigator.vibrate?.(8); } catch {}
    setTimeout(() => { setItems((x) => x.map((i) => (i.id === id ? { ...i, out: true } : i))); setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 300); }, 2400);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((i) => <div key={i.id} className={`toast ${i.out ? 'out' : ''}`}>{i.ok ? <Tick s={12} /> : null}<span>{i.msg}</span></div>)}
      </div>
    </ToastCtx.Provider>
  );
}
