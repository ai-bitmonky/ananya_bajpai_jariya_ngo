'use client';
/* Optional intro (/welcome): language → 3 slides → "About you". Never required — Skip or Finish
   marks it seen. The About-you form doubles as Profile → Edit (/profile/edit). */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useZ, type ZState } from '@/lib/store';
import { ZARIYA } from '@/lib/data';
import { buzz, reducedMotion, useM, type ScreenProps } from '../ctx';
import { BackBtn, Ic, LangCards, LangChip, TopBar, cssv } from '../ui';
import { CARDS, OBART, STATES, WM, ZU } from '../content';
import { resetHomeSkeleton } from './Home';

type Card = ZState['profile']['card'];

function AboutForm({ edit }: { edit: boolean }) {
  const { s, set, t, L, userName } = useZ();
  const m = useM();
  const [card, setCard] = useState<Card>(s.profile.card);
  const nm = useRef<HTMLInputElement>(null);
  const st = useRef<HTMLSelectElement>(null);
  const dob = useRef<HTMLInputElement>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = nm.current?.value.trim() || '';
    const isDefault = !v || v === ZU.name.en || v === ZU.name.hi;
    set((d) => {
      d.profile.name = isDefault ? '' : v;
      d.profile.state = st.current?.value || d.profile.state;
      d.profile.card = card;
      d.profile.dob = dob.current?.value || d.profile.dob;
      if (!edit) d.introSeen = true;
    });
    buzz();
    if (edit) { m.back(); m.toast(t('profileSaved')); return; }
    resetHomeSkeleton();
    m.reset('/', 'push');
  };
  return (
    <>
      <div className="scroll">
        <form className="ob-form" id="infoForm" noValidate onSubmit={submit}>
          {!edit && <p className="eyebrow" style={{ color: 'var(--accent)' }}>{t('stepOf', { n: 3, m: 3 })}</p>}
          <h1>{t('tellUs')}</h1>
          <p className="why"><Ic k="info" s={20} sw={2} /><span>{t('tellUsWhy')}</span></p>
          <label className="field"><span>{t('yourName')}</span><input ref={nm} className="inp" name="nm" defaultValue={userName()} autoComplete="given-name" /></label>
          <label className="field">
            <span>{t('stateL')}</span>
            <select ref={st} className="inp" name="st" defaultValue={STATES.some((x) => x.en === s.profile.state) ? s.profile.state : STATES[0].en}>
              {STATES.map((x) => <option key={x.en} value={x.en}>{L(x)}</option>)}
            </select>
          </label>
          <div className="field" role="group" aria-label={t('cardType')}>
            <span>{t('cardType')}</span>
            <div className="cardseg">
              {CARDS.map((k) => <button key={k} type="button" aria-pressed={card === k} onClick={() => { buzz(); setCard(k); }}>{k === 'None' ? t('none') : k}</button>)}
            </div>
          </div>
          <label className="field"><span>{t('dob')}</span><input ref={dob} className="inp num" type="date" name="dob" defaultValue={s.profile.dob} max="2010-12-31" /></label>
          {!edit && <p className="help"><Ic k="shield" s={20} sw={2} /><span>{t('m_optional')}</span></p>}
        </form>
      </div>
      <div className="foot">
        <button className="btn btn--block" type="submit" form="infoForm">{edit ? t('saveL') : t('finish')}{!edit && <Ic k="chev" s={20} sw={2.4} />}</button>
      </div>
    </>
  );
}

export function EditInfo(_: ScreenProps) {
  const { t } = useZ();
  return (<><TopBar title={t('yourProfile')} back /><AboutForm edit /></>);
}

function LangStep() {
  const { s, set, t, lang } = useZ();
  const m = useM();
  const [pick, setPick] = useState<string | null>(null);
  const skip = () => { buzz(); set((d) => { d.introSeen = true; }); m.reset('/', 'pop'); };
  return (
    <>
      <button className="ob-skip" onClick={skip}>{t('skipIntro')}</button>
      <div className="scroll">
        <div className="ob-h">
          <p className="wordmark ob-logo">{WM}</p>
          <h1>{t('chooseLanguage')}</h1>
          <p className="alt" lang={lang === 'en' ? 'hi' : 'en'}>{ZARIYA.i18n.chooseLanguage[lang === 'en' ? 'hi' : 'en']}</p>
          <p className="sub" style={{ marginTop: 8 }}>{t('langNote')}</p>
        </div>
        <div className="lgrid">
          <LangCards sel={pick ?? s.lang} onPick={(c) => {
            buzz();
            if (c === 'en' || c === 'hi') { setPick(null); set((d) => { d.lang = c; }); }
            else { setPick(c); m.toast(t('langSoon'), false); }
          }} />
        </div>
      </div>
      <div className="foot"><button className="btn btn--block" onClick={() => m.go('/welcome?step=intro')}>{t('next')}<Ic k="chev" s={20} sw={2.4} /></button></div>
    </>
  );
}

function IntroStep() {
  const { t } = useZ();
  const m = useM();
  const [i, setI] = useState(0);
  const tr = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tr.current;
    if (!el) return;
    const on = () => setI(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, []);
  const next = () => {
    buzz();
    if (i >= 2) { m.go('/welcome?step=about'); return; }
    const el = tr.current;
    el?.scrollTo({ left: (i + 1) * el.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
  return (
    <>
      <button className="ob-skip" onClick={() => m.go('/welcome?step=about')}>{t('skipIntro')}</button>
      <div className="ob-track" ref={tr}>
        {OBART.map(([a0, a1, svg], k) => (
          <section key={k} className="ob-slide" aria-roledescription="slide" aria-label={`${k + 1}/3`}>
            <div className="ob-art" style={cssv({ '--a0': a0, '--a1': a1 })}>
              <svg viewBox="0 0 240 200" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
            <h1>{t(`onb${(k + 1) as 1 | 2 | 3}t`)}</h1>
            <p>{t(`onb${(k + 1) as 1 | 2 | 3}b`)}</p>
          </section>
        ))}
      </div>
      <div className="foot ob-foot">
        <span className="dots" aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} className={k === i ? 'on' : ''} />)}</span>
        <button className="btn" style={{ minWidth: 150 }} onClick={next}>{i === 2 ? t('getStarted') : t('next')}<Ic k="chev" s={20} sw={2.4} /></button>
      </div>
    </>
  );
}

export function Welcome({ step }: ScreenProps & { step: 'lang' | 'intro' | 'about' }) {
  if (step === 'intro') return <IntroStep />;
  if (step === 'about') {
    return (
      <>
        <header className="bar"><BackBtn /><span className="bar-t" /><div className="bar-r"><LangChip /></div></header>
        <AboutForm edit={false} />
      </>
    );
  }
  return <LangStep />;
}
