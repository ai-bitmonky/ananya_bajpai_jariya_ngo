# Zariya · ज़रिया

Learn a skill in your language, find government and NGO schemes you qualify for, and find flexible work close to home. Built from Ananya Bajpai's UX case study for rural women in India.

**Two layouts, one app.** Screens 1024px and wider get the desktop web app; phones and smaller screens get a native-feeling mobile app (stacked screens, swipe-back, bottom tabs, bottom sheets). The layout re-checks live on resize or rotation and keeps your place. Add `?view=mobile` or `?view=desktop` to any URL to force one.

**No login.** Everything works as a guest. Progress, saved courses, document checklists and applications are kept in the browser (localStorage). The intro at `/welcome` is optional.

**English + हिन्दी**, light and dark themes, larger-text mode.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Requires Node 18.18+.

## Deploy

Import this repository in Vercel (framework preset: Next.js, no environment variables needed). Every push to `main` redeploys through the Vercel GitHub app.

## Structure

| Path | What |
|---|---|
| `app/[[...slug]]/page.tsx` | Single catch-all route; picks the first layout from the user agent |
| `components/ResponsiveApp.tsx` | Live switch between mobile (<1024px) and desktop (≥1024px) |
| `components/mobile/` | Phone app shell and screens (CSS scoped under `.zm`) |
| `components/desktop/` | Desktop app shell and views (CSS scoped under `.zd`) |
| `lib/data.ts`, `lib/strings*.ts` | All content and UI strings in English and Hindi |
| `lib/store.tsx` | Saved state shared by both layouts |
| `lib/nav.tsx` | URL scheme and client router (`/courses/sewing`, `/schemes/pmkvy`, `/work/ku` …) |
| `app/tokens.css` | Design tokens (light + dark) |
| `reference/` | The approved HTML prototypes and design spec this app was ported from |
