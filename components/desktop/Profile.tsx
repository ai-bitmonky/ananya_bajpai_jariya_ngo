'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { course, job } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav } from '@/lib/nav';
import { Art, Av, Ic, Seal, WeekChart, BRAND, useToast } from './ui';
import { U, useDesk, useIsDark, type Cert } from './model';

type F = 'name' | 'phone' | 'village' | 'district';

export default function Profile({ edit, onCert }: { edit: boolean; onCert: (c: Cert) => void }) {
  const z = useZ();
  const { s, set, t, L, userName, reset } = z;
  const { route, push, replace } = useNav();
  const D = useDesk();
  const toast = useToast();
  const dark = useIsDark();
  const [form, setForm] = useState<Partial<Record<F, string>>>({});
  const [helper, setHelper] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const setRef = useRef<HTMLElement>(null);
  const section = route.q.get('section');

  const fval = (k: F) => form[k] ?? (k === 'name' ? userName() : k === 'phone' ? s.profile.phone : k === 'village' ? D.village : D.district);

  useEffect(() => {
    if (edit) { const i = nameRef.current; i?.focus({ preventScroll: true }); i?.select(); i?.scrollIntoView({ block: 'center' }); }
  }, [edit]);
  useEffect(() => {
    if (section === 'settings') setRef.current?.scrollIntoView({ block: 'center' });
  }, [section, route.key]);

  const save = (e?: FormEvent) => {
    e?.preventDefault();
    set((d) => {
      if (form.name != null) { const n = form.name.trim(); d.profile.name = n === L(U.name) || n === U.name.en || n === U.name.hi ? '' : n; }
      if (form.phone != null) d.profile.phone = form.phone;
      if (form.village != null) d.profile.village = form.village === L(U.village) ? '' : form.village;
      if (form.district != null) d.profile.district = form.district === L(U.district) ? '' : form.district;
    });
    setForm({});
    if (edit) replace('/profile');
    toast(t('d_profileSaved'));
  };

  const field = (k: F, label: string, type = 'text', full = false) => (
    <label className={`fl ${full ? 'full' : ''}`}>{label}
      <input ref={k === 'name' ? nameRef : undefined} type={type} value={fval(k)} inputMode={type === 'tel' ? 'tel' : undefined} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
    </label>
  );

  return (
    <>
      <section className="band pf-band" aria-label={t('profile')}>
        <span className="wordmark wordmark--outline" aria-hidden="true">{BRAND}</span>
        <span className="av pf-av" aria-hidden="true">{Array.from(userName())[0]}</span>
        <div>
          <h2>{userName()}<button className="ed" aria-label={t('edit')} onClick={() => { replace('/profile/edit'); const i = nameRef.current; i?.focus(); i?.select(); }}><Ic n="edit" s={18} /></button></h2>
          <div className="meta">
            <span className="num"><Ic n="phone" s={16} />{s.profile.phone}</span>
            <span><Ic n="pin" s={16} />{D.village}, {D.district}, {D.stateName}</span>
            <span><Ic n="check" s={16} sw={2.4} />{t('bplQualified')}</span>
          </div>
        </div>
        <div className="pf-stats">
          <div className="pst"><b className="num">{D.weekTotal}</b><span>{t('d_weekTotal')}</span></div>
          <div className="pst"><b className="num">{U.streakDays}</b><span>{t('dayStreak', { n: '' }).replace(/^[\s-]+/, '')}</span></div>
          <div className="pst"><b className="num">{D.certs.length}</b><span>{t('certificates')}</span></div>
        </div>
      </section>
      <div className="pf">
        <div className="pf-col">
          <section className="card pad" aria-labelledby="pd">
            <div className="card-h"><h2 id="pd">{t('details')}</h2></div>
            <form className="form" autoComplete="off" onSubmit={save}>
              {field('name', t('yourName'), 'text', true)}{field('phone', t('phoneLabel'), 'tel', true)}{field('village', t('village'))}{field('district', t('district'))}
              <label className="fl">{t('stateL')}<input value={D.stateName} readOnly /></label>
              <label className="fl">{t('education')}<input value={L(U.education)} readOnly /></label>
              <button type="submit" hidden />
            </form>
            <div className="form-a"><button className="btn pri" onClick={() => save()}><Ic n="check" s={18} sw={2.4} />{t('saveChanges')}</button></div>
          </section>
          <section className="card pad" aria-labelledby="sk">
            <div className="card-h"><h2 id="sk">{t('mySkills')}</h2></div>
            <div className="skills">
              {U.skills.map((x, i) => <span key={i} className="chip blush"><Ic n="check" s={14} sw={2.6} />{L(x)}</span>)}
              {D.certs.filter((x) => x.cid).map((x) => <span key={x.cid} className="chip gold"><Ic n="award" s={14} />{L(course(x.cid!).title)}</span>)}
            </div>
          </section>
          <section className="card pad" aria-labelledby="th">
            <div className="card-h" style={{ marginBottom: 8 }}><h2 id="th">{t('proxy')}</h2></div>
            <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--fg-2)', maxWidth: '68ch' }}>{t('proxyNote')}</p>
            {helper ? <div className="helper"><Av x={{ hue: '#4E7D5B', initial: 'S' }} /><div><b>{t('helperName')}</b><span>{t('stSent')}</span></div></div> : null}
            <button className="btn sec" style={{ marginTop: 12 }} disabled={helper} onClick={() => { setHelper(true); toast(t('helperReq')); }}><Ic n="users" s={18} />{t('addHelper')}</button>
          </section>
        </div>
        <div className="pf-col">
          <section className="card pad" aria-labelledby="ce">
            <div className="card-h"><h2 id="ce">{t('certificates')}</h2><span className="chip gold num">{D.certs.length}</span></div>
            <div className="mcerts">
              {D.certs.map((x) => (
                <button key={x.no} className="mcert" aria-label={`${t('certificate')}: ${D.certTitle(x)}`} onClick={() => onCert(x)}>
                  <span className="wm wordmark wordmark--outline" aria-hidden="true">{BRAND}</span><span className="seal"><Seal s={34} /></span>
                  <span className="eyebrow">{t('certTitle')}</span><b>{D.certTitle(x)}</b>
                  <span className="no num"><span>{x.no}</span><span>{D.fmtDate(x.date)}</span></span>
                </button>
              ))}
            </div>
          </section>
          <section className="card pad" aria-labelledby="ap">
            <div className="card-h"><h2 id="ap">{t('internships')}</h2><button className="link" onClick={() => push('/work')}>{t('seeAll')}<Ic n="chevR" s={14} /></button></div>
            <table className="tbl">
              <thead><tr><th scope="col">{t('place')}</th><th scope="col">{t('roleL')}</th><th scope="col">{t('dateL')}</th><th scope="col">{t('statusL')}</th></tr></thead>
              <tbody>
                {D.applications.map((a) => { const j = job(a.job); return (
                  <tr key={a.job}><td><span className="co"><Art o={j} />{L(j.title)}</span></td><td className="rl">{L(j.role)}</td><td className="num">{D.fmtDate(a.date, { day: 'numeric', month: 'short' })}</td><td><span className={`st-pill ${a.st}`}>{t(a.st)}</span></td></tr>
                ); })}
              </tbody>
            </table>
          </section>
          <section className="card pad" aria-labelledby="wl">
            <div className="card-h"><div><h2 id="wl">{t('weeklyLearning')}</h2><div className="sub">{t('dailyGoal', { n: U.goalMinutes })}</div></div><div className="wk-sum"><b className="num">{D.weekTotal}</b><span>{t('d_weekTotal')}</span></div></div>
            <WeekChart w={D.weekArr} todayIdx={D.tIdx} />
          </section>
          <section ref={setRef} className="card pad set" id="settings" aria-labelledby="se">
            <div className="card-h" style={{ marginBottom: 6 }}><h2 id="se">{t('settings')}</h2></div>
            <button className="row-switch" role="switch" aria-checked={dark} onClick={() => set((d) => { d.theme = dark ? 'light' : 'dark'; })}><span className="lbl"><Ic n="moon" s={20} />{t('darkMode')}</span><span className="sw" /></button>
            <button className="row-switch" role="switch" aria-checked={s.bigText} onClick={() => set((d) => { d.bigText = !d.bigText; })}><span className="lbl"><Ic n="book" s={20} />{t('textSize')}</span><span className="sw" /></button>
            <button className="row-switch" role="switch" aria-checked={s.readAloud} onClick={() => { const on = !s.readAloud; set((d) => { d.readAloud = on; }); if (on) toast(t('readAloudOn')); }}><span className="lbl"><Ic n="speaker" s={20} />{t('voiceHelp')}</span><span className="sw" /></button>
            <button className="row-switch" onClick={() => push('/welcome')}><span className="lbl"><Ic n="globe" s={20} />{t('d_langIntro')}</span><Ic n="chevR" s={18} /></button>
            <button className="row-switch" onClick={() => { reset(); setForm({}); toast(t('d_resetDone')); }}><span className="lbl"><Ic n="reset" s={20} />{t('d_resetDemo')}</span><Ic n="chevR" s={18} /></button>
          </section>
        </div>
      </div>
    </>
  );
}
