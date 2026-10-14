'use client';
/* Sheets that can open over any screen: notifications, language, apply-for-work. */
import { useRef, useState } from 'react';
import { useZ } from '@/lib/store';
import { ZARIYA, job } from '@/lib/data';
import { useM } from './ctx';
import { Sheet } from './Sheet';
import { Art, Ic, LangCards, SheetHead, certCourses, cssv } from './ui';

const NK = {
  work: ['work', 'var(--accent)', 'var(--surface-2)'],
  friend: ['users', 'var(--leaf)', 'var(--leaf-pale)'],
  scheme: ['schemes', 'var(--sky)', 'var(--sky-pale)'],
} as const;

export function GlobalSheets() {
  const m = useM();
  const { s, set, t, L, userName, doneN } = useZ();
  const kind = m.sheet?.kind ?? null;
  const lastApply = useRef<string>('ku');
  if (m.sheet?.kind === 'apply') lastApply.current = m.sheet.id;
  const [pick, setPick] = useState<string | null>(null);

  const w = job(lastApply.current);
  const certs = [...certCourses(doneN).map((c) => L(c.title)), t('cert2')];

  return (
    <>
      <Sheet open={kind === 'notifs'} onClose={m.closeSheet} label={t('notifications')}>
        <SheetHead title={t('notifications')} onClose={m.closeSheet} />
        <div className="sheet-b">
          <ul className="nlist">
            {ZARIYA.notifications.map((n, i) => (
              <li key={i} className="nrow rise" style={cssv({ '--i': i })}>
                <span className="nic" style={{ color: NK[n.kind][1], background: NK[n.kind][2] }}><Ic k={NK[n.kind][0]} s={22} /></span>
                <div className="row-b"><p>{L(n.t)}</p><span className="muted num">{L(n.when)}</span></div>
                {s.unread.includes(i) && <span className="ndot" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </div>
        <div className="sheet-f">
          <button className="btn btn--2 btn--block" onClick={() => { set((d) => { d.unread = []; }); m.closeSheet(); }}>
            <Ic k="check" s={20} sw={2.2} />{s.unread.length ? t('markRead') : t('nothingNew')}
          </button>
        </div>
      </Sheet>

      <Sheet open={kind === 'lang'} onClose={() => { setPick(null); m.closeSheet(); }} label={t('chooseLanguage')}>
        <SheetHead title={t('chooseLanguage')} onClose={() => { setPick(null); m.closeSheet(); }} />
        <div className="sheet-b">
          <p className="sub" style={{ margin: '-4px 0 12px' }}>{t('langNote')}</p>
          <div className="lsheet">
            <LangCards sel={pick ?? s.lang} onPick={(c) => {
              if (c === 'en' || c === 'hi') { setPick(null); set((d) => { d.lang = c; }); }
              else { setPick(c); m.toast(t('langSoon'), false); }
            }} />
          </div>
        </div>
      </Sheet>

      <Sheet open={kind === 'apply'} onClose={m.closeSheet} label={t('confirmApply')}>
        <SheetHead title={t('confirmApply')} onClose={m.closeSheet} />
        <div className="sheet-b">
          <div className="jmini">
            <Art o={w} title={false} cls="art--sq" />
            <div className="row-b"><p className="row-t clamp1">{L(w.title)}</p><p className="sub clamp1">{L(w.role)}</p></div>
            <div className="wkm"><b className="num">{w.km}</b><small>{t('km')}</small></div>
          </div>
          <p className="afnote"><Ic k="bolt" s={20} sw={2} /><span>{t('autofill')}</span></p>
          <dl className="af">
            <div><dt>{t('nameL')}</dt><dd>{userName()}<span className="ok"><Ic k="check" s={18} sw={2.6} /></span></dd></div>
            <div><dt>{t('phoneL')}</dt><dd className="num">{s.profile.phone}<span className="ok"><Ic k="check" s={18} sw={2.6} /></span></dd></div>
            <div><dt>{t('skillsL')}</dt><dd>{ZARIYA.user.skills.map((k, i) => <span key={i} className="chip">{L(k)}</span>)}</dd></div>
            <div><dt>{t('certificates')}</dt><dd style={{ display: 'grid', gap: 6 }}>{certs.map((c, i) => (
              <span key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--gold)' }}><Ic k="award" s={18} sw={2} /></span>{c}</span>
            ))}</dd></div>
          </dl>
        </div>
        <div className="sheet-f">
          <button className="btn btn--block" onClick={() => {
            const id = w.id;
            set((d) => { d.applied[id] = new Date().toISOString(); });
            m.go(`/work/${id}/applied`);
          }}><Ic k="send" s={20} sw={2} />{t('send')}</button>
          <button className="btn btn--ghost btn--block" onClick={m.closeSheet}>{t('cancel')}</button>
        </div>
      </Sheet>
    </>
  );
}
