'use client';
import { useZ } from '@/lib/store';
import { scheme } from '@/lib/data';
import { buzz, useM, type ScreenProps } from '../ctx';
import { Ic, Mark, TopBar, Tick } from '../ui';
import { ListenCard } from './Schemes';

export function SchemeDetail({ id, active }: ScreenProps & { id: string }) {
  const { s, set, t, L } = useZ();
  const m = useM();
  const sc = scheme(id);
  const have = s.docs[id] || {};
  const nHave = sc.docs.filter((_, i) => have[i]).length;
  return (
    <>
      <TopBar title={sc.short} back />
      <div className="scroll">
        <header className="sd-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mark s={sc} size={60} />
            <span className="chip chip--line">{t(sc.type)}</span>
            {sc.forMe && <span className="chip chip--leaf"><Ic k="check" s={14} sw={2.6} />{t('youMatch')}</span>}
          </div>
          <h1>{L(sc.name)}</h1>
          <p className="sub">{L(sc.tag)}</p>
          {sc.deadline && <span className="chip chip--alert"><Ic k="clock" s={14} sw={2} />{L(sc.deadline)}</span>}
        </header>
        <ListenCard active={active} />
        <section className="sd-sec">
          <h2>{t('whyMatch')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{sc.match.map((x, i) => <span key={i} className="mchip"><Tick />{L(x)}</span>)}</div>
        </section>
        <section className="sd-sec">
          <h2>{t('benefits')}</h2>
          <div className="card benefit"><span className="nic"><Ic k="rupee" s={22} sw={2} /></span><p>{L(sc.benefit)}</p></div>
        </section>
        <section className="sd-sec">
          <h2>{t('documents')}<span className={`chip ${nHave === sc.docs.length ? 'chip--leaf' : ''} num`}>{t('docsReady', { n: nHave, m: sc.docs.length })}</span></h2>
          <div className="card docs">
            {sc.docs.map((d, i) => (
              <div key={i} className="drow">
                <span className="nic" style={{ background: 'var(--surface-2)', color: 'var(--accent)', width: 40, height: 40 }}><Ic k={i === 0 ? 'id' : 'doc'} s={20} /></span>
                <p className="row-b row-t">{L(d)}</p>
                <button className="dtog" aria-pressed={!!have[i]} onClick={() => { buzz(); set((x) => { (x.docs[id] ||= {})[i] = !have[i]; }); }}>
                  <span className="tbox"><Ic k="check" s={14} sw={3} /></span>{t('haveDoc')}
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="sd-sec">
          <h2>{t('howToApply')}</h2>
          <ol className="steps">{sc.steps.map((st, i) => <li key={i}><b className="num">{i + 1}</b><p>{L(st)}</p></li>)}</ol>
        </section>
        {sc.nearest && (
          <section className="sd-sec">
            <h2>{t('nearest')}</h2>
            <button className="card near press" onClick={() => { buzz(); m.toast(`${t('mapL')} · ${L(sc.nearest)}`); }}>
              <span className="nic"><Ic k="pin" s={22} sw={2} /></span>
              <p className="row-b row-t">{L(sc.nearest)}</p>
              <span className="chip chip--sky"><Ic k="map" s={16} />{t('mapL')}</span>
            </button>
          </section>
        )}
        <div style={{ height: 28 }} />
      </div>
      <div className="foot">
        <button className="btn btn--block" onClick={() => { buzz(); m.toast(t('appStarted')); }}><Ic k="doc" s={20} sw={2} />{t('applyScheme')}</button>
        <button className="btn btn--ghost btn--block" onClick={() => { buzz(); m.toast(t('helpScheduled')); }}><Ic k="phone" s={18} sw={2} />{t('askHelp')}</button>
      </div>
    </>
  );
}
