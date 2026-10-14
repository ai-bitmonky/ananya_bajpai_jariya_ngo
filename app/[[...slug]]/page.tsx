import { headers } from 'next/headers';
import ResponsiveApp from '@/components/ResponsiveApp';

/* Every path renders the same app shell; the client router (lib/nav.tsx) reads the URL.
   The user-agent gives a first guess of phone vs laptop so the right layout is in the
   server HTML; the client then confirms by actual screen width (see ResponsiveApp). */
export default async function Page({ params, searchParams }: { params: Promise<{ slug?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const ua = (await headers()).get('user-agent') || '';
  const isPhoneUA = /Android.+Mobile|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile Safari/i.test(ua) && !/iPad|Tablet/i.test(ua);
  const qs = new URLSearchParams();
  for (const k in sp) { const v = sp[k]; if (typeof v === 'string') qs.set(k, v); }
  const path = '/' + (slug || []).map(encodeURIComponent).join('/') + (qs.toString() ? '?' + qs.toString() : '');
  return <ResponsiveApp initialLayout={isPhoneUA ? 'mobile' : 'desktop'} initialPath={path} />;
}
