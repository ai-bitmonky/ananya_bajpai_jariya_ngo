'use client';
import { useState } from 'react';
import { useZ } from '@/lib/store';
import { href } from '@/lib/nav';
import { ZARIYA, course, type Job } from '@/lib/data';
import { buzz, parsePath, useM, type ScreenProps } from '../ctx';
import { Art, Avatar, Ic, SheetHead, TopBar, cssv } from '../ui';
import { Sheet } from '../Sheet';
import { ZU } from '../content';

export const WF = { all: 'filterAll', near: 'filterNear', wfh: 'filterWfh', part: 'filterPart', govt: 'filterGovt' } as const;
export type WFk = keyof typeof WF;
const WFI: Partial<Record<WFk, string>> = { near: 'pin', wfh: 'home', part: 'clock', govt: 'schemes' };
const wfMatch = (w: Job, f: WFk) => (f === 'near' ? w.km < 3 : f === 'wfh' ? w.type.en === 'Work from home' : f === 'part' ? w.type.en === 'Part-time' : f === 'govt' ? w.type.en === 'Government' : true);
export const workList = (f: WFk, skill: string | null) => ZARIYA.work.filter((w) => wfMatch(w, f) && (!skill || w.skill === skill)).sort((a, b) => a.km - b.km);

export function NeedChip({ w }: { w: Job }) {
  const { t } = useZ();
  return w.urgent
    ? <span className="chip chip--alert"><Ic k="bolt" s={14} sw={2} />{w.left === 1 ? t('seatLeft1') : t('seatsLeft', { n: w.left })}</span>
    : <span className="chip"><Ic k="users" s={14} />{t('need', { n: w.need })}</span>;
}

export function ApplyBtn({ w, block = false }: { w: Job; block?: boolean }) {
  const { s, t } = useZ();
  const m = useM();
  if (s.applied[w.id]) {
    return <span className={`appl ${block ? 'btn--block' : ''}`} role="status" style={block ? { justifyContent: 'center', minHeight: 52 } : undefined}><Ic k="check" s={18} sw={2.6} />{t('applied')}</span>;
  }
  return <button className={`btn ${block ? 'btn--block' : 'btn--sm'}`} onClick={() => m.openSheet({ kind: 'apply', id: w.id })}>{t('applyNow')}{!block && <Ic k="chev" s={18} sw={2.4} />}</button>;
}

export function Work({ path }: ScreenProps) {
  const { t, L } = useZ();
  const m = useM();
  const { q } = parsePath(path);
  const fq = q.get('f');
  const f: WFk = fq && fq in WF ? (fq as WFk) : 'all';
  const skillQ = q.get('skill');
  const sk = skillQ && ZARIYA.courses.some((c) => c.id === skillQ) ? course(skillQ) : null;
  const skill = sk ? sk.id : null;
  const list = workList(f, skill);
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<WFk | null>(null);
  const setF = (nf: WFk, ns: string | null = skill) => m.setQuery(href('/work', { f: nf === 'all' ? null : nf, skill: ns }));

  return (
    <>
      <TopBar title={t('work')} />
      <div className="scroll">
        <div className="pad wk-h">
          <div><h2>{t('companiesHiring')}</h2><p className="sub">{L(ZU.village)}, {L(ZU.district)} · <span className="num">{list.length}</span></p></div>
          <button className="ib fbtn" aria-label={t('filters')} onClick={() => { setDraft(null); setSheet(true); }}><Ic k="filter" s={22} sw={2} />{f !== 'all' && <span className="dot" />}</button>
        </div>
        {sk && (
          <div className="skillbar"><Ic k="award" s={22} sw={2} /><p>{t('becauseSkill', { skill: L(sk.title) })}</p><button className="ib" aria-label={t('clear')} onClick={() => setF(f, null)}><Ic k="close" s={20} /></button></div>
        )}
        <div className="wchips" role="group" aria-label={t('filters')}>
          {(Object.keys(WF) as WFk[]).map((k) => <button key={k} className="chip" aria-pressed={f === k} onClick={() => { buzz(); setF(k); }}>{t(WF[k])}</button>)}
        </div>
        <ul className="jlist" key={f + '|' + skill}>
          {!list.length ? (
            <li className="empty"><span className="ei"><Ic k="work" s={28} /></span><p>{t('noWork')}</p></li>
          ) : list.map((w, i) => (
            <li key={w.id} className="card job rise" style={cssv({ '--i': i })}>
              <button className="job-main press" onClick={() => m.go(`/work/${w.id}`)}>
                <div style={{ position: 'relative' }}>
                  <Art o={w} />
                  <span className="kmb" aria-hidden="true"><b className="num">{w.km}</b><small>{t('km')}</small></span>
                  {w.posted && <span className="chip newb">{L(w.posted)}</span>}
                </div>
                <div className="job-b">
                  <h3>{L(w.role)}</h3>
                  <div className="jmeta">
                    <span className="pay"><Ic k="rupee" s={16} sw={2} /><b className="num" style={{ color: 'var(--fg)' }}>{L(w.pay).split(' · ')[0]}</b></span>
                    <span><Ic k="clock" s={16} />{L(w.hours)}</span>
                    <span className="vh">{w.km} {t('km')}</span>
                  </div>
                  <div className="need"><NeedChip w={w} /><span className="chip chip--line">{L(w.type)}</span></div>
                </div>
              </button>
              <div className="job-f">
                {w.friends ? (
                  <span className="frc"><span className="stack">{ZARIYA.friends.slice(0, w.friends).map((fr, k) => <Avatar key={k} f={fr} />)}</span>{w.friends === 1 ? t('friendWork') : t('friendsWork', { n: w.friends })}</span>
                ) : <span />}
                <ApplyBtn w={w} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Sheet open={sheet} onClose={() => setSheet(false)} label={t('filters')}>
        <SheetHead title={t('filters')} onClose={() => setSheet(false)} />
        <div className="sheet-b">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '4px 0 8px' }}>
            {(Object.keys(WF) as WFk[]).map((k) => (
              <button key={k} className="chip" aria-pressed={(draft ?? f) === k} onClick={() => { buzz(); setDraft(k); }}>{WFI[k] && <Ic k={WFI[k]!} s={16} />}{t(WF[k])}</button>
            ))}
          </div>
        </div>
        <div className="sheet-f">
          <button className="btn btn--block" onClick={() => { if (draft) setF(draft); setDraft(null); setSheet(false); }}>{t('showN', { n: workList(draft ?? f, skill).length })}</button>
        </div>
      </Sheet>
    </>
  );
}
