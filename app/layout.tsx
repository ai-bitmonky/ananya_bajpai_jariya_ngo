import type { Metadata, Viewport } from 'next';
import './fonts.css';
import './tokens.css';
import './globals.css';


export const metadata: Metadata = {
  title: { default: 'Zariya · ज़रिया', template: '%s · Zariya' },
  description: 'Learn a skill in your language, find government and NGO schemes you qualify for, and find flexible work close to home.',
  applicationName: 'Zariya',
  appleWebApp: { capable: true, title: 'Zariya', statusBarStyle: 'black-translucent' },
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7B1E2E' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1113' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
