'use client';
/* 1.4 s splash (first load of a session only; tap to skip): maroon band, three drifting rows of the
   outlined wordmark, the solid wordmark + tagline, a thin progress hairline. */
import { useEffect, useRef } from 'react';
import { useZ } from '@/lib/store';
import { ZARIYA } from '@/lib/data';
import { D } from '../ctx';
import { WM } from '../content';

export function Splash({ leaving, onDone, onGone }: { leaving: boolean; onDone: () => void; onGone: () => void }) {
  const { t } = useZ();
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tm = window.setTimeout(onDone, 1400);
    return () => clearTimeout(tm);
  }, [onDone]);
  useEffect(() => {
    if (!leaving || !el.current) return;
    const a = el.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(220), easing: 'ease-out', fill: 'both' });
    a.finished.then(onGone).catch(() => {});
  }, [leaving, onGone]);
  return (
    <div ref={el} className="band zm-splash">
      <button className="splash" aria-label={`${t('appName')} · ${t('tagline')}`} onClick={onDone}>
        <div className="spl-rows" aria-hidden="true">
          {[0, 1, 2].map((i) => <p key={i} className="wordmark wordmark--outline">{WM} {WM} {WM}</p>)}
        </div>
        <div className="spl-c">
          <p className="wordmark spl-wm">{WM}</p>
          <p className="spl-latin">{ZARIYA.i18n.appName.en}</p>
          <p className="spl-tag">{t('tagline')}</p>
        </div>
        <span className="spl-line" aria-hidden="true"><i /></span>
      </button>
    </div>
  );
}
