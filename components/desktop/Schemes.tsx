'use client';
import { useEffect, useRef, useState } from 'react';
import { ZARIYA, type Bi, type Scheme } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav, href } from '@/lib/nav';
import { Ic, Mark, MeAv, Tick, sv, useToast } from './ui';
import { U, useDesk } from './model';

type SType = 'all' | 'central' | 'state' | 'ngo';

/** Docs that appear most across schemes (the prototype's ALL_DOCS). */
const ALL_DOCS: Bi[] = (() => {
  const m = new Map<string, { d: Bi; n: number }>();
  ZARIYA.schemes.forEach((sc) => sc.docs.forEach((d) => m.set(d.en, { d, n: (m.get(d.en)?.n || 0) + 1 })));
  return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 6).map((x) => x.d);
})();

/** Simulated "Listen" audio: 0→100% over 10 s. id = scheme id or 'job-<id>'. */
export function useListen() {
  const [st, setSt] = useState<{ id: string; p: number } | null>(null);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => { if (iv.current) clearInterval(iv.current); iv.current = null; setSt(null); };
  const toggle = (id: string) => {
    if (iv.current) clearInterval(iv.current);
    if (st?.id === id) { iv.current = null; setSt(null); return; }
    setSt({ id, p: 0 });
    iv.current = setInterval(() => setSt((x) => { if (!x) return x; const p = x.p + 1; if (p >= 100) { if (iv.current) clearInterval(iv.current); iv.current = null; return null; } return { ...x, p }; }), 100);
  };
  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);
  return { st, toggle, stop };
}

export function ListenRow({ id, listen, small }: { id: string; listen: ReturnType<typeof useListen>; small?: boolean }) {
  const { t } = useZ();
  const on = listen.st?.id === id;
  return (
    <div className="listen">
      {on ? (
        <>
          <div className="aud" role="status"><span className="eq"><i /><i /><i /></span><span>{t('playing')}</span><span className="tr"><i style={sv({ '--p': listen.st!.p + '%' })} /></span></div>
          <button className="btn ghost sm" onClick={() => listen.toggle(id)}><Ic n="pause" s={16} />{t('stop')}</button>
        </>
      ) : small
        ? <button className="btn sec sm" onClick={() => listen.toggle(id)}><Ic n="speaker" s={16} />{t('listen')}</button>
        : <button className="btn sec" onClick={() => listen.toggle(id)}><Ic n="speaker" s={18} />{t('listen')}</button>}
    </div>
  );
}

export function useHave() {
  const { set } = useZ();
  const D = useDesk();
  return (en: string) => {
    const v = !D.have(en);
    set((d) => { ZARIYA.schemes.forEach((sc) => sc.docs.forEach((doc, i) => { if (doc.en === en) { d.docs[sc.id] = { ...(d.docs[sc.id] || {}), [i]: v }; } })); });
  };
}

function SchemeDetail({ sc, listen }: { sc: Scheme; listen: ReturnType<typeof useListen> }) {
  const { t, L } = useZ();
  const D = useDesk();
  const toggleHave = useHave();
  const toast = useToast();
  const ready = sc.docs.filter((d) => D.have(d.en)).length;
  const nearKm = sc.nearest ? (L(sc.nearest).match(/([\d.]+)\s*(km|किमी)/) || [])[1] : null;
  return (
    <>
      <div className="sd-h">
        <div className="top2"><Mark s={sc} size={60} /><div><span className="chip line">{t(sc.type)}</span>{sc.forMe ? <> <span className="chip leaf"><Ic n="check" s={14} sw={2.6} />{t('youMatch')}</span></> : null}</div></div>
        <h2>{L(sc.name)}</h2><p>{L(sc.tag)}</p>
        <ListenRow id={sc.id} listen={listen} />
      </div>
      <div className="sd-s"><h3>{t('whyMatch')}</h3><div className="why">{sc.match.map((m, i) => <span key={i} className={`chip ${sc.forMe ? 'leaf' : 'line'}`}>{sc.forMe ? <Tick s={10} /> : null}{L(m)}</span>)}</div></div>
      <div className="sd-s"><h3>{t('benefits')}</h3><p>{L(sc.benefit)}</p></div>
      <div className="sd-s">
        <h3>{t('documents')}<span className={`chip ${ready === sc.docs.length ? 'leaf' : 'gold'} num`}>{ready === sc.docs.length ? t('allReady') : t('d_docsReady', { d: ready, n: sc.docs.length })}</span></h3>
        <div className="docl">
          {sc.docs.map((d) => { const h = D.have(d.en); return (
            <button key={d.en} className="doc" role="checkbox" aria-checked={h} onClick={() => toggleHave(d.en)}><span className="cbx"><Ic n="check" s={13} sw={3} /></span><span className="nm2">{L(d)}</span><span className="st2">{h ? t('haveDoc') : ''}</span></button>
          ); })}
        </div>
      </div>
      <div className="sd-s"><h3>{t('howToApply')}</h3><ol className="steps">{sc.steps.map((x, i) => <li key={i}><span>{L(x)}</span></li>)}</ol></div>
      {sc.nearest ? (
        <div className="sd-s"><h3>{t('nearest')}</h3><div className="near"><span className="pi"><Ic n="pin" s={22} /></span><b>{L(sc.nearest).replace(/\s*·\s*[\d.]+\s*(km|किमी)$/, '')}</b>{nearKm ? <span className="km num">{nearKm}<small>{t('km')}</small></span> : null}</div></div>
      ) : null}
      <div className="sd-cta">
        <button className="btn pri full" onClick={() => toast(t('d_appStarted'))}><Ic n="doc" s={18} />{t('applyScheme')}</button>
        <button className="btn sec full" onClick={() => toast(t('helpScheduled'))}><Ic n="phone" s={18} />{t('askHelp')}</button>
      </div>
    </>
  );
}

export default function Schemes({ selId }: { selId: string | null }) {
  const { t, L, userName } = useZ();
  const { route, replace, push } = useNav();
  const D = useDesk();
  const toggleHave = useHave();
  const listen = useListen();
  const forMe = route.q.get('tab') !== 'all';
  const typeQ = route.q.get('type') as SType | null;
  const stype: SType = typeQ === 'central' || typeQ === 'state' || typeQ === 'ngo' ? typeQ : 'all';
  const base = ZARIYA.schemes.filter((x) => !forMe || x.forMe);
  const list = base.filter((sc) => stype === 'all' || sc.type === stype);
  const want = selId || route.q.get('sel');
  const sel = list.find((x) => x.id === want) || list[0] || ZARIYA.schemes.find((x) => x.id === want) || ZARIYA.schemes[0];
  const q = (o: { tab?: boolean; type?: SType }) => ({ tab: (o.tab ?? forMe) ? null : 'all', type: (o.type ?? stype) === 'all' ? null : o.type ?? stype });
  const path = (id: string | null, o: { tab?: boolean; type?: SType } = {}) => href(id ? `/schemes/${id}` : '/schemes', q(o));
  const detail = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    listen.stop();
    const d = detail.current;
    if (d) { d.scrollTop = 0; d.animate?.([{ opacity: 0.4, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel.id]);

  const types: [SType, string][] = [['all', t('all')], ['central', t('central')], ['state', t('state')], ['ngo', t('ngo')]];
  return (
    <div className="sch">
      <aside className="card fpanel sch-f" aria-label={t('filters')}>
        <div className="fgroup types"><h3>{t('typeL')}</h3>
          <div className="opts" role="radiogroup" aria-label={t('typeL')}>
            {types.map(([k, l]) => <button key={k} className="opt" role="radio" aria-checked={stype === k} onClick={() => replace(path(selId, { type: k }))}><span className="rdo" />{l}<span className="cnt num">{k === 'all' ? base.length : base.filter((x) => x.type === k).length}</span></button>)}
          </div>
        </div>
        <div className="fgroup">
          <button className="row-switch" role="switch" aria-checked={forMe} onClick={() => replace(path(selId, { tab: !forMe }))}><span className="lbl"><Ic n="check" s={18} sw={2.4} /><span>{t('forMe')}</span></span><span className="sw" /></button>
          <p className="hint">{t('forMeHint')}</p>
        </div>
        <div className="fgroup docs"><h3>{t('docsIHave')}</h3>
          <div className="opts">{ALL_DOCS.map((d) => <button key={d.en} className="opt" role="checkbox" aria-checked={D.have(d.en)} onClick={() => toggleHave(d.en)}><span className="cbx"><Ic n="check" s={13} sw={3} /></span>{L(d)}</button>)}</div>
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <section className="card elig" aria-label={t('yourProfile')}>
          <MeAv cls="lg" />
          <div className="tx"><span className="eyebrow">{t('yourProfile')}</span><b>{userName()}</b>
            <div className="facts2">
              <span><b>{t('age')}</b> <span className="num">{U.age}</span></span><span><b>{t('gender')}</b> {L(U.gender)}</span><span><b>{t('stateL')}</b> {D.stateName}</span><span><b>{t('education')}</b> {L(U.education)}</span>
              <span className="chip leaf"><Ic n="check" s={14} sw={2.6} />{t('bplQualified')}</span>
            </div>
          </div>
          <button className="btn ghost sm" onClick={() => push('/profile/edit')}><Ic n="edit" s={16} />{t('edit')}</button>
        </section>
        <div className="list-h"><span><b className="num">{list.length}</b> {t('schemesN', { n: '' }).trim()}</span><span>{t('matchN', { n: D.matchCount })}</span></div>
        <div className="srows">
          {list.length ? list.map((sc) => {
            const ready = sc.docs.filter((d) => D.have(d.en)).length;
            return (
              <button key={sc.id} className="srow" aria-current={sc.id === sel.id} onClick={() => replace(path(sc.id))}>
                <Mark s={sc} size={52} />
                <span className="tx"><b>{L(sc.name)}</b><span>{L(sc.tag)}</span>
                  <span className="chips">
                    {sc.forMe ? <span className="chip leaf"><Ic n="check" s={14} sw={2.6} />{t('youMatch')}</span> : null}
                    <span className="chip line">{t(sc.type)}</span>
                    {sc.deadline ? <span className="chip alert"><Ic n="clock" s={14} />{L(sc.deadline)}</span> : null}
                    <span className="dm"><Ic n="doc" s={14} /><span className="pips">{sc.docs.map((d) => <i key={d.en} className={D.have(d.en) ? 'y' : ''} />)}</span><span className="num">{t('d_docsReady', { d: ready, n: sc.docs.length })}</span></span>
                  </span>
                </span>
              </button>
            );
          }) : <div className="empty"><span className="em-ic"><Ic n="scheme" s={32} /></span><p>{t('noSchemes')}</p></div>}
        </div>
      </div>
      <section ref={detail} className="card sch-d" aria-label={L(sel.name)}><SchemeDetail sc={sel} listen={listen} /></section>
    </div>
  );
}
