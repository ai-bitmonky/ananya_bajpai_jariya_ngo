# Porting the Zariya prototypes to the Next.js app

The two approved, pixel-reviewed prototypes are in this folder:

- `reference/prototype-mobile.html` — the phone app (17 screens). Source of truth for mobile look, copy and behaviour.
- `reference/prototype-desktop.html` — the desktop web app (6 views). Source of truth for desktop.
- `reference/DESIGN-SPEC.md` — the original design spec both were built from.

Goal: a production Next.js 15 (App Router, TypeScript strict, React 19) app that looks and behaves **the same as the prototypes** (same CSS, same layout, same motion), but written as real React components on the shared infrastructure below. Do not redesign. Do not simplify. Every screen, state, sheet, toast, animation and interaction in the prototype must exist in the port.

## What already exists (do not rewrite; extend only if you must, and say so)

| File | Purpose |
|---|---|
| `app/tokens.css`, `app/fonts.css`, `app/globals.css` | Design tokens (light + dark), self-hosted Baloo 2 + Mukta, base. Imported globally. |
| `lib/data.ts` | `ZARIYA` content (courses, schemes, work, friends, notifications, i18n) with types `Course`, `Scheme`, `Job`, `Friend`, `Bi`, helpers `course(id)`, `scheme(id)`, `job(id)`. |
| `lib/strings.ts` | `EXTRA` — the extra strings the prototypes added (already merged from both). Keys with `d_` prefix are desktop wording where mobile and desktop differed. If you need a new string, add it to `lib/strings.mobile.ts` or `lib/strings.desktop.ts` (create; export `const M_EXTRA`/`D_EXTRA`) and tell the lead; do **not** edit `lib/strings.ts` (the other agent shares it). Then merge it in your own component via a small local `tx()` wrapper, or ask the lead to wire it into the store. |
| `lib/store.tsx` | `useZ()` → `{ s, set, t, L, tl, lang, userName, doneN, pct, isComplete, nextLesson, hydrated, reset }`. Persistent shared state: lang, theme, bigText, readAloud, introSeen, profile, saved, done (lesson numbers), applied (jobId → ISO date), invited, docs (schemeId → idx → bool), offline, minutesToday, unread, reminder, posts. `set(d => { ... })` mutates a clone. `<Icon d=… />` stroke icon component. |
| `lib/nav.tsx` | `useNav()` → `{ route, push, replace, back, depth, dir }`. URL scheme documented at top of the file — use exactly those paths. Browser back works. `href(path, query)` helper. |
| `components/ResponsiveApp.tsx` | Chooses `<MobileApp/>` (<1024px) or `<DesktopApp/>` (≥1024px) live; `?view=mobile|desktop` forces one. |
| `components/mobile/MobileApp.tsx`, `components/desktop/DesktopApp.tsx` | Placeholders — **replace these**. |

Persistent product state lives in `useZ().s` (both layouts share it, so a course saved on desktop is saved on mobile). Purely visual state (current tab inside a screen, open sheet, player position, drawer) is local React state or URL query.

## Rules

1. **No login. No OTP. Nothing gates the app.** The app opens straight to Home with the sample learner Ananya (editable in Profile). Every feature works for a guest. The prototype's onboarding (language → slides → phone/OTP → personal info) becomes the **optional** `/welcome` flow: language picker → 3 intro slides → "About you" (name, state, ration card, DOB — all optional, prefilled). Remove the phone/OTP steps entirely. Offer it as: a dismissible "Personalise Zariya" card on Home (mobile + desktop) when `!s.introSeen`, and a "Language & intro" row in Profile. Skip/Done set `introSeen = true`. Mobile may still show the 1.4 s splash on the very first load of a session (tap to skip), then Home.
2. **CSS**: move the prototype's `<style>` into a co-located plain CSS file (`components/mobile/mobile.css` / `components/desktop/desktop.css`) imported once by the root component. Scope every rule under a root class (`.zm` for mobile, `.zd` for desktop) so the two never collide when both bundles have loaded (layout switch on resize). Don't duplicate token definitions — they are global.
3. **Strings**: never hard-code text; `t('key')`, `L(obj)`, `tl('days')`. Language toggle re-renders everything instantly.
4. **Components**: split into sensible files (shell, one file per screen/view, shared bits like `Art`, `Mark`, `Avatar`, `ProgressBar`, `Sheet`, `Toast`, `Player`, `Certificate`). Client components (`'use client'`). No external UI libraries; no new npm dependencies.
5. **Icons**: port the prototype's icon path map to `components/<layout>/icons.ts`.
6. **Dates**: "today" is the real today. Week chart = Mon..Sun, past days from `ZARIYA.user.weeklyMinutes`, today = `s.minutesToday`, future days empty. SHG meeting = next Thursday. Certificates issued date: today for newly completed courses.
7. **Types**: TypeScript strict must pass (`npx tsc --noEmit`). No `any` unless unavoidable.
8. **Accessibility**: as in the prototype — buttons are buttons, aria-current on nav, aria-pressed on toggles, dialogs with role="dialog" aria-modal and Escape to close, focus visible, reduced motion respected, ≥48px targets on mobile.
9. **Hydration**: the first render must match the server (use `s` defaults; things that depend on `window`, dates, or localStorage happen in effects or after `hydrated`). No hydration warnings in the console.
10. **Milestones**: commit nothing (the lead commits), but save files as you go, screen by screen, and print `MILESTONE: …` after each. Run `npx tsc --noEmit` frequently.

## Verify before you report

- `npx next build` succeeds (the lead may be building at the same time; if `.next` is locked, wait and retry, or use `npx tsc --noEmit` plus `npx next dev -p <your port>`).
- Mobile agent: dev server on port 3101; desktop agent: port 3102. Playwright is at `/opt/npm-tools/node_modules/playwright` (`require` that absolute path; Chromium is preinstalled; never run `playwright install`). Mobile viewport 390×844 + 360×780, `isMobile`, `hasTouch`; desktop 1440×900 + 1024×768.
- Screenshot every screen/view (EN; HI for main ones; one dark) into `shots/mobile/` or `shots/desktop/` and **compare side by side with the prototype at the same size** (open the prototype file with `file://` in the same script). Fix every difference you can see. Read the PNGs with the Read tool.
- Zero console errors / hydration warnings (ignore font 404s only if any), no horizontal overflow.
- Test the flows: course → lesson → complete → certificate; scheme docs checklist persists after reload; apply for a job → applied state everywhere and survives reload; language toggle; dark mode; `/welcome` optional flow; deep links (`/courses/sewing`, `/schemes/pmkvy`, `/work/ku`) render directly on load; browser back.
