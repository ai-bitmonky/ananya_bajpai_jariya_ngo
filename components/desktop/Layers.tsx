'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { ZARIYA } from '@/lib/data';
import { useZ } from '@/lib/store';
import { useNav, href } from '@/lib/nav';
import { Ic, Qr, Seal, Tick, BRAND, useToast } from './ui';
import { useDesk, type Cert } from './model';

/** Focus the element marked data-autofocus inside a layer when it opens, and restore focus on close. */
export function useLayerFocus(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current?.querySelector<HTMLElement>('[data-autofocus]');
    el?.focus({ preventScroll: true });
    return () => { try { prev?.focus({ preventScroll: true }); } catch {} };
  }, [open]);
  return ref;
}

export function CertCard({ x }: { x: Cert }) {
  const { t, userName } = useZ();
  const D = useDesk();
  return (
    <div className="cert">
      <span className="wm wordmark wordmark--outline" aria-hidden="true">{BRAND}</span>
      <div className="cert-top"><span className="wordmark cert-brand">{BRAND}<small>{ZARIYA.i18n.appName.en.toUpperCase()}</small></span><span className="seal"><Seal s={64} /></span></div>
      <h2>{t('certTitle')}</h2><div className="rule" />
      <p className="nm">{userName()}</p>
      <p className="bd">{t('certBody')}</p>
      <p className="cn">{D.certTitle(x)}</p><p className="cb">{D.certBy(x)}</p>
      <div className="cert-foot">
        <div><div className="k">{t('certIssued')}</div><div className="v num">{D.fmtDate(x.date, { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
        <div style={{ textAlign: 'center' }}><div className="k">{t('certId')}</div><div className="v num">{x.no}</div></div>
        <div className="r"><Qr seed={x.no} size={64} /></div>
      </div>
      <p className="ver"><Tick s={12} />{t('verified')}</p>
    </div>
  );
}

export function Modal({ label, onClose, children, className = '' }: { label: string; onClose: () => void; children: ReactNode; className?: string }) {
  const { t } = useZ();
  const ref = useLayerFocus(true);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div ref={ref} className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label}>
        <button className="ibtn x" aria-label={t('close')} data-autofocus onClick={onClose}><Ic n="x" s={22} /></button>
        {children}
      </div>
    </>
  );
}

export function CertModal({ x, onClose }: { x: Cert; onClose: () => void }) {
  const { t } = useZ();
  const { push } = useNav();
  const toast = useToast();
  return (
    <Modal label={t('certificate')} onClose={onClose}>
      <p className="eyebrow" style={{ margin: '0 0 14px 4px' }}>{t('certificate')}</p>
      <CertCard x={x} />
      <div className="cert-a">
        <button className="btn pri" onClick={() => toast(t('shareOpen'), false)}><Ic n="whatsapp" s={18} />{t('shareWhatsApp')}</button>
        <button className="btn ghost" onClick={() => toast(t('downloaded'))}><Ic n="download" s={18} />{t('download')}</button>
        {x.cid ? <button className="btn sec" onClick={() => push(href('/work', { skill: x.cid }))}><Ic n="work" s={18} />{t('applyJobs')}</button> : null}
      </div>
    </Modal>
  );
}
