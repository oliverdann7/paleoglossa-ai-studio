# Launch Playbook — from "shipped" to "paid" (2026-09-04)

Source of the method: a 2026 solo-founder video ("How I build apps solo that
actually make money") whose playbook is four steps — copy a validated idea tied
to a real pain point, ship on a JavaScript stack, harden before users arrive,
then win on distribution with short-form UGC and small paid boosts. This
document maps each step onto Paleoglossa as it stands at HEAD `75fc987`, lists
what is still missing to launch and market it, and doubles as the backlog for
when the engineering items are picked up. **It changes no code.**

Companion docs: `app-audit-2026-07.md` (open engineering highs, all still open),
`product-audit-2026-06.md` (scores; monetization 4/10), `PALEOGLOSSA_ROADMAP.md`
§ 11 Phase 4 (growth items 4.4–4.6, un-started), `STORE_SUBMISSION_HANDOFF.md`.

---

## 1. The playbook in one page

| Video step | What the video says | Paleoglossa today | Verdict |
|---|---|---|---|
| 1. Idea | Copy a validated idea tied to a real pain point; originality is dead; you only need a slice of the market | Reading Greek/Hebrew/Latin for seminary and classics students is a pain point people already pay for (LingQ, Biblingo, Legentibus, Ancient Language Institute). Eleven languages, 94 served full texts, FSRS review, AI tutor. | **Done** |
| 2. Stack | JS end to end, Next.js on Vercel, Supabase, Clerk/Firebase auth, Stripe, AI coding tools | Vite + React 19 SPA, Express 5 API on Vercel, Firebase Auth + Firestore, Stripe live-mode with hardened webhook, PostHog + Sentry, Capacitor iOS/Android, store listings and release checks in-repo. Not migrating to Next.js: the SPA is shipped and wrapped natively. | **Done** |
| 3. Hardening | Rate-limit login/signup/AI; real auth; row-level DB security; no secrets client-side; Redis caching; async heavy jobs; load test | Firestore rules deny-by-default with server-field guards; no secrets in the bundle; Stripe webhook idempotent. But the rate limiter is per-instance memory, anonymous callers can spend Gemini/TTS money, 11 of 16 Gemini routes are unmetered, quota fails open, no timeouts, no `storage.rules`, no load test, e2e is manual-only. | **Partial** — § 3 |
| 4. Distribution | UGC shorts copied from niche winners; $30–50 micro-influencer shorts; faceless slideshows; boost winners on TikTok/Meta while ROI holds; CTA to the app | Landing, pricing, legal, onboarding, demo, funnel analytics all exist. Nothing to share, nothing indexable (the whole corpus is behind auth), no per-route SEO, no UTM capture, no referral, no drip email, and a logged-out "Choose plan" click on `/pricing` shows a raw auth error. | **Missing** — § 4, 5, 7–10 |

The one non-negotiable before any marketing spend: close the AI cost hole (§ 3.1).
A short that works will send anonymous traffic straight at unmetered Gemini and
Google TTS routes.

Where this document disagrees with the video, on purpose:

- **Do not skip Android.** The video says Android purchasing power is irrelevant.
  Paleoglossa's audience is pastors, seminarians and Bible-college students, a
  large share of them in Brazil, Africa, Turkey and Eastern Europe where Android
  dominates. The Android build already exists (`android/`, `npm run android:bundle`).
- **Shorts are top-of-funnel, not the whole funnel.** Copying viral TikTok formats
  fits a calorie app. For a philology tool, professors, seminary newsletters,
  Reddit and the classics forums convert better per hour spent (§ 9). Do both;
  weight the second.
- **Ten paying users before a 30-day calendar.** The paywall triggers at 25 saved
  words per language and the trial is off. Nobody has yet watched a real Greek
  student hit that wall. Put the demo in front of ten students first (§ 10, week 0).

---

## 2. Positioning and pain point

**Who pays**

| Segment | Pain | Trigger moment |
|---|---|---|
| Seminary / divinity students | Greek and Hebrew exams; translation homework; losing the language the semester after the course ends | Exam season; first exegesis paper |
| Classics undergraduates and grad students | Reading load in Homer, Plato, Vergil, Cicero far beyond the textbook | Start of a reading course; thesis text |
| Pastors and priests | "I took Greek in seminary and lost it" | Sermon prep on a hard passage |
| Autodidacts and homeschool families | Want to read the real texts, not a phrasebook app | New year; a book or podcast that lit the fuse |

**One-line promise.** Read the ancient world word by word: real texts, every word
tappable, your vocabulary remembered, an AI philologist on call.

**Competitor table (prices approximate at time of writing; verify before quoting publicly)**

| Product | Model | Where Paleoglossa wins | Where it loses |
|---|---|---|---|
| LingQ | ~$13/mo, modern-language focus | Ancient-language morphology, scholarly apparatus, FSRS, 11 languages | Content volume in modern languages; brand |
| Biblingo | Subscription, Biblical Greek/Hebrew | Reading real texts from day one; Latin, Syriac, Coptic and more; price | Structured video curriculum; church partnerships |
| Legentibus | Low-cost subscription, Latin audio readers | Multi-language; word-level morphology and SRS; AI tutor | Narrated audio depth in Latin |
| Ancient Language Institute | Live courses, hundreds of dollars per course | Self-paced, 10–50× cheaper, always available | Live instruction and accountability |
| Duolingo (Latin) | Freemium | Real texts, adult tone, no gamified guilt | Habit engine, brand, budget |

Pricing stays at Free / $6 / $10 / $15 per month (`src/lib/constants/plans.ts:80-133`).
Recommend turning the trial on (§ 4.4).

**Keep the brand constraints from `product-audit-2026-06.md` § 6.** No mascot, no
guilt-trip copy, no hearts or gems, no demotion leagues, no drills gating the
reader, no paywalled lookups. Marketing copy inherits the same adult, scholarly
voice: the reader is a serious adult, and the product treats them as one.

---

## 3. Launch-blocking engineering gaps (video step 3)

Every claim below was verified against the working tree on 2026-09-04. Effort:
S ≤ half a day, M ≤ 2 days, L > 2 days.

### 3.1 Cost control (do first)

| # | Gap | Evidence | Fix | Effort |
|---|---|---|---|---|
| 1 | Anonymous callers are never charged quota | `api/_routes/ai.ts:110-111` `if (!uid) return true;` inside `chargeAiQuota`; every AI route mounts `optionalAuth` | Return 401 `AUTH_REQUIRED` when no uid. Zero user impact: the client already refuses to call these routes without a token (`src/lib/services/apiFetch.ts:59-63`). Switch AI and TTS routes to `requireAuth` (`api/_lib/auth.ts`). | S |
| 2 | 11 of 16 Gemini routes bill nothing | Only `analyze` (159), `ocr` (292), `translate` (396), `explain` (497), `tutor` (1100, 1204) charge. Unmetered: `pronunciation` (637), `scrape` (740), `metadata` (794), `quiz` (891), `syntax` (976), `sentence-analysis` (1394), `course-quiz` (1507), `historical-context` (1581), `semantic-context` (1689), `concept-summary` (1778, also no auth middleware), `apparatus-notes` (1846) | Call `chargeAiQuota` in each; add auth to `concept-summary`. Skip the charge when the request carries a client `x-gemini-api-key` (BYO key), fixing the `ai.ts:159` subtlety where BYO users are billed against the server quota. | S |
| 3 | Quota fails open | `api/_lib/aiUsage.ts:127-131` (no Admin DB → allow) and `:172-175` (any error → allow) | Fail closed in production (`allowed:false`, 503 `QUOTA_UNAVAILABLE`); keep fail-open only when `NODE_ENV !== 'production'`. Update `api/__tests__/aiUsage.test.ts`. | S |
| 4 | TTS sits under the loose 120/min bucket | `api/_routes/audio.ts:80` route; limiter mounts at `api/index.ts:88-99` | Mount `aiRateLimit` on `/api/audio/tts`. | S |
| 5 | 10 MB file parsing is under the general bucket and optional-auth | `api/_routes/parse.ts:14,33-35` | Mount `importRateLimit`; require auth. | S |
| 6 | Anyone can write to the shared lexical cache | `api/_routes/lexicon.ts:44` `POST /api/lexical-cache` has no middleware | Add `requireAuth`. Also have `/api/ai/explain` (`ai.ts:438`) consult `api/_lib/lexicalCache.ts` server-side before calling Gemini, so a client that skips the lookup cannot force a paid call. | S |

### 3.2 Distributed rate limiting (the video's "rate-limit your AI endpoints")

| # | Gap | Evidence | Fix | Effort |
|---|---|---|---|---|
| 7 | Limiter is an in-process `Map`; each Vercel instance enforces its own window and a cold start resets it | `api/_lib/rateLimiter.ts:4-8` (documented in its own header), `:55` | Add `@upstash/redis` + `@upstash/ratelimit`; new `api/_lib/redis.ts` reading `UPSTASH_REDIS_REST_URL/TOKEN` (and the Vercel Marketplace aliases `KV_REST_API_URL/TOKEN`), `null` when unset. Rewrite `rateLimiter()` to use `Ratelimit.slidingWindow` with `ephemeralCache` when Redis is present, fall back to the current `Map` otherwise. Keep the exported names and headers so `api/index.ts` and `api/__tests__/rateLimiter.test.ts` are untouched. Prefer `x-real-ip` over the first `x-forwarded-for` hop. Add a `billingRateLimit` (10/min) on `/api/stripe`. | M |
| 8 | Login/signup are not what `authRateLimit` protects | Sign-in/up go straight to Firebase from the client (`src/pages/auth/SignUp.tsx:65`, `src/lib/services/authService.ts`); `/api/auth/*` is only `me` + `welcome-email` | Enable Firebase Auth abuse protection in the console (email enumeration protection, reCAPTCHA for password sign-in, App Check for the web app). No repo change beyond documenting the console settings. | S (external) |

### 3.3 Timeouts and function config

| # | Gap | Evidence | Fix | Effort |
|---|---|---|---|---|
| 9 | No `maxDuration`, memory or crons | `vercel.json` has no `functions` block | `"functions": { "api/index.ts": { "maxDuration": 60, "memory": 1024 } }` | S |
| 10 | No timeout on any Gemini or TTS call; no client fetch timeout | 15 `generateContent` sites in `ai.ts`; `audio.ts:171`; `apiFetch.ts:72` | `api/_lib/withTimeout.ts` (AbortController, 45 s, 504 `UPSTREAM_TIMEOUT`); `timeoutMs` option in `apiFetch` (30 s, surfaced as 408 so existing error UIs show retry instead of an infinite spinner). | M |

### 3.4 Storage rules (the video's "row-level security", second half)

| # | Gap | Evidence | Fix | Effort |
|---|---|---|---|---|
| 11 | Firebase Storage is used but no `storage.rules` exists and `firebase.json` has no `storage` block | Avatar upload at `src/lib/services/profileService.ts:70-71`; no `storage.rules` at repo root | Add `storage.rules` (owner-only write under `avatars/{uid}/`, image content-type, ≤ 2 MB; public read) and the `storage` block; deploy with `firebase deploy --only storage`. | S |

### 3.5 Caching (the video's "cache with Redis")

| # | Gap | Evidence | Fix | Effort |
|---|---|---|---|---|
| 12 | TTS cache is per-instance and dies on cold start, and hits skip quota, so a cold start re-bills requests that were free a minute ago | `api/_routes/audio.ts:16-27,127,143` | Redis `GET/SETEX` keyed `tts:{lang}:{mode}:{hash(text)}`, 30-day TTL, same `Map` fallback. | S |
| 13 | No HTTP caching on deterministic GET routes; every CDN hit is a lambda invocation | No `Cache-Control` anywhere in `api/` | `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` on `/api/corpus*`, `/api/dictionary*`, `/api/lemmas*`, `/api/paradigms*`, `/api/lexicon-lookup*`. | S |

### 3.6 Async jobs, load test, CI

| # | Gap | Evidence | Fix | Effort |
|---|---|---|---|---|
| 14 | Welcome email blocks the signup response | `api/_routes/auth.ts:21` awaits Resend | `waitUntil` from `@vercel/functions`. | S |
| 15 | No job queue for AI/PDF/OCR | Everything runs inside the request handler | **Deferred on purpose.** At launch scale, #9 + #10 cover it. Revisit when p95 on `/api/ai/analyze` exceeds 20 s or PDF imports over 50 pages become common. | — |
| 16 | No load test | No k6/artillery/autocannon anywhere | `scripts/loadtest/api.mjs` with `autocannon` (devDependency): `/api/health`, `/api/corpus`, a dictionary lookup, and an authed `/api/ai/explain` at 50 concurrent for 30 s; `npm run loadtest`. Document expected p99 and confirm 429s appear at the configured limits with no 5xx. | S |
| 17 | e2e is manual-only; deploy does not wait for CI | `.github/workflows/e2e.yml:2-3` `workflow_dispatch`; `deploy.yml:11` `needs: []` | Add the Playwright job (chromium, demo mode, existing 12 specs) to `ci.yml`; gate deploy on CI for the same commit; keep the post-deploy health probe. | S |
| 18 | `firestore.indexes.json` is not deployed by CI | `STORE_SUBMISSION_HANDOFF.md` top note; the `tokenAnnotations` index was missing in production | `firebase deploy --only firestore:indexes --project paleoglossa-reader` after every index change (checklist § 6). | S (external) |

---

## 4. Conversion fixes (things that lose a paying visitor today)

| # | Gap | Evidence | Fix | Effort |
|---|---|---|---|---|
| 4.1 | Logged-out visitor on `/pricing` clicks "Choose plan" and sees "Authentication required. Sign in or enable demo mode." in a red box | `src/pages/Subscription.tsx:66-86` calls `createCheckoutSession` → `apiFetch` throws `AuthRequiredError`; `/pricing` is public (`src/App.tsx:186`); the Landing pricing grid sends paid clicks straight here (`src/pages/Landing.tsx:372`) | If there is no `auth.currentUser`, navigate to `/auth/signup?next=/pricing&plan=<id>&cycle=<cycle>`; honor `next` in SignUp/SignIn; on return with `plan` in the query, auto-start checkout once. Fire `CHECKOUT_STARTED` only when checkout actually starts. | S |
| 4.2 | Two dead links in the More screen | `src/pages/More.tsx:112-114` links Community and Challenges unconditionally; the routes are flag-gated (`App.tsx:243-248`) and bounce to `/` | Wrap in `features.isCommunityEnabled()` like Syntax at `More.tsx:90`. | S |
| 4.3 | The paywall moment is not instrumented | The 25-word cap toast fires in `Reader.tsx` (four sites) but no event is sent | Add `VOCAB_LIMIT_BLOCKED` to `ANALYTICS_EVENTS` (`src/lib/analytics.ts:6-30`) and fire it from `useVocabLimit`. Roadmap 4.6. | S |
| 4.4 | Trial is off | `TRIAL_DAYS = 14` (`plans.ts:56`) is only used in the dev fallback; checkout reads `STRIPE_TRIAL_DAYS` and defaults to 0 (`api/_routes/billing.ts:112-116`) | Set `STRIPE_TRIAL_DAYS=7` on Vercel. Show "7-day free trial" on the Landing and `/pricing` cards only when a matching `VITE_TRIAL_DAYS` is set, so copy and Stripe never disagree. | S |

---

## 5. Growth surface to build (what the UGC call-to-action points at)

| # | What | Why | How | Effort |
|---|---|---|---|---|
| 5.1 | Per-route SEO meta + JSON-LD | Every route serves the same `index.html` head; no structured data anywhere | `src/lib/hooks/usePageMeta.ts` (no new dependency): sets title, description, canonical, OG/Twitter tags and an optional JSON-LD node, restores defaults on unmount. Apply to Landing (`SoftwareApplication` + `Offer` from `PLANS`), `/pricing`, `/support` (`FAQPage`), legal pages, and the text pages below. | S |
| 5.2 | Public, indexable text preview pages | The corpus is the SEO asset and it is invisible: `/app/*` is behind `AuthGuard`. Ancient-language queries are low-competition, high-intent (roadmap 4.4) | `/texts` (index by language) and `/texts/:textId` (read-only first section, title, author, licence, translation column when present) fed by the already-public `/corpus-data/index.json` and `/corpus-data/<id>.json` (`src/lib/services/corpusService.ts:60-90`). No auth, no Firestore, no `src/data/corpus.ts` import. Sticky CTA: "Read this with morphology, glosses and spaced repetition" → demo (reuse `Landing.tsx:168-180`) or signup with `?next=/app/reader/<id>`. `scripts/generate-sitemap.ts` as `prebuild` emits `public/sitemap.xml` from the 6 static URLs plus all 94 text ids. | M |
| 5.3 | Shareable review-completion card | The video's whole engine needs a shareable artifact; the colophon screen (`src/pages/Review.tsx:741-800`) has none | Canvas-rendered PNG at 1080×1920 and 1200×630 in the parchment theme: language name in its own script, "N cards · X% · duration", streak, `paleoglossa.com`. **Never** corpus text or user notes (privacy rules in `observability.md`). `navigator.share({files})` where available (Capacitor via `@capacitor/share`, already a dependency), else download. Also on the `KNOWN_WORD_MILESTONE` moment. Link carries `?utm_source=share&utm_medium=card`. Events `SHARE_CARD_OPENED`, `SHARE_COMPLETED`. | M |
| 5.4 | First-touch attribution | No `utm_*` handling anywhere; boosts cannot be measured | `src/lib/attribution.ts`: on boot read `utm_*`, `ref`, `document.referrer`; persist first touch in localStorage; attach as traits in `identifyAnalytics` (`src/contexts/AuthContext.tsx:52-95`) and as props on `SIGNUP_COMPLETED` / `CHECKOUT_STARTED`. | S |
| 5.5 | Landing proof, honestly | No screenshots of the real app, no FAQ. There are no testimonials yet, so none are shown | "See it in action" strip from the six branded panels already rendered in `store/screenshots/` (reader, tutor, review, library, audio, languages); an 8-question FAQ (languages, free tier, what the demo saves, AI limits, cancel/refund, mobile apps, sources and licences, who it is for) with `FAQPage` JSON-LD; footer links to `/texts` and env-driven social handles. Add testimonials only when real users give them. | S |
| 5.6 | Referral codes | Roadmap 4.5 | After 5.3 and 5.4 are live and there are paying users to refer. Not a launch blocker. | M (later) |

---

## 6. Pre-launch external checklist (things the code cannot do)

- [ ] **Upstash Redis** via Vercel Marketplace; set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or the `KV_REST_API_*` aliases) on Vercel. Required by § 3.2 and § 3.5.
- [ ] **`STRIPE_TRIAL_DAYS=7`** and `VITE_TRIAL_DAYS=7` on Vercel (§ 4.4).
- [ ] **`firebase deploy --only firestore:indexes,storage --project paleoglossa-reader`** after § 3.4 lands, and after every index change (§ 3.6 #18).
- [ ] **Firebase Auth abuse protection** in the console: email-enumeration protection, reCAPTCHA on password sign-in, App Check (§ 3.2 #8).
- [ ] **External uptime monitor** on `https://paleoglossa.com/api/health` (any free monitor; alert to email/phone). Today only the post-deploy probe checks it.
- [ ] **Sentry alert rule**: any new issue in `api/*` or more than N client errors per hour → email.
- [ ] **PostHog funnel dashboard**: `signup_completed` → `onboarding_completed` → `first_word_saved` → `checkout_started` → `checkout_completed`, plus `vocab_limit_blocked` once § 4.3 ships. Break down by first-touch UTM (§ 5.4).
- [ ] **Google Search Console**: verify `paleoglossa.com`, submit `sitemap.xml` (regenerated by § 5.2). Watch for soft-404s on `/texts/*`; if they appear, prerendering is the follow-up.
- [ ] **Run `npm run loadtest`** against production once (§ 3.6 #16) and record p99 in `app-audit`.
- [ ] **App Store / Play** per `STORE_SUBMISSION_HANDOFF.md` (`npm run release:check` is 20/20 repo-local; external items are enrolment, keystore, screenshots).
- [ ] **Social handles** registered (TikTok, Instagram, YouTube, X) and set as `VITE_SOCIAL_*` once § 5.5 ships.

---

## 7. UGC engine (video step 4, the core)

**7.1 Niche research (one afternoon, repeat monthly).**
Search TikTok, Instagram Reels and YouTube Shorts for: `biblical greek`, `koine greek`,
`learn hebrew bible`, `latin reading`, `classics student`, `seminary life`,
`greek exegesis`, `ancient greek pronunciation`, `homer greek`, `vulgate latin`.
Hashtags: `#biblicalgreek #koinegreek #biblicalhebrew #latin #classics #seminary
#exegesis #ancientgreek #learnlatin #philology`. For each of the top 20 videos by
views in the last 90 days, log: creator, hook (first 2 seconds), format (talking
head / screen recording / slideshow / text-on-screen), length, CTA, views, and
what emotion it sells (relief, pride, curiosity, fear of failing). The winners
cluster into four or five formats. Those are the formats to re-cut.

**7.2 Ten hook scripts (original, Paleoglossa voice).** Each is 20–40 seconds,
screen-recorded in the reader, captioned, CTA in the last 3 seconds.

1. "John 1:1 in Greek, one word at a time." Tap each word, show the gloss appear. CTA: read it yourself, free.
2. "You took Greek in seminary. You lost it. Here's the 10-minute-a-day way back." Reader → review card.
3. "Every Latin student meets this word in Caesar and panics." Tap it, show the paradigm table.
4. "The Hebrew Bible has 8,000 distinct words. You need 1,000 to read Genesis." Show the known-word counter climbing.
5. "This is what spaced repetition looks like for a dead language." Review session, colophon screen, share card.
6. "Read the Iliad's first line the way a philologist does." Tap μῆνιν, show morphology, hear restored pronunciation.
7. "Pastor prepping a sermon on Romans 8? Do this before you open the commentary." Reader with parallel translation toggle.
8. "Eleven ancient languages. One reader." Fast cut through the language picker, native scripts.
9. "The Lord's Prayer in Syriac. Yes, you can read it." Peshitta text, tap, gloss.
10. "Ask a philologist why this word is in the dative." AI tutor answering in scholar mode.

**7.3 Faceless slideshow template (no face on camera).**
Six frames, 3 seconds each: (1) the pain in one line ("Greek exam in 3 weeks");
(2) a real verse in the reader, untouched; (3) one word tapped, gloss shown;
(4) the review card; (5) the counter or streak; (6) logo + "paleoglossa.com,
free to start". Use the parchment theme and the product fonts; export from the
same pipeline as `store/screenshots/generate.mjs` so every asset matches.

**7.4 Micro-influencer outreach (1k–10k followers, classics / Bible-study creators).**
Budget $30–50 per short, 5 creators in month one. Message template:

> Hi <name>, I build Paleoglossa, a word-by-word reader for Ancient Greek, Hebrew
> and Latin. Your <video> is exactly the audience it's for. Would you make one
> 30-second short showing yourself reading <a verse they'd pick> in it? Flat $40,
> you keep full creative control, the only ask is the link in the caption. Free
> Full Pack for a year either way. Here's a 2-minute demo: <link>.

Tracking sheet columns: creator, platform, followers, date sent, reply, price,
post date, post URL, UTM link, views at 7 days, signups (PostHog by UTM), cost
per signup.

**7.5 What a good short looks like (checklist before posting).**
Hook in the first 2 seconds with the text on screen. One idea only. Real
product, no mockups. Captions on. A verse the audience recognises. The CTA is a
link with UTMs, never "link in bio" alone. Post natively on each platform, not
cross-posted with another platform's watermark. Three per week, same days.

---

## 8. Paid boosting rules

1. Boost only a post that already earned organic traction (top quartile of your own posts in the first 48 hours).
2. $30–50 per boost on TikTok Ads (Promote) and Meta (Boost), targeted at 18–45, interests: Bible study, seminary, classics, Latin, Greek, theology.
3. Every boosted link carries `utm_source=<platform>&utm_medium=paid&utm_campaign=<hook-id>`.
4. Keep boosting while `signups × free-to-paid rate × (monthly price × expected months) > spend`. Until you have your own numbers, use 3% free-to-paid and 6 months as placeholders and replace them the moment PostHog shows real ones.
5. Two rounds without lift → stop that creative. Do not raise the budget on a loser.
6. Never boost before § 3.1 is deployed.

---

## 9. Launch-week channels beyond shorts (where this niche actually lives)

| Channel | What to post | Notes |
|---|---|---|
| Product Hunt | "Read Ancient Greek, Hebrew and Latin word by word, with an AI philologist" | Prepare 6 screenshots (already rendered), a 60-second video, and a first-comment origin story. |
| r/AncientGreek, r/latin, r/Koine, r/biblicalhebrew, r/Reformed, r/Catholicism, seminary subreddits | Value-first: "Here is John 1 with every word parsed, free, no signup" linking a `/texts/*` page | Read each sub's self-promotion rule first. Lead with the public text page, not the landing page. |
| Textkit, B-Greek forums | A thread on how the morphology and lexicon pipeline works, ask for corrections | This audience will find errors; treat that as free QA and reply to every one. |
| Seminary and classics departments | Email to Greek/Hebrew/Latin instructors: free Duo plan for the term, Courses feature for the classroom (`src/pages/Courses.tsx`, teacher claims exist) | One professor is worth a hundred boosted views. |
| Podcasts and YouTube channels in biblical languages | Offer a walkthrough episode | Long-form converts this audience better than shorts. |
| Newsletter / email | Not built. Welcome email exists (`api/_lib/email.ts`); drip and digest (roadmap 3.8) need a Vercel cron | Follow-up, not launch-blocking. |

---

## 10. 30-day calendar and KPIs

Week 0 (before spend): § 3.1 deployed; ten students or pastors given the demo
and watched (screen-share or in person); notes on where they stop. Adjust the
trial and the 25-word cap copy from what you see.

| Week | Ship | Post | Depends on |
|---|---|---|---|
| 1 | § 3.1, § 4.1–4.4, § 5.4 | 3 shorts (hooks 1, 2, 8), 1 long-form walkthrough, Textkit/B-Greek thread | Trial on, attribution live |
| 2 | § 3.2–3.5, § 5.1, § 5.5 | 3 shorts (hooks 3, 4, 6), Reddit value posts linking `/texts/*` once live, 5 influencer outreach messages | Redis, SEO meta, landing proof |
| 3 | § 5.2, § 5.3 | 3 shorts (hooks 5, 7, 9) using the share card, Product Hunt launch, professor emails | Public text pages, share card |
| 4 | § 3.6, boosts start | 3 shorts (hook 10 + two re-cuts of the best performer), first two boosts at $40 each | Load test done, CI green |

Weekly KPIs (from PostHog; set targets after week 1's baseline):

| KPI | Event / source | Week 1 baseline → week 4 goal |
|---|---|---|
| Views | Platform analytics | record → 3× |
| Signups | `signup_completed` | record → 3× |
| Activation | `first_word_saved` ÷ signups | ≥ 40% |
| Paywall reached | `vocab_limit_blocked` (§ 4.3) | track |
| Checkouts | `checkout_started` → `checkout_completed` | first 10 paying users by day 30 |
| Cost per signup (paid) | spend ÷ signups by UTM | < $3 |

---

## 11. Suggested implementation order (one branch, six commits)

1. § 3.1 items 1–6 and § 4.2 — pure risk removal, no new infrastructure.
2. § 3.2 #7 and § 3.5 — Upstash with in-memory fallback so dev and CI are unaffected.
3. § 3.3 and § 3.4, § 3.6 #14, #16, #17.
4. § 4.1, § 4.3, § 4.4 (UI half), § 5.1, § 5.4.
5. § 5.2, § 5.3, § 5.5.
6. Update `CLAUDE.md` (Phase 8 "rate limiting on all routes" checkbox corrected, new env vars) and `PALEOGLOSSA_ROADMAP.md` § 11 Phase 4 statuses.

Verification for every commit: `npm run type-check && npm run lint && npm test
&& npm run build`; new tests for the rate limiter (shared counter, fallback),
quota fail-closed, anonymous 401 on `explain`, attribution capture, page meta
cleanup, share-card renderer (no corpus text in output), sitemap generator
(every index id present); `npm run e2e` with a new `public-texts` spec and a
logged-out `/pricing` → `/auth/signup` assertion; `npm run release:check` still
20/20.
