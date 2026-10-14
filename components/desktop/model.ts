'use client';
/* Desktop view-model: everything the prototype kept in `S` that is derived from the shared
   persistent store (lib/store.tsx) — certificates, applications, documents-I-have, week data. */
import { useEffect, useMemo, useState } from 'react';
import { ZARIYA, course, scheme, type Course, type Lesson } from '@/lib/data';
import { useZ } from '@/lib/store';

export const U = ZARIYA.user;

export interface Cert { cid?: string; sid?: string; no: string; date: Date }
export interface Application { job: string; date: Date; st: 'stShort' | 'stReview' | 'stSent' }

/** Real today at noon (stable for date maths). The desktop app renders only after hydration. */
export function today() { const d = new Date(); d.setHours(12, 0, 0, 0); return d; }
export const todayIdx = () => (today().getDay() + 6) % 7;
export function nextThursday() { const d = today(); d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7)); return d; }

export const curriculum = (c: Course): (Lesson & { t: Lesson['t'] | null })[] =>
  c.curriculum || Array.from({ length: c.lessons }, (_, i) => ({ n: i + 1, t: null as unknown as Lesson['t'], d: Math.round(c.mins / c.lessons) }));

const SEED_STATUS: Record<string, Application['st']> = { pottery: 'stShort', jain: 'stReview' };

export function useIsDark() {
  const { s } = useZ();
  const [sys, setSys] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const f = () => setSys(mq.matches); f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return s.theme === 'system' ? sys : s.theme === 'dark';
}

export function useDesk() {
  const z = useZ();
  const { s, L, t, doneN, isComplete, nextLesson } = z;

  return useMemo(() => {
    const now = today();
    const tIdx = todayIdx();
    const weekArr = U.weeklyMinutes.map((v, i) => (i < tIdx ? v : i === tIdx ? s.minutesToday : 0));
    const weekTotal = weekArr.reduce((a, b) => a + b, 0);

    const certs: Cert[] = [];
    const craft = course('craft');
    if (isComplete(craft)) certs.push({ cid: 'craft', no: 'ZR-2026-00388', date: new Date(2026, 7, 21) });
    certs.push({ sid: 'disha', no: 'ZR-2026-00291', date: new Date(2026, 5, 4) });
    let k = 412;
    for (const c of ZARIYA.courses) if (c.id !== 'craft' && isComplete(c)) certs.push({ cid: c.id, no: 'ZR-2026-00' + k++, date: now });
    const certOf = (cid: string): Cert => certs.find((x) => x.cid === cid) || { cid, no: 'ZR-2026-00412', date: now };
    const certTitle = (x: Cert) => (x.cid ? L(course(x.cid).title) : L(scheme(x.sid!).name));
    const certBy = (x: Cert) => (x.cid ? L(course(x.cid).by) : L(scheme(x.sid!).tag));

    const entries = Object.entries(s.applied).filter(([id]) => ZARIYA.work.some((w) => w.id === id));
    const fresh = entries.filter(([id]) => !SEED_STATUS[id]).sort((a, b) => b[1].localeCompare(a[1]));
    const seeds = ['pottery', 'jain'].filter((id) => s.applied[id]).map((id) => [id, s.applied[id]] as [string, string]);
    const applications: Application[] = [...fresh, ...seeds].map(([id, iso]) => ({ job: id, date: new Date(iso), st: SEED_STATUS[id] || 'stSent' }));

    const have = (en: string) => Object.entries(s.docs).some(([sid, m]) => { const sc = ZARIYA.schemes.find((x) => x.id === sid); return !!sc && sc.docs.some((d, i) => d.en === en && m[i]); });

    const curN = (c: Course) => nextLesson(c) ?? c.lessons;
    const cState = (c: Course) => (isComplete(c) ? 'completed' : doneN(c) > 0 ? 'ongoing' : 'new') as 'completed' | 'ongoing' | 'new';
    const lessonTitle = (c: Course, l: { n: number; t: Lesson['t'] | null }) => (l.t ? L(l.t) : `${L(c.title)} · ${t('lesson')} ${l.n}`);
    const lstate = (c: Course, n: number) => ((s.done[c.id] || []).includes(n) ? 'done' : n === nextLesson(c) ? 'cur' : 'locked') as 'done' | 'cur' | 'locked';
    const fmtDate = (d: Date, o?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(z.lang === 'hi' ? 'hi-IN' : 'en-IN', o || { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    const village = s.profile.village || L(U.village);
    const district = s.profile.district || L(U.district);
    const stateName = (() => { const st = s.profile.state || 'Haryana'; const f = [U.state, { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' }, { en: 'Rajasthan', hi: 'राजस्थान' }, { en: 'Punjab', hi: 'पंजाब' }, { en: 'Bihar', hi: 'बिहार' }, { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' }, { en: 'Delhi', hi: 'दिल्ली' }].find((x) => x.en === st); return f ? L(f) : st; })();

    return { now, tIdx, weekArr, weekTotal, certs, certOf, certTitle, certBy, applications, have, curN, cState, lessonTitle, lstate, fmtDate, village, district, stateName, matchCount: ZARIYA.schemes.filter((x) => x.forMe).length };
  }, [s, L, t, doneN, isComplete, nextLesson, z.lang]);
}
