import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zariya · ज़रिया',
    short_name: 'Zariya',
    description: 'Learn a skill, find schemes you qualify for, and find work close to home.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF4EE',
    theme_color: '#7B1E2E',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
