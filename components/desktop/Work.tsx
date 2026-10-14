'use client';
import { ZARIYA, course, job, type Job } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav, href } from '@/lib/nav';
import { Art, Av, FriendStack, Ic } from './ui';
import { U, useDesk } from './model';
import { X } from './content';
import { ListenRow, useListen } from './Schemes';
import { useLayerFocus } from './Layers';

type WF = 'all' | 'near' | 'wfh' | 'part' | 'govt';
const WFN: Record<WF, (j: Job) => boolean> = { all: () => true, near: (j) => j.km < 3, wfh: (j) => j.type.en === 'Work from home', part: (j) => j.type.en === 'Part-time', govt: (j) => j.type.en === 'Government' };
const WF_KEY = { all: 'filterAll', near: 'filterNear', wfh: 'filterWfh', part: 'filterPart', govt: 'filterGovt' } as const;
export type DrawerStep = 'detail' | 'confirm' | 'success';

function JobCard({ j, skill, q }: { j: Job; skill: string | null; q: Record<string, string | null> }) {
  const { s, t, L } = useZ();
  const { push } = useNav();
  const ap = !!s.applied[j.id], match = skill && j.skill === skill;
  return (
    <article className="card jc hov">
      <div style={{ position: 'relative' }}>
        <Art o={j} title />
        <div className="tags">
          {match ? <span className="chip gold"><Ic n="award" s={14} />{t('skillMatch')}</span> : null}
          {j.posted ? <span className="chip">{L(j.posted)}</span> : null}
          {j.urgent ? <span className="chip alert num">{t('seatsLeft', { n: j.left })}</span> : null}
        </div>
      </div>
      <div className="jc-b">
        <p className="role"><button className="stretch" style={{ textAlign: 'left' }} aria-label={`${L(j.title)} · ${L(j.role)}`} onClick={() => push(href(`/work/${j.id}`, q))}>{L(j.role)}</button></p>
        <div className="jmeta">
          <div className="m kmm"><span className="eyebrow">{t('distance')}</span><b className="num">{j.km}<small>{t('km')}</small></b></div>
          <div className="m"><span className="eyebrow">{t('pay')}</span><b>{L(j.pay)}</b></div>
          <div className="m" style={{ textAlign: 'right' }}><span className="eyebrow">{t('hours')}</span><b>{L(j.hours)}</b></div>
        </div>
        <div className="jfoot">
          <span className="grow">
            {j.friends ? <span className="chip sky"><FriendStack n={j.friends} friends={ZARIYA.friends} />{j.friends === 1 ? t('friendWork') : t('friendsWork', { n: j.friends })}</span> : null}
            <span className={`chip ${j.urgent ? 'alert' : 'line'} num`}>{t('need', { n: j.need })}</span>
          </span>
          {ap ? <span className="chip leaf" style={{ height: 38, padding: '0 14px' }}><Ic n="check" s={16} sw={2.6} />{t('applied')}</span>
            : <button className="btn pri sm" onClick={() => push(href(`/work/${j.id}/apply`, q))}>{t('applyNow')}</button>}
        </div>
      </div>
    </article>
  );
}

function Drawer({ j, step, q, onClose }: { j: Job; step: DrawerStep; q: Record<string, string | null>; onClose: () => void }) {
  const { s, set, t, L, userName } = useZ();
  const { replace, push } = useNav();
  const D = useDesk();
  const listen = useListen();
  const ref = useLayerFocus(true);
  const ap = !!s.applied[j.id];
  const to = (st: DrawerStep, id = j.id) => replace(href(`/work/${id}${st === 'confirm' ? '/apply' : st === 'success' ? '/applied' : ''}`, q));

  let body, foot;
  if (step === 'detail') {
    const fr = ZARIYA.friends.slice(0, j.friends);
    body = (
      <>
        <div className="dr-sec"><p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--fs-h3)' }}>{L(j.role)}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {j.urgent ? <span className="chip alert num">{t('seatsLeft', { n: j.left })}</span> : null}
            <span className="chip line num">{t('need', { n: j.need })}</span>
            {ap ? <span className="chip leaf"><Ic n="check" s={14} sw={2.6} />{t('applied')}</span> : null}
          </div>
          <ListenRow id={'job-' + j.id} listen={listen} small />
        </div>
        <div className="dr-sec"><div className="tiles4">
          <div className="t4"><span className="ti"><Ic n="rupee" s={18} /></span><div><span className="eyebrow">{t('pay')}</span><b>{L(j.pay)}</b></div></div>
          <div className="t4"><span className="ti"><Ic n="clock" s={18} /></span><div><span className="eyebrow">{t('hours')}</span><b>{L(j.hours)}</b></div></div>
          <div className="t4 big"><span className="ti"><Ic n="pin" s={18} /></span><div><span className="eyebrow">{t('distance')}</span><b className="num">{j.km} <small style={{ fontSize: 'var(--fs-xs)', color: 'var(--fg-3)' }}>{t('km')}</small></b></div></div>
          <div className="t4"><span className="ti"><Ic n="work" s={18} /></span><div><span className="eyebrow">{t('jobType')}</span><b>{L(j.type)}</b></div></div>
        </div></div>
        <div className="dr-sec"><h3>{t('friendsHere')}</h3>
          {fr.length ? fr.map((f, i) => <div key={i} className="fr"><Av x={f} online={f.online} /><span className="tx"><b>{L(f.name)}</b><span className={f.online ? 'live' : ''}>{L(f.status)}</span></span></div>)
            : <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--fg-3)' }}>{t('noFriendsHere')}</p>}
        </div>
        <div className="dr-sec" style={{ borderBottom: 0 }}><h3>{t('whatYouDo')}</h3><ul className="bul">{(X.workDo[j.id] || []).map((x, i) => <li key={i}>{L(x)}</li>)}</ul></div>
      </>
    );
    foot = ap ? <span className="chip leaf" style={{ height: 48, flex: 1, justifyContent: 'center', fontSize: 'var(--fs-sm)' }}><Ic n="check" s={18} sw={2.6} />{t('applied')}</span>
      : <button className="btn pri" onClick={() => to('confirm')}>{t('applyNow')}<Ic n="chevR" s={18} /></button>;
  } else if (step === 'confirm') {
    body = (
      <div className="dr-sec" style={{ borderBottom: 0 }}>
        <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 6 }}>{t('confirmApply')}</h2>
        <p style={{ margin: '0 0 16px', color: 'var(--fg-2)', fontSize: 'var(--fs-sm)' }}>{L(j.title)} · {L(j.role)}</p>
        <div className="af">
          <div className="r"><span>{t('yourName')}</span><b>{userName()}</b></div>
          <div className="r"><span>{t('phoneLabel')}</span><b className="num">{s.profile.phone}</b></div>
          <div className="r"><span>{t('mySkills')}</span><b>{U.skills.map((x) => L(x)).join(', ')}</b></div>
          <div className="r"><span>{t('certificates')}</span><b>{D.certs.map(D.certTitle).join(', ')}</b></div>
          <div className="r"><span>{t('distance')}</span><b className="num">{j.km} {t('km')}</b></div>
        </div>
        <p className="note"><Ic n="bulb" s={18} /><span>{t('autofill')}</span></p>
      </div>
    );
    foot = <><button className="btn ghost" onClick={() => to('detail')}>{t('cancel')}</button><button className="btn pri" onClick={() => { set((d) => { d.applied[j.id] = new Date().toISOString(); }); try { navigator.vibrate?.(8); } catch {} to('success'); }}><Ic n="send" s={18} />{t('send')}</button></>;
  } else {
    const more = ZARIYA.work.filter((w) => w.id !== j.id && !s.applied[w.id]).slice(0, 2);
    body = (
      <>
        <div className="succ" role="status"><span className="big"><Ic n="check" s={52} sw={2.6} /></span><h2>{t('appliedTitle')}</h2><p><b>{L(j.title)}</b> {t('appliedBody')}</p></div>
        <div className="dr-sec" style={{ borderBottom: 0, paddingBottom: 10 }}><h3>{t('exploreMore')}</h3></div>
        <div className="more">{more.map((w) => <button key={w.id} className="card mini hov" onClick={() => to('detail', w.id)}><Art o={w} /><b>{L(w.title)}</b><span className="num">{w.km} {t('km')} · {L(w.pay).split(' · ')[0]}</span></button>)}</div>
      </>
    );
    foot = <button className="btn sec" onClick={() => push('/')}><Ic n="home" s={18} />{t('backHome')}</button>;
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside ref={ref} className="drawer" role="dialog" aria-modal="true" aria-label={L(j.title)}>
        <div className="scroll">
          {step !== 'success' ? (
            <div className="dr-art"><Art o={j} title />
              {step === 'confirm' ? <button className="ibtn bk" aria-label={t('back')} onClick={() => to('detail')}><Ic n="chevL" s={20} /></button> : null}
              <button className="ibtn x" data-autofocus aria-label={t('close')} onClick={onClose}><Ic n="x" s={20} /></button>
            </div>
          ) : <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 14px 0' }}><button className="ibtn" data-autofocus aria-label={t('close')} onClick={onClose}><Ic n="x" s={20} /></button></div>}
          {body}
        </div>
        <div className="dr-foot">{foot}</div>
      </aside>
    </>
  );
}

export default function Work({ jobId, step }: { jobId: string | null; step: DrawerStep }) {
  const { s, t, L } = useZ();
  const { route, replace } = useNav();
  const D = useDesk();
  const fq = route.q.get('f') as WF | null;
  const wf: WF = fq && fq in WFN ? fq : 'all';
  const skillQ = route.q.get('skill');
  const skill = skillQ && ZARIYA.courses.some((c) => c.id === skillQ) ? skillQ : null;
  const q = { f: wf === 'all' ? null : wf, skill };
  let list = ZARIYA.work.filter(WFN[wf]);
  if (skill) list = [...list].sort((a, b) => Number(b.skill === skill) - Number(a.skill === skill));
  const near = ZARIYA.work.filter(WFN.near).length, fr = ZARIYA.work.filter((j) => j.friends).length;
  const j = jobId && ZARIYA.work.some((w) => w.id === jobId) ? job(jobId) : null;
  const close = () => replace(href('/work', q));

  return (
    <>
      <section className="card wsum" aria-label={t('companiesHiring')}>
        <div className="k"><b className="num">{ZARIYA.work.length}</b><span>{t('openings')}</span></div><span className="sep" />
        <div className="k"><b className="num">{near}</b><span>{t('within3')}</span></div><span className="sep" />
        <div className="k"><b className="num">{fr}</b><span>{t('withFriends')}</span></div>
        <div className="r"><Ic n="pin" s={18} />{D.village}, {D.district} · <span className="chip leaf num">{t('appsN', { n: D.applications.length })}</span></div>
      </section>
      <div className="fchips" role="group" aria-label={t('filters')}>
        {(Object.keys(WFN) as WF[]).map((k) => <button key={k} className="fc" aria-pressed={wf === k} onClick={() => replace(href('/work', { f: k === 'all' ? null : k, skill }))}>{t(WF_KEY[k])}<span className="n num">{ZARIYA.work.filter(WFN[k]).length}</span></button>)}
        {skill ? <button className="fc skill" aria-label={`${t('skillMatch')}: ${L(course(skill).title)} — ${t('close')}`} onClick={() => replace(href('/work', { f: q.f }))}><Ic n="award" s={16} />{t('skillMatch')}: {L(course(skill).title)}<Ic n="x" s={14} /></button> : null}
      </div>
      <div className="jgrid">{list.map((x) => <JobCard key={x.id} j={x} skill={skill} q={q} />)}</div>
      {j ? <Drawer key={j.id} j={j} step={step === 'confirm' && s.applied[j.id] ? 'detail' : step} q={q} onClose={close} /> : null}
    </>
  );
}
