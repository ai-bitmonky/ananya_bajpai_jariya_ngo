'use client';
import { useZ } from '@/lib/store';
import { ZARIYA, course } from '@/lib/data';
import { buzz, useM, type ScreenProps } from '../ctx';
import { Fill, Ic, TopBar } from '../ui';
import { I } from '../icons';
import { WM } from '../content';

export const CERT_NO = 'ZR-2026-00412';

export function Seal() {
  let pts = '';
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, r = i % 2 ? 27 : 31; pts += `${(40 + r * Math.sin(a)).toFixed(1)},${(36 - r * Math.cos(a)).toFixed(1)} `; }
  return (
    <svg className="seal" viewBox="0 0 80 98" aria-hidden="true">
      <path d="M24 56 16 94l11-7 6 10 7-36z" fill="var(--maroon)" />
      <path d="M56 56l8 38-11-7-6 10-7-36z" fill="var(--maroon-soft)" />
      <polygon points={pts} fill="var(--gold)" />
      <circle cx="40" cy="36" r="22" fill="none" stroke="var(--gold-pale)" strokeWidth={1.4} strokeDasharray="2 2.5" />
      <circle cx="40" cy="36" r="17" fill="color-mix(in srgb,var(--gold) 80%,var(--maroon))" />
      <path d="M32 36.5l5.5 5.5L49 30.5" fill="none" stroke="var(--cream)" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Qr({ seed }: { seed: string }) {
  let x = 0;
  for (const ch of seed) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296;
  const N = 21;
  const finder = (r: number, c: number) => [[0, 0], [0, 14], [14, 0]].some(([a, b]) => r >= a && r < a + 7 && c >= b && c < b + 7);
  let d = '';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!finder(r, c) && rnd() > 0.52) d += `M${c} ${r}h1v1h-1z`;
  const f = (a: number, b: number) => `M${b} ${a}h7v7h-7zM${b + 1} ${a + 1}v5h5v-5zM${b + 2} ${a + 2}h3v3h-3z`;
  return (
    <svg className="qr" viewBox="0 0 21 21" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d={d + f(0, 0) + f(0, 14) + f(14, 0)} />
    </svg>
  );
}

/** Issued date: today for a course completed here; courses that came complete in the sample data were finished two days ago. */
export function issuedDate(id: string) {
  const seed = ZARIYA.courses.find((c) => c.id === id);
  const d = new Date();
  if (seed && seed.done >= seed.lessons) d.setDate(d.getDate() - 2);
  return d;
}

export function Certificate({ id }: ScreenProps & { id: string }) {
  const { t, L, lang, userName } = useZ();
  const m = useM();
  const c = course(id);
  const date = issuedDate(id).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <>
      <TopBar title={t('certificate')} back />
      <div className="scroll">
        <div className="pad">
          <article className="certc" aria-label={t('certTitle')}>
            <div className="cert-in">
              <span className="cert-wm wordmark wordmark--outline" aria-hidden="true">{WM}</span>
              <p className="wordmark cert-logo">{WM}</p>
              <p className="cert-latin">{ZARIYA.i18n.appName.en}</p>
              <h2 className="cert-t">{t('certTitle')}</h2>
              <div className="cert-rule" aria-hidden="true"><i /><Fill d={I.star} s={12} /><i /></div>
              <p className="cert-cap">{t('certifies')}</p>
              <p className="cert-name display">{userName()}</p>
              <p className="cert-cap">{t('certBody')}</p>
              <h3 className="cert-course">{L(c.title)}</h3>
              <p className="muted" style={{ marginTop: 2 }}>{L(c.by)}</p>
              <div className="cert-foot">
                <dl>
                  <div><dt>{t('certIssued')}</dt><dd className="num">{date}</dd></div>
                  <div><dt>{t('certId')}</dt><dd className="num">{CERT_NO}</dd></div>
                </dl>
                <Seal />
                <Qr seed={CERT_NO} />
              </div>
            </div>
          </article>
          <p className="verified"><Ic k="shield" s={20} sw={2} />{t('verified')}</p>
          <div className="cert-act">
            <button className="btn btn--block wa" onClick={() => { buzz(); m.toast(t('openingWa')); }}><Ic k="chat" s={22} sw={2} />{t('shareWhatsApp')}</button>
            <button className="btn btn--2 btn--block" onClick={() => { buzz(); m.toast(t('certSaved')); }}><Ic k="dl" s={20} sw={2} />{t('download')}</button>
            <button className="btn btn--line btn--block" onClick={() => m.reset(`/work?skill=${id}`)}><Ic k="work" s={20} sw={2} />{t('applyJobs')}<Ic k="chev" s={18} sw={2.2} /></button>
          </div>
        </div>
      </div>
    </>
  );
}
