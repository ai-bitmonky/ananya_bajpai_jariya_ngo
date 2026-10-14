'use client';
/* Bottom sheet: scrim + sheet rising from the bottom, drag the handle/header down to dismiss,
   Escape or scrim closes. Portalled into the app frame so it covers the tab bar too. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { D, buzz, useM } from './ctx';

export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const m = useM();
  const [mounted, setMounted] = useState(open);
  const sheet = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const { sheetCount } = m;

  if (open && !mounted) setMounted(true);

  // count open sheets (stage inert, Escape handling)
  useEffect(() => {
    if (!open) return;
    sheetCount(1);
    return () => sheetCount(-1);
  }, [open, sheetCount]);

  // enter / exit animation
  useLayoutEffect(() => {
    const sh = sheet.current, sc = scrim.current;
    if (!mounted || !sh || !sc) return;
    if (open) {
      sh.getAnimations().forEach((a) => a.cancel());
      sh.style.transform = 'none';
      sh.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: D(520), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
      sc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D(280), fill: 'both' });
      const f = window.setTimeout(() => sh.focus({ preventScroll: true }), 30);
      buzz();
      return () => clearTimeout(f);
    }
    const cur = getComputedStyle(sh).transform;
    sh.getAnimations().forEach((a) => a.cancel());
    const a = sh.animate([{ transform: cur === 'none' ? 'none' : cur }, { transform: 'translateY(100%)' }], { duration: D(300), easing: 'cubic-bezier(.4,0,1,1)', fill: 'both' });
    sc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(280), fill: 'both' });
    let alive = true;
    a.finished.then(() => { if (alive) setMounted(false); }).catch(() => {});
    return () => { alive = false; };
  }, [open, mounted]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); closeRef.current(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [open]);

  // drag down to dismiss (from the handle or header)
  useEffect(() => {
    const sh = sheet.current;
    if (!sh || !open) return;
    let y0: number | null = null, dy = 0, t0 = 0;
    const start = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.grab,.sheet-h') || (e.target as HTMLElement).closest('button')) return;
      y0 = e.clientY; dy = 0; t0 = Date.now();
      sh.getAnimations().forEach((a) => a.finish());
      sh.getAnimations().forEach((a) => a.cancel());
      sh.style.transition = 'none';
      try { sh.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    const move = (e: PointerEvent) => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = `translateY(${dy}px)`; };
    const end = () => {
      if (y0 == null) return;
      y0 = null; sh.style.transition = '';
      const fast = dy / Math.max(1, Date.now() - t0) > 0.6;
      if (dy > sh.offsetHeight * 0.28 || (fast && dy > 30)) { closeRef.current(); return; }
      const a = sh.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: D(300), easing: 'cubic-bezier(.16,1,.3,1)' });
      sh.style.transform = 'none';
      void a;
    };
    sh.addEventListener('pointerdown', start);
    sh.addEventListener('pointermove', move);
    sh.addEventListener('pointerup', end);
    sh.addEventListener('pointercancel', end);
    return () => { sh.removeEventListener('pointerdown', start); sh.removeEventListener('pointermove', move); sh.removeEventListener('pointerup', end); sh.removeEventListener('pointercancel', end); };
  }, [open, mounted]);

  if (!mounted || !m.host) return null;
  return createPortal(
    <div className={`zm-sheets ${open ? 'open' : ''}`}>
      <div ref={scrim} className="scrim" style={{ opacity: 1 }} onClick={() => onClose()} />
      <div ref={sheet} className="sheet" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} style={{ transform: 'none' }}>
        <div className="grab" aria-hidden="true"><i /></div>
        {children}
      </div>
    </div>,
    m.host,
  );
}
