'use client';
import { useZ } from '@/lib/store';
import { ZARIYA, job } from '@/lib/data';
import { useM, type ScreenProps } from '../ctx';
import { Art, Ic } from '../ui';

export function Success({ id }: ScreenProps & { id: string }) {
  const { s, t, L } = useZ();
  const m = useM();
  const w = job(id);
  const more = ZARIYA.work
    .filter((x) => x.id !== w.id && !s.applied[x.id])
    .sort((a, b) => (+(b.skill === w.skill) - +(a.skill === w.skill)) || a.km - b.km)
    .slice(0, 2);
  return (
    <>
      <div className="succ">
        <button className="ib close" aria-label={t('closeL')} onClick={() => m.back()}><Ic k="close" /></button>
        <span className="bigok" aria-hidden="true"><Ic k="check" s={56} sw={3} /></span>
        <h1>{t('appliedTitle')}</h1>
        <p><b>{L(w.title)}</b> {t('appliedBody')}</p>
        <div className="card callcard">
          <span className="nic"><Ic k="phone" s={22} sw={2} /></span>
          <div className="row-b"><p className="row-t num">{s.profile.phone}</p><p className="muted">{L(w.role)}</p></div>
          <Ic k="check" s={22} sw={2.4} style={{ color: 'var(--leaf)' }} />
        </div>
        {more.length > 0 && (
          <section className="xmore">
            <h2>{t('exploreMore')}</h2>
            <div className="hs">
              {more.map((x) => (
                <button key={x.id} className="card xcard press" onClick={() => m.swap(`/work/${x.id}`, 'push')}>
                  <Art o={x} />
                  <div className="xb"><p className="sub clamp1">{L(x.role)}</p><p className="row-t num" style={{ fontSize: 'var(--fs-sm)' }}>{L(x.pay).split(' · ')[0]} · {x.km} {t('km')}</p></div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="foot"><button className="btn btn--block" onClick={() => m.reset('/')}><Ic k="home" s={20} sw={2} />{t('backHome')}</button></div>
    </>
  );
}
