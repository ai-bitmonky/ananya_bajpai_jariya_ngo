'use client';
/* Optional intro, presented as a centred modal over the dashboard:
   language → 3 slides → about you. No phone / OTP; Skip or Done marks introSeen. */
import { useState, type FormEvent } from 'react';
import { ZARIYA } from '@/lib/data';
import { useZ, type ZState } from '@/lib/store';
import { Ic, BRAND, useToast } from './ui';
import { Modal } from './Layers';
import { OBART, STATES } from './content';

type Step = 'lang' | 0 | 1 | 2 | 'about';
type Card = ZState['profile']['card'];
const CARDS: Card[] = ['AAY', 'BPL', 'APL', 'None'];

export default function Welcome({ onDone }: { onDone: () => void }) {
  const { s, set, t, L, lang, userName } = useZ();
  const toast = useToast();
  const [step, setStep] = useState<Step>('lang');
  const [name, setName] = useState(userName());
  const [st, setSt] = useState(s.profile.state || 'Haryana');
  const [card, setCard] = useState<Card>(s.profile.card);
  const [dob, setDob] = useState(s.profile.dob);

  const skip = () => { set((d) => { d.introSeen = true; }); onDone(); };
  const finish = (e?: FormEvent) => {
    e?.preventDefault();
    const n = name.trim();
    set((d) => {
      d.profile.name = !n || n === ZARIYA.user.name.en || n === ZARIYA.user.name.hi ? '' : n;
      d.profile.state = st; d.profile.card = card; d.profile.dob = dob || d.profile.dob;
      d.introSeen = true;
    });
    toast(t('d_introDone'));
    onDone();
  };
  const pick = (code: string) => {
    if (code === 'en' || code === 'hi') set((d) => { d.lang = code; });
    else toast(t('langSoon'), false);
  };
  const slide = typeof step === 'number' ? step : -1;
  const dots = (
    <span className="wl-dots" aria-hidden="true">{(['lang', 0, 1, 2, 'about'] as Step[]).map((k, i) => <i key={i} className={k === step ? 'on' : ''} />)}</span>
  );

  return (
    <Modal label={t('d_introLabel')} onClose={skip} className="wl">
      {step === 'lang' ? (
        <div className="wl-b">
          <p className="wordmark wl-logo">{BRAND}</p>
          <h2>{t('chooseLanguage')}</h2>
          <p className="wl-sub">{t('langNote')}</p>
          <div className="wl-lgrid">
            {ZARIYA.languages.map((l) => (
              <button key={l.code} className="lcard" aria-pressed={lang === l.code} lang={l.code} onClick={() => pick(l.code)}>
                <b>{l.native}</b><span className="lc-b"><small lang="en">{l.name}</small>{l.code === 'en' || l.code === 'hi' ? null : <span className="chip">{t('langSoon')}</span>}</span>
              </button>
            ))}
          </div>
        </div>
      ) : slide >= 0 ? (
        <div className="wl-slide" aria-roledescription="slide" aria-label={t('d_slideN', { n: slide + 1, m: 3 })} key={slide}>
          <div className="wl-art" style={{ ['--a0' as string]: OBART[slide][0], ['--a1' as string]: OBART[slide][1] }}>
            <svg viewBox="0 0 240 200" aria-hidden="true" dangerouslySetInnerHTML={{ __html: OBART[slide][2] }} />
          </div>
          <div className="wl-tx">
            <p className="eyebrow">{t('d_slideN', { n: slide + 1, m: 3 })}</p>
            <h2>{t(slide === 0 ? 'onb1t' : slide === 1 ? 'onb2t' : 'onb3t')}</h2>
            <p>{t(slide === 0 ? 'onb1b' : slide === 1 ? 'onb2b' : 'onb3b')}</p>
          </div>
        </div>
      ) : (
        <form className="wl-b" id="wlform" onSubmit={finish}>
          <h2>{t('tellUs')}</h2>
          <p className="note"><Ic n="bulb" s={18} /><span>{t('tellUsWhy')} {t('d_optional')}</span></p>
          <div className="form" style={{ marginTop: 18 }}>
            <label className="fl full">{t('yourName')}<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></label>
            <label className="fl">{t('stateL')}
              <select value={st} onChange={(e) => setSt(e.target.value)}>{STATES.map((x) => <option key={x.en} value={x.en}>{L(x)}</option>)}</select>
            </label>
            <label className="fl">{t('dob')}<input className="num" type="date" value={dob} max="2010-12-31" onChange={(e) => setDob(e.target.value)} /></label>
            <div className="fl full" role="group" aria-label={t('cardType')}>{t('cardType')}
              <div className="seg wl-card">{CARDS.map((k) => <button key={k} type="button" aria-pressed={card === k} onClick={() => setCard(k)}>{k === 'None' ? t('none') : k}</button>)}</div>
            </div>
          </div>
        </form>
      )}
      <div className="wl-foot">
        {dots}
        <span style={{ flex: 1 }} />
        {step !== 'lang' ? <button key="back" type="button" className="btn ghost" onClick={() => setStep(step === 0 ? 'lang' : step === 'about' ? 2 : ((step as number) - 1) as Step)}><Ic n="chevL" s={18} />{t('back')}</button>
          : <button key="skip" type="button" className="btn ghost" onClick={skip}>{t('skipIntro')}</button>}
        {step === 'about'
          ? <button key="finish" className="btn pri" type="submit" form="wlform">{t('finish')}<Ic n="check" s={18} sw={2.4} /></button>
          : <button key="next" type="button" className="btn pri" onClick={() => setStep(step === 'lang' ? 0 : step === 2 ? 'about' : ((step as number) + 1) as Step)}>{step === 2 ? t('getStarted') : t('next')}<Ic n="chevR" s={18} /></button>}
      </div>
    </Modal>
  );
}
