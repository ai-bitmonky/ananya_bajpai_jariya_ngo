'use client';
import { useEffect } from 'react';
import { useZ } from '@/lib/store';
import { ZARIYA, job } from '@/lib/data';
import { parsePath, useM, type ScreenProps } from '../ctx';
import { Art, Avatar, BackBtn, Ic } from '../ui';
import { JOBDO } from '../content';
import { useSolid } from './CourseDetail';
import { ListenCard } from './Schemes';
import { ApplyBtn, NeedChip } from './Work';

function PayDD({ str }: { str: string }) {
  const m = str.match(/^(₹[\d,–]+)(.*)$/);
  return m
    ? <dd className="big num">{m[1]}<small style={{ display: 'block', margin: '4px 0 0' }}>{m[2].replace(/^\s*/, '')}</small></dd>
    : <dd className="num">{str}</dd>;
}

export function JobDetail({ id, path, active }: ScreenProps & { id: string }) {
  const { s, t, L } = useZ();
  const m = useM();
  const w = job(id);
  const F = ZARIYA.friends.slice(0, w.friends);
  const { sc, solid } = useSolid('.jhero');
  const wantsApply = parsePath(path).pathname.endsWith('/apply');

  // deep link /work/:id/apply opens the confirm sheet over the job
  useEffect(() => {
    if (wantsApply && !s.applied[id]) m.openSheet({ kind: 'apply', id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`fill-c ${solid ? 'solid' : ''}`}>
      <div className="cbar"><BackBtn cls="ib--glass" /><span className="cbar-t">{L(w.title)}</span></div>
      <div className="scroll" ref={sc}>
        <Art o={w} title={false} cls="jhero" />
        <div className="cd-head">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>{L(w.type)}{w.posted ? ' · ' + L(w.posted) : ''}</p>
          <h1>{L(w.title)}</h1>
          <p className="sub" style={{ fontSize: 'var(--fs-body)', marginTop: 2 }}>{L(w.role)}</p>
          <div className="need"><NeedChip w={w} /></div>
        </div>
        <dl className="tiles">
          <div className="card tile"><span className="nic" style={{ background: 'var(--leaf-pale)', color: 'var(--leaf)' }}><Ic k="rupee" s={20} sw={2} /></span><dt>{t('pay')}</dt><PayDD str={L(w.pay)} /></div>
          <div className="card tile"><span className="nic" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}><Ic k="clock" s={20} sw={2} /></span><dt>{t('hours')}</dt><dd>{L(w.hours)}</dd></div>
          <div className="card tile"><span className="nic" style={{ background: 'var(--sky-pale)', color: 'var(--sky)' }}><Ic k="pin" s={20} sw={2} /></span><dt>{t('distance')}</dt><dd className="big num">{w.km}<small>{t('km')}</small></dd></div>
          <div className="card tile"><span className="nic" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}><Ic k="work" s={20} sw={2} /></span><dt>{t('jobType')}</dt><dd>{L(w.type)}</dd></div>
        </dl>
        <ListenCard active={active} />
        {F.length > 0 && (
          <section className="sd-sec">
            <h2>{t('friendsHere')}</h2>
            <div className="frlist">{F.map((f, i) => <div key={i}><Avatar f={f} style={{ position: 'relative' }}>{f.online && <i className="online" />}</Avatar>{L(f.name)}</div>)}</div>
          </section>
        )}
        <section className="sd-sec">
          <h2>{t('whatYouDo')}</h2>
          <ul className="bul">{(JOBDO[w.id] || []).map((x, i) => <li key={i}>{L(x)}</li>)}</ul>
        </section>
        <div style={{ height: 28 }} />
      </div>
      <div className="foot"><ApplyBtn w={w} block /></div>
    </div>
  );
}
