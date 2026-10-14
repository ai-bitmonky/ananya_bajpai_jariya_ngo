'use client';
import { useEffect, useRef, useState } from 'react';
import { useZ } from '@/lib/store';
import { href } from '@/lib/nav';
import { ZARIYA } from '@/lib/data';
import { buzz, parsePath, useM, type ScreenProps } from '../ctx';
import { Fill, Ic, Mark, MeAv, PBar, TopBar, Tick, cssv } from '../ui';
import { F } from '../icons';
import { STATES, ZU } from '../content';

function ageFrom(dob: string) {
  const b = new Date(dob);
  if (isNaN(+b)) return ZU.age;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}

export function ProfileCard() {
  const { s, t, L, userName } = useZ();
  const m = useM();
  const st = STATES.find((x) => x.en === s.profile.state) || STATES[0];
  const edu = s.profile.education === ZU.education.en ? L(ZU.education) : s.profile.education;
  const card = s.profile.card;
  return (
    <div className="card prof">
      <div className="prof-top">
        <MeAv />
        <div className="row-b"><p className="eyebrow">{t('yourProfile')}</p><h2 className="clamp1">{userName()}</h2></div>
        <button className="edit" onClick={() => m.go('/profile/edit')}><Ic k="pencil" s={18} sw={2} />{t('edit')}</button>
      </div>
      <dl className="pgrid">
        <div><dt>{t('age')}</dt><dd className="num">{ageFrom(s.profile.dob)}</dd></div>
        <div><dt>{t('gender')}</dt><dd>{L(ZU.gender)}</dd></div>
        <div><dt>{t('stateL')}</dt><dd>{L(st)}</dd></div>
        <div><dt>{t('education')}</dt><dd>{edu}</dd></div>
      </dl>
      <span className="chip chip--leaf"><Tick />{card === 'BPL' || card === 'AAY' ? t('bplQualified') : `${t('cardType')}: ${card === 'None' ? t('none') : card}`}</span>
    </div>
  );
}

const TYPES = ['central', 'state', 'ngo'] as const;

export function Schemes({ path }: ScreenProps) {
  const { t, L } = useZ();
  const m = useM();
  const { q } = parsePath(path);
  const tab = q.get('tab') === 'forme' ? 'forme' : 'all';
  const tq = q.get('type');
  const type = (TYPES as readonly string[]).includes(tq || '') ? tq : null;
  const n = ZARIYA.schemes.filter((x) => x.forMe).length;
  let list = tab === 'forme' ? ZARIYA.schemes.filter((x) => x.forMe) : ZARIYA.schemes.slice();
  if (type) list = list.filter((x) => x.type === type);
  list = [...list].sort((a, b) => +b.forMe - +a.forMe);
  const setQ = (nt: string, ny: string | null) => { buzz(); m.setQuery(href('/schemes', { tab: nt === 'all' ? null : nt, type: ny })); };

  return (
    <>
      <TopBar title={t('schemes')} />
      <div className="scroll">
        <div className="pad"><ProfileCard /></div>
        <div className="seg" role="tablist" style={cssv({ '--n': 2, '--i': tab === 'forme' ? 1 : 0 })}>
          <span className="seg-ind" />
          <button role="tab" aria-selected={tab !== 'forme'} onClick={() => setQ('all', type)}>{t('all')}</button>
          <button role="tab" aria-selected={tab === 'forme'} onClick={() => setQ('forme', type)}>{t('forMe')}<span className="badge num">{n}</span></button>
        </div>
        <div className="chips-row">
          {TYPES.map((k) => <button key={k} className="chip" aria-pressed={type === k} onClick={() => setQ(tab, type === k ? null : k)}>{t(k)}</button>)}
        </div>
        <ul className="slist" key={tab + '|' + type}>
          {!list.length ? (
            <li className="empty"><span className="ei"><Ic k="schemes" s={28} /></span><p>{t('noSchemes')}</p></li>
          ) : list.map((x, i) => (
            <li key={x.id} className="rise" style={cssv({ '--i': i })}>
              <button className="card srow press" onClick={() => m.go(`/schemes/${x.id}`)}>
                <Mark s={x} size={48} />
                <div className="row-b">
                  <h3 className="clamp2">{L(x.name)}</h3>
                  <p className="sub clamp2">{L(x.tag)}</p>
                  <div className="wmeta">
                    <span className="chip chip--line">{t(x.type)}</span>
                    {x.forMe && <span className="chip chip--leaf"><Ic k="check" s={14} sw={2.6} />{t('youMatch')}</span>}
                    {x.deadline && <span className="chip chip--alert"><Ic k="clock" s={14} sw={2} />{L(x.deadline)}</span>}
                  </div>
                </div>
                <span className="chev"><Ic k="chev" s={20} /></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** "Listen" card: a simulated 10 s read-out with a progress bar and wave. Stops when covered. */
export function ListenCard({ active }: { active: boolean }) {
  const { t } = useZ();
  const [on, setOn] = useState(false);
  const [p, setP] = useState(0);
  const tm = useRef<number | undefined>(undefined);
  useEffect(() => () => clearInterval(tm.current), []);
  useEffect(() => { if (!active) { clearInterval(tm.current); setOn(false); } }, [active]);
  const toggle = () => {
    buzz();
    clearInterval(tm.current);
    if (on) { setOn(false); return; }
    let x = p >= 100 ? 0 : p;
    setP(x); setOn(true);
    tm.current = window.setInterval(() => {
      x += 1;
      if (x >= 100) { x = 100; clearInterval(tm.current); setOn(false); }
      setP(x);
    }, 100);
  };
  const f = p / 100;
  return (
    <button className="card listen" aria-pressed={on} onClick={toggle}>
      <span className="lbtn">{on ? <Fill d={F.pause} s={22} /> : <Ic k="speaker" s={24} sw={2} />}</span>
      <div className="row-b"><p className="row-t">{on ? t('playing') : t('listen')}</p><PBar p={f} /></div>
      <span className="wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      <span className="muted num" style={{ minWidth: 34, textAlign: 'right' }}>0:{String(Math.max(0, 10 - Math.floor(f * 10))).padStart(2, '0')}</span>
    </button>
  );
}
