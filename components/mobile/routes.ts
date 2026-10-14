/* Maps a URL (lib/nav.tsx scheme) to a mobile screen. `key` identifies the screen instance:
   two paths with the same key (e.g. /work/ku and /work/ku/apply, or a query change) update the
   same screen in place; a different key is a different screen in the stack. */
import { ZARIYA } from '@/lib/data';

export type Kind = 'home' | 'courses' | 'course' | 'lesson' | 'cert' | 'schemes' | 'scheme' | 'work' | 'job' | 'success' | 'profile' | 'info' | 'welcome';

export interface Match {
  kind: Kind;
  key: string;
  /** a bottom-tab root (tab bar visible) */
  root: boolean;
  /** screen starts with the maroon band (status-bar colour) */
  band: boolean;
  /** where Back goes when there is nothing behind this screen (deep link) */
  parent: string;
  id?: string;
  n?: number;
  step?: 'lang' | 'intro' | 'about';
}

const hasCourse = (id?: string) => !!id && ZARIYA.courses.some((c) => c.id === id);
const hasScheme = (id?: string) => !!id && ZARIYA.schemes.some((s) => s.id === id);
const hasJob = (id?: string) => !!id && ZARIYA.work.some((w) => w.id === id);

export function match(path: string): Match {
  const u = new URL(path, 'http://x');
  const seg = u.pathname.split('/').filter(Boolean);
  const [a, b, c, d] = seg;
  const home: Match = { kind: 'home', key: 'home', root: true, band: true, parent: '/' };
  if (!a || a === 'notifications') return home;
  if (a === 'courses') {
    if (!b) return { kind: 'courses', key: 'courses', root: true, band: false, parent: '/' };
    if (!hasCourse(b)) return { kind: 'courses', key: 'courses', root: true, band: false, parent: '/' };
    if (c === 'lesson') {
      const course = ZARIYA.courses.find((x) => x.id === b)!;
      const n = Math.min(Math.max(1, parseInt(d || '1', 10) || 1), course.lessons);
      return { kind: 'lesson', key: `lesson:${b}:${n}`, root: false, band: true, parent: `/courses/${b}`, id: b, n };
    }
    if (c === 'certificate') return { kind: 'cert', key: `cert:${b}`, root: false, band: false, parent: `/courses/${b}`, id: b };
    return { kind: 'course', key: `course:${b}`, root: false, band: false, parent: '/courses', id: b };
  }
  if (a === 'schemes') {
    if (b && hasScheme(b)) return { kind: 'scheme', key: `scheme:${b}`, root: false, band: false, parent: '/schemes', id: b };
    return { kind: 'schemes', key: 'schemes', root: true, band: false, parent: '/' };
  }
  if (a === 'work') {
    if (b && hasJob(b)) {
      if (c === 'applied') return { kind: 'success', key: `success:${b}`, root: false, band: false, parent: `/work/${b}`, id: b };
      return { kind: 'job', key: `job:${b}`, root: false, band: false, parent: '/work', id: b };
    }
    return { kind: 'work', key: 'work', root: true, band: false, parent: '/' };
  }
  if (a === 'profile') {
    if (b === 'edit') return { kind: 'info', key: 'info', root: false, band: false, parent: '/profile' };
    return { kind: 'profile', key: 'profile', root: false, band: true, parent: '/' };
  }
  if (a === 'welcome') {
    const st = u.searchParams.get('step');
    const step = st === 'intro' || st === 'about' ? st : 'lang';
    const parent = step === 'about' ? '/welcome?step=intro' : step === 'intro' ? '/welcome' : '/';
    return { kind: 'welcome', key: `welcome:${step}`, root: false, band: false, parent, step };
  }
  return home;
}

export const TABS = [
  { k: 'home', path: '/', icon: 'home', label: 'home' },
  { k: 'courses', path: '/courses', icon: 'courses', label: 'courses' },
  { k: 'schemes', path: '/schemes', icon: 'schemes', label: 'schemes' },
  { k: 'work', path: '/work', icon: 'work', label: 'work' },
] as const;
