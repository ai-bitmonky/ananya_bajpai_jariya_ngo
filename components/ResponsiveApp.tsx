'use client';
/* Picks the layout by screen size:
     width >= 1024px  → DesktopApp (laptops, desktops, large landscape tablets)
     width <  1024px  → MobileApp  (phones, small tablets) — a native-feeling app shell
   It re-evaluates live on resize / rotation; state and the current URL are shared, so
   nothing is lost when the layout changes. ?view=mobile or ?view=desktop forces one (for demos). */
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ZProvider } from '@/lib/store';
import { NavProvider } from '@/lib/nav';

export const DESKTOP_MIN = 1024;

const Boot = () => (
  <div className="boot" aria-busy="true"><span className="wordmark">ज़रिया</span></div>
);
const MobileApp = dynamic(() => import('./mobile/MobileApp'), { loading: Boot });
const DesktopApp = dynamic(() => import('./desktop/DesktopApp'), { loading: Boot });

type Layout = 'mobile' | 'desktop';

export default function ResponsiveApp({ initialLayout, initialPath }: { initialLayout: Layout; initialPath: string }) {
  const [layout, setLayout] = useState<Layout>(initialLayout);

  useEffect(() => {
    const forced = new URLSearchParams(location.search).get('view');
    if (forced === 'mobile' || forced === 'desktop') { setLayout(forced); return; }
    const mq = matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const apply = () => setLayout(mq.matches ? 'desktop' : 'mobile');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => { document.documentElement.dataset.layout = layout; }, [layout]);

  return (
    <ZProvider>
      <NavProvider initialPath={initialPath}>
        {layout === 'desktop' ? <DesktopApp /> : <MobileApp />}
      </NavProvider>
    </ZProvider>
  );
}
