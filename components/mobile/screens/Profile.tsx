'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useZ } from '@/lib/store';
import { ZARIYA } from '@/lib/data';
import { buzz, useM, type ScreenProps } from '../ctx';
import { BackBtn, Flame, Ic, LangChip, MeAv, certCourses, cssv } from '../ui';
import { WM, ZU } from '../content';
import { resetHomeSkeleton } from './Home';

function usePrefersDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const f = () => setDark(mq.matches);
    f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return dark;
}

function Row({ icon, title, sub, end = <Ic k="chev" s={20} />, onClick, pressed, danger }: { icon: string; title: ReactNode; sub?: ReactNode; end?: ReactNode; onClick: () => void; pressed?: boolean; danger?: boolean }) {
  return (
    <button className={`row ${danger ? 'danger' : ''}`} onClick={onClick} aria-pressed={pressed}>
      <span className="nic"><Ic k={icon} s={22} /></span>
      <span className="row-b"><span className="row-t" style={{ display: 'block' }}>{title}</span>{sub ? <span className="muted" style={{ display: 'block' }}>{sub}</span> : null}</span>
      {end}
    </button>
  );
}

export function Profile(_: ScreenProps) {
  const { s, set, t, L, tl, lang, userName, doneN, reset } = useZ();
  const m = useM();
  const sysDark = usePrefersDark();
  const isDark = s.theme === 'dark' || (s.theme === 'system' && sysDark);
  const today = (new Date().getDay() + 6) % 7;
  const wk = ZU.weeklyMinutes.map((v, i) => (i < today ? v : i === today ? s.minutesToday : 0));
  const total = wk.reduce((a, b) => a + b, 0);
  const days = tl('days');
  const nApplied = Object.values(s.applied).filter(Boolean).length;
  const curL = ZARIYA.languages.find((l) => l.code === lang)!;
  const certs = certCourses(doneN);
  const nCerts = certs.length + 1; // + the PMKVY sewing-machine-operator certificate
  const village = s.profile.village.trim() || L(ZU.village);

  const Sw = <span className="sw" />;

  return (
    <div className="scroll">
      <header className="band prof-band">
        <span className="wm-bleed wordmark wordmark--outline" aria-hidden="true">{WM}</span>
        <div className="band-row">
          <BackBtn cls="on-band" />
          <div className="band-r">
            <LangChip band />
            <button className="ib on-band" aria-label={t('edit')} onClick={() => m.go('/profile/edit')}><Ic k="pencil" /></button>
          </div>
        </div>
        <MeAv cls="av--band bigav" />
        <h1>{userName()}</h1>
        <p className="num">{s.profile.phone} · {village}</p>
      </header>

      <div className="card pstats rise">
        <div><b className="num">{total}</b><small>{t('minWeek')}</small></div>
        <div><b className="num" style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Flame s={22} />{ZU.streakDays}</b><small>{t('streakShort')}</small></div>
        <div><b className="num" style={{ color: 'var(--gold)' }}>{nCerts}</b><small>{t('certificates')}</small></div>
      </div>

      <section className="sec">
        <div className="card chart">
          <div className="chart-h"><h2 className="h-sec" style={{ fontSize: 'var(--fs-h3)' }}>{t('weeklyLearning')}</h2><span className="muted num">{t('weekTotal', { n: total })}</span></div>
          <div className="bars" role="img" aria-label={`${t('weeklyLearning')}: ${wk.map((v, i) => days[i] + ' ' + v).join(', ')} ${t('min')}`}>
            <span className="goal" aria-hidden="true"><span className="num">{ZU.goalMinutes}</span></span>
            {wk.map((v, i) => (
              <div key={i} className={i === today ? 'today' : i > today ? 'future' : ''} style={cssv({ '--h': `${Math.max((v / ZU.goalMinutes) * 100, 3)}%`, '--k': i })}>
                <i />{i === today && <em className="num">{v}</em>}
              </div>
            ))}
          </div>
          <div className="days" aria-hidden="true">{days.map((d, i) => <span key={i} className={i === today ? 'today' : ''}>{d}</span>)}</div>
        </div>
      </section>

      <section className="sec">
        <div className="sec-h"><h2>{t('mySkills')}</h2></div>
        <div className="skills">
          {ZU.skills.map((k, i) => <span key={i} className="chip"><span className="nic"><Ic k={i ? 'star' : 'courses'} s={16} /></span>{L(k)}</span>)}
          {certs.map((c) => <span key={c.id} className="chip"><span className="nic" style={{ color: 'var(--gold)', background: 'var(--gold-pale)' }}><Ic k="award" s={16} /></span>{L(c.title)}</span>)}
        </div>
      </section>

      <section className="sec">
        <div className="card plist">
          <Row icon="bell" title={t('notifications')} sub={s.unread.length ? t('newN', { n: s.unread.length }) : ''} onClick={() => m.openSheet({ kind: 'notifs' })} />
          <Row icon="globe" title={t('language')} sub={curL.native} onClick={() => m.openSheet({ kind: 'lang' })} />
          <Row icon="shield" title={t('proxy')} sub={t('proxyNote')} onClick={() => { buzz(); m.toast(t('helperCode')); }} />
          <Row icon="award" title={t('certificates')} end={<><span className="chip chip--gold num">{nCerts}</span><Ic k="chev" s={20} /></>} onClick={() => m.go(`/courses/${certs[0]?.id ?? 'craft'}/certificate`)} />
          <Row icon="work" title={t('internships')} sub={nApplied ? t('appliedN', { n: nApplied }) : ''} onClick={() => m.reset('/work')} />
        </div>
      </section>

      <section className="sec">
        <div className="sec-h"><h2>{t('settings')}</h2></div>
        <div className="card plist">
          <Row icon="moon" title={t('darkMode')} end={Sw} pressed={isDark} onClick={() => { buzz(); set((d) => { d.theme = isDark ? 'light' : 'dark'; }); }} />
          <Row icon="text" title={t('textSize')} end={Sw} pressed={s.bigText} onClick={() => { buzz(); set((d) => { d.bigText = !d.bigText; }); }} />
          <Row icon="speaker" title={t('voiceHelp')} end={Sw} pressed={s.readAloud} onClick={() => { buzz(); const on = !s.readAloud; set((d) => { d.readAloud = on; }); if (on) m.toast(t('readAloudOn')); }} />
          <Row icon="sparkle" title={t('m_langIntro')} sub={t('m_langIntroSub')} onClick={() => m.go('/welcome')} />
        </div>
        <div className="card plist" style={{ marginTop: 12 }}>
          <Row icon="reset" title={t('m_reset')} sub={t('m_resetSub')} end={null} danger onClick={() => { buzz(); reset(); resetHomeSkeleton(); m.toast(t('m_resetDone')); }} />
        </div>
      </section>
      <div style={{ height: 32 }} />
    </div>
  );
}
