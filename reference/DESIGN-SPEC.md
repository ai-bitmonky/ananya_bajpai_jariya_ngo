# ZARIYA ज़रिया — Prototype Build Spec

Source: Ananya Bajpai's UX case study (17 pp). Product: a learn → qualify → earn app for rural Indian women
(personas Hemlata 35 tailor, Rekha 30 MA-English homemaker with twins, Soniya 37 self-taught tailor).
Bottom-nav IA from the case study: **Home · My Courses · Schemes · Work**, with **Profile** off the avatar.
User flow: Splash → Language → Phone+OTP → Personal info → Home → Courses → Course detail → Lesson video → Certificate → Apply for work.

Deliverables (all self-contained, no external images; fonts only from Google Fonts; no other external requests):

| File | What | Viewport |
|---|---|---|
| `/home/claude/zariya/mobile.html` | The native-feeling phone app. Full HTML document (own doctype/head). | 360–430 px wide, 100% height |
| `/home/claude/zariya/desktop.html` | The desktop web app. Full HTML document. | ≥1024 px; degrade gracefully to 768 |
| `/home/claude/zariya/index.html` | Hub page for the published artifact (built by the lead, not the agents) | any |

Shared sources to **inline verbatim** (copy the contents into a `<style>` and a `<script>`; do not link them):
`/home/claude/zariya/shared/tokens.css` and `/home/claude/zariya/shared/data.js`. Change neither; extend only by adding keys in your own file if truly needed (and prefer not to).

## 1. Non-negotiables (both files)

1. **No English literals in templates.** Every string comes from `t('key')` or `L(obj)`. The language toggle (EN ⇄ HI) re-renders the whole UI instantly, including course/scheme names and the Devanagari-first wordmark.
2. **Theme:** tokens already define light + dark via `prefers-color-scheme` and `[data-theme]`. Style only through tokens. No `#fff`, `#000`, grey literals.
3. **No images.** Course/work art = CSS gradient from `art[0]→art[1]` at 135°, overlaid with the `--buta` block-print tile at low alpha, plus the stroked `icon` path in `--accent-fg` at ~34% opacity bottom-right and the course title bottom-left. Avatars = initials on a `hue` disc. Partner/scheme marks = a rounded square in `scheme.hue` with the `short` text in Baloo 2.
4. **Typography:** headings `--font-display` (Baloo 2 700/800), body `--font-body` (Mukta). Numbers get `.num` (tabular). Devanagari renders in the same families; verify Hindi headings don't clip (Baloo 2 Devanagari has tall ascenders — give headings `line-height:1.25` when `LANG==='hi'` via `html[lang=hi] h1,h2,h3{line-height:1.25}`).
5. **Accessibility:** every control is a `<button>` or `<a>` with an accessible name; touch targets ≥ 48 px on mobile; visible focus (`--focus`); `aria-pressed` on toggles; `aria-current` on nav; `role="dialog" aria-modal` on sheets; respects `prefers-reduced-motion` (tokens already zero durations).
6. **Realistic at rest:** the app opens into a filled, believable state (Ananya, Haryana, 6-lesson progress, 6-day streak). No empty shells. No lorem ipsum.
7. **Performance:** one file each, < 400 KB, no libraries except none. Pure HTML/CSS/JS. Keep DOM renders cheap (string templates + `innerHTML` per screen is fine).
8. **Zero console errors**, no horizontal scroll at any width, nothing overflows its card.
9. **Milestone saves:** write the file early with the shell + Home working, then append screens one by one, saving after each. Never hold the whole file in memory until the end.
10. Keep the lead informed: at each milestone print one line `MILESTONE: <what works now>`.

## 2. Visual identity (why these choices)

- **Maroon as the single bold colour.** Tabs, primary buttons, the brand band. Everything else is warm cream, blush and ink. Semantic colours (leaf = eligible/success, gold = certificate/match, alert = urgency) never compete with the accent.
- **Signature motif:** the outlined Devanagari wordmark **ज़रिया** at large size, low opacity, bleeding off the edge of the brand band on Home, the splash, the certificate and the desktop sidebar foot (`.wordmark--outline`). Exactly like the case-study cover.
- **Block-print texture** (`--buta`) on maroon bands only, never on cream.
- **Shape language:** cards `--r-lg`, sheets `--r-xl` top corners, chips `--r-pill`, thumbnails `--r-md`. Rounded, soft, never sharp.
- **Motion** (from the Headspace/M3 research): screens arrive with `--ease-arrive` 560 ms (translateX 100%→0 + fade for push; translateY for sheets), press = `scale(.97)` 160 ms, success moment = scale 1.02 overshoot then settle (no confetti), progress fills animate on mount. One orchestrated moment per screen, not scattered effects.
- **Low-literacy rules** (Microsoft Research text-free UI + the case study's "prefer local language", "voice"): every nav item and every primary action has an icon + label; a mic on every search; "Listen" (🔊-style speaker icon) on scheme and job details that plays a simulated audio progress bar; big numbers for distance/pay; green tick language for eligibility; never more than 5 primary choices on a screen.

## 3. MOBILE — `mobile.html`

### 3.1 App shell
- `html,body{height:100%;overflow:hidden}`; `#app{height:100%;display:flex;flex-direction:column;max-width:480px;margin:0 auto;background:var(--bg);position:relative}`. On wide screens show it centred at 420 px with a maroon-tinted page background behind (so the full-screen link also looks intentional on desktop).
- `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">`, `<meta name="theme-color" content="#7B1E2E">`, `apple-mobile-web-app-capable`.
- Safe areas: tab bar `padding-bottom:calc(10px + env(safe-area-inset-bottom))`; top bars `padding-top:calc(8px + env(safe-area-inset-top))`.
- **Navigation model:** 4 tab roots + a stack. `go(screen, params)` pushes; `back()` pops with reverse animation. Tabs switch without animation (crossfade 160 ms). Keep a `history` array; wire `popstate` so the browser/phone back button pops the stack. **Edge-swipe back:** touchstart within 24 px of left edge → follow finger (translateX), release > 35% → pop.
- Tab bar: 4 items, icon 24 + label 11 px, active = maroon with a small pill behind the icon (M3 style), inactive = `--fg-3`. Haptic: `navigator.vibrate?.(8)` on tab change and primary actions.
- Top app bar per screen: 56 px; left = back chevron or avatar; title; right = language chip (`EN`/`हिं` toggle) + bell with green dot when unread.
- Bottom sheets: scrim + sheet (`--r-xl` top, drag handle 36×4, `--sh-up`); drag down to dismiss; Escape/scrim closes. Used for: language picker, work filters, apply confirm, lesson options, notifications.
- Toasts: bottom, above tab bar, 2.4 s, slide-up.
- First paint: a 500 ms skeleton shimmer on Home cards, then content (feels like data loading).

### 3.2 Screens (in stack order of the flow)
1. **Splash** (1.4 s, auto-advance; skippable by tap): maroon full-bleed with buta texture; outlined ज़रिया repeated as 3 rows (like the cover), the solid wordmark centred with tagline; a thin progress hairline. Then → Language if `localStorage.zariya_onboarded` not set, else → Home.
2. **Language picker:** grid of 12 language cards (native script large, English name small). EN and HI are live; others show a `langSoon` chip and still select visually but keep LANG. `Next`.
3. **Onboarding carousel (3 slides):** `onb1..3` with a large abstract illustration built from CSS/SVG (sewing machine, scheme document with tick, map pin + house) in the course-art style. Dots, Skip, Next → Get started.
4. **Phone + OTP:** `+91` prefix, numeric keypad input; `sendOtp` → OTP screen with 4 boxes auto-advancing; any 4 digits verify; `otpHelp` line. Includes `Continue with Google` as secondary (visual only).
5. **Personal info:** name (prefilled Ananya), state select, ration-card segmented control (AAY / BPL / APL / None), DOB. `finish` → Home, set onboarded flag. Explain `tellUsWhy`.
6. **Home:**
   - Brand band (maroon, buta, outlined wordmark bleeding right): avatar, `hello, Ananya`, `welcome`; search pill with mic (tap mic → "Listening…" state with 3 animated bars for 1.8 s then fills query "सिलाई" / "sewing" and opens Courses filtered).
   - **Continue learning** hero card: sewing art thumb, title, "Lesson 7 · Blouse", progress bar 6/10 with animated fill, `Continue` button; small streak chip "🔥 6-day streak" (use an SVG flame, not emoji) and today 38/60 min ring.
   - **Schemes for you** strip: "3 schemes match you" with the 3 `forMe` central ones as horizontally scrolling mini cards (scheme mark + short + tag + leaf tick).
   - **Popular near you**: horizontal scroll of course art cards (16:11), title, by, learners.
   - **Work near you**: 2 compact rows (title, role, km, pay, friends-work-here chip), `See all`.
   - **Coming up**: SHG meeting row.
7. **My Courses:** title bar, search, segmented tabs All/Ongoing/Completed/Saved (sliding indicator), list of course rows: thumb 72×72, title, by, progress bar + `%`, chevron; heart toggle on thumb (saved). Completed rows show a gold certificate badge instead of the bar.
8. **Course detail:** hero art 16:10 with back/heart overlaid, title, by-line, meta chips (lessons · mins · level · rating ★), tabs About / Lessons / Invite / Discussion:
   - About: blurb, `whatYouLearn` bullets (derive 4 from curriculum), instructor row, `downloadOffline` button → progress → `savedOffline`.
   - Lessons: numbered rows (`01`..) with duration; done = leaf tick; current = maroon ring + `Resume`; locked ones dimmed but tappable. Tap → Lesson.
   - Invite: search + friends list with `+` → becomes `Invited` tick + toast `inviteSent`.
   - Discussion: 3 short messages from Hemlata/Rekha/instructor with avatars; input bar.
   - Sticky bottom CTA: `Resume · Lesson 7`.
9. **Lesson player:** 16:9 player area (dark gradient art + buta), big play, ±10 s, scrubber with timeline (07:00 / 20:00), speed 1×/1.25×/1.5×, subtitles toggle (HI/EN), download. Play → progress advances in real time (fast-forward 1 s = 20 s video so a demo completes in ~1 min); at 100% show `lessonDone` moment (overshoot animation, leaf tick) + `nextLesson`. Below: lesson title, 3-step "what to do" checklist with tick boxes, `markDone` button. If it is the last lesson of a 100% course → `getCertificate`.
10. **Certificate:** a designed certificate card (cream paper, maroon double rule, gold seal SVG, outlined ज़रिया watermark, `certTitle`, name, course, issued date, cert no. `ZR-2026-00412`, QR-like SVG grid), `verified` line, buttons `shareWhatsApp`, `download`, then `applyJobs` → Work filtered by skill.
11. **Schemes:** profile summary card (avatar, name, age/gender/state/education, `bplQualified` leaf tick, `edit`); tabs `All` / `For me` (For me shows count badge); filter chips Central / State / NGO; rows: scheme mark, name, tag, leaf "You qualify" pill when `forMe`, deadline chip when present.
12. **Scheme detail:** mark + name + type chip; `listen` button (speaker icon → simulated 10 s audio bar "Playing in Hindi…"); `whyMatch` as green tick chips from `match`; `benefits`; `documents` checklist with `haveDoc` toggles (persist in state); `howToApply` numbered stepper; `nearest` row with map-pin and km; sticky CTA `applyScheme` + secondary `askHelp` → toast `helpScheduled`.
13. **Work:** header `companiesHiring`, filter chips (`filterAll/Near/Wfh/Part/Govt`) in a sheet via filter icon too; cards: art header 16:9 with title overlaid, role, meta row (pay · hours · km), `need`/`seatsLeft` (alert colour when urgent), friends chip with stacked avatars, `applyNow`.
14. **Job detail:** art, title, role, 4 meta tiles (Pay, Hours, Distance, Type), friends who work here (avatars), what you will do (3 bullets derived from role), `listen`, sticky `applyNow`.
15. **Apply sheet → Success:** sheet shows autofilled details (name, phone, skills, certificates) with `autofill` note, `send`. Success screen: large leaf tick with overshoot, `appliedTitle`, "<company> `appliedBody`", `exploreMore` carousel of 2 other jobs, `backHome`. The job then shows `applied` state everywhere.
16. **Profile:** maroon header with buta + big avatar + name + phone + edit pencil; stats row (minutes this week, streak, certificates); `weeklyLearning` mini bar chart (7 bars from `weeklyMinutes`, today highlighted, max 60 baseline); `mySkills` chips; list: Notifications, Language, Trusted helper (`proxyNote`), Certificates, Applications, Settings (dark mode switch toggling `data-theme`, larger text switch adding `html.big` → 17.5 px base), Log out.
17. **Notifications sheet:** 3 items with kind icons, timestamps.

### 3.3 Native-feel checklist (must all be true)
- No visible scrollbars inside the app (`scrollbar-width:none` + webkit rule) · momentum scroll (`-webkit-overflow-scrolling:touch`) · `overscroll-behavior:contain` · text not selectable on chrome (`user-select:none` on nav/bars, selectable in content) · no 300 ms delay (`touch-action:manipulation`) · active press states on every tappable · screens slide, sheets rise · tab bar persists across tab roots, hides on pushed detail screens (slides down) · status-bar colour meta · keyboard doesn't break layout (use `100%` heights, not `100vh`).

## 4. DESKTOP — `desktop.html`

### 4.1 Shell
- Grid: left sidebar 264 px (collapses to 72 px icon rail < 1200 px) · main column · optional right rail 320 px on Home.
- **Sidebar:** solid wordmark ज़रिया + "Zariya" small, nav (Home, My Courses, Schemes, Work, Profile) with icon + label, active = blush-pale pill with maroon text; bottom: language segmented EN/हिं, dark-mode switch, the outlined wordmark bleeding off the bottom-left at 120 px.
- **Top bar:** page title + breadcrumb, global search with mic (same listening behaviour), bell, avatar menu.
- Routing: hash-free in-memory router (`view`, `params`), with `history.pushState` so browser back works; views crossfade 200 ms + 8 px rise.
- Hover: cards rise 4 px (`--sh-2`), buttons darken to `--maroon-deep`; keyboard focus ring everywhere.

### 4.2 Views
1. **Home / Dashboard:** greeting row (hello Ananya + date in chosen language + streak chip). Row 1: **Continue learning** wide card (art left, lesson title, progress, Continue) + **Today** ring tile (38/60 min) + **Certificates** tile (2, gold). Row 2: **This week** bar chart (7 days, minutes; today highlighted; follow dataviz skill: one scale, faint baseline, labelled y max 60; theme-token colours) + **Schemes for you** list (3 forMe with leaf tick) . Row 3: **Popular near you** 4-up course grid + **Work near you** 3 rows. Right rail: Notifications (3) + Coming up (SHG) + Friends online (4 avatars with green dots).
2. **My Courses:** toolbar (segmented All/Ongoing/Completed/Saved + search + sort); responsive grid of course cards (art 16:10, title, by, progress or certificate badge, heart). Click → Course detail.
3. **Course detail (master–detail):** left 2/3: hero art banner with title/meta chips; tabs About/Lessons/Discussion; **Lessons** as a two-column list with the **player docked in the right 1/3** (sticky): same player as mobile, plus "Up next" queue. Invite friends lives in a right-rail card. Certificate opens as a centred modal (same certificate design, wider).
4. **Schemes:** left filters (type radios, "For me" switch default ON, documents I have checkboxes), centre list, **right detail pane** (sticky) that fills on click (default pmkvy): why you qualify chips, benefits, documents checklist, how-to-apply stepper, nearest, Listen, CTA buttons. Eligibility profile card at top of the list column with Edit.
5. **Work:** map-free design: filter chips row; 2-column job cards with art header; click → detail drawer sliding from the right (420 px) with apply flow → inline success state in drawer.
6. **Profile:** header band (maroon + buta + outlined wordmark), avatar, name, phone; two-column: left = details form (editable inputs, Save → toast), skills, trusted helper; right = certificates (2 mini certificate cards), applications table (company · role · date · status pill), weekly chart, settings (dark mode, larger text, read-aloud).

### 4.3 Desktop finish
- Max content width 1440, gutters 32. Running text ≤ 68 ch. Tables use tabular nums. Empty states designed (e.g., Saved with none).
- Must look right at 1024, 1280, 1440 and in both themes.

## 5. Verification each agent must do before reporting
Run headless Chromium (Playwright is installed; `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) with a small Node script:
- mobile: viewport 390×844 (and 360×780), deviceScaleFactor 2; screenshot splash, home, courses, course detail, lesson, certificate, schemes, scheme detail, work, job detail, apply success, profile — in EN; then toggle HI and re-shoot home, schemes, scheme detail. Also dark theme home.
- desktop: 1440×900 and 1024×768; shoot every view in EN, Home+Schemes in HI, Home in dark.
- Assert `document.documentElement.scrollWidth <= innerWidth` on every screen, capture `console.error`/`pageerror` and fix all.
- Look at the screenshots yourself (Read tool) and fix anything clipped, overlapping, unreadable, or generic-looking. Save screenshots under `/home/claude/zariya/shots/<mobile|desktop>/`.

## 6. Quality bar
This must read as the work of a top product-design studio: confident type, generous whitespace, one bold colour, real content, satisfying motion, and cultural specificity (Devanagari wordmark, block print, ₹, km, SHG, Aadhaar, didi). If a screen could belong to any generic edtech template, redesign it.
