# Paleoglossa Product & Engineering Audit — June 2026

> **Audit date:** 2026-06-10
> **Method:** 8 parallel domain audits (read-only, against source) → adversarial verification of every critical/high finding (refute-by-default, since docs historically run ahead of/behind code) → synthesis.
> **Outcome:** 9 findings confirmed, 8 refuted. Verification suite at audit time: type-check 0 errors, lint 0 errors, 855 tests passing (76 files).
> **Companion plan:** see `PALEOGLOSSA_ROADMAP.md` § 11 ("Make Paleoglossa amazing").

---

## 1. Verdict

**A deep, scholarly product with a broken cash register and a cold front door.**

The reading/SRS core is genuinely LingQ-class — SM-2 + FSRS-5, 6 card types, dual-write review logs, 76 corpus texts with morphology, 855 passing tests. The unique assets (treebanks, manuscripts, reconstructed-pronunciation Audio Lab, research notebooks, AI philology tutor) are already built but gated or buried. What is weak is everything *around* the core: monetization is the lowest-scoring dimension with confirmed revenue-correctness bugs, and the first hour plus the daily-return trigger are far below Duolingo grade.

| Dimension | Score /10 |
|---|---|
| First-run experience & onboarding (Duolingo lens) | 6 |
| Core learning loop: SRS, vocabulary, exercises (LingQ lens) | 7 |
| Reader UX & content depth | 7.2 |
| Engagement, gamification & habit formation | 6 |
| Code health: tests, architecture, duplication | 7.5 |
| Performance, bundle, PWA/offline & iOS readiness | 7 |
| **Monetization, plans, billing & growth** | **4** |
| Security & API hardening | 6 |
| **Weighted overall** | **~6.3** |

### The 3 themes that matter most

1. **The revenue layer is partially broken and must be fixed before any growth work.** The Stripe webhook writes subscription state with the *client* Firebase SDK from a server context (`api/_routes/billing.ts` lines 211, 250–251, 376), which Firestore rules can silently block — paid plans can fail to persist. Import limits are defined per plan but never enforced; AI quota trusts a raw Firestore `currentPlan` field with no subscription validation.
2. **The learning loop is pro-grade, but the first hour and the return trigger are not.** No first-win streak at signup (`src/lib/services/statsService.ts:64`), no day-one micro-lesson, no audio on review cards, and zero native push notifications (`capacitor.config.ts`) — the single biggest habit-formation gap on mobile.
3. **The moat is already in the codebase, gated off.** Syntax treebanks and Manuscripts sit behind `VITE_ENABLE_EXPERIMENTAL` (`src/lib/features.ts`) waiting only for content seeding via the existing ingestion pipelines (`scripts/ingest-corpus-to-firestore.ts`, `scripts/treebank/import-proiel.ts`). Promoting them — plus SEO that currently doesn't exist — is the growth story.

---

## 2. Top confirmed issues (ranked)

All confirmed by adversarial verification unless marked otherwise.

| # | Severity | Issue | Where |
|---|---|---|---|
| 1 | **Critical** | Stripe webhook uses **client** Firebase SDK in a server context; subscription writes can be silently blocked by security rules (the correct Admin-SDK pattern already exists elsewhere in the same file) | `api/_routes/billing.ts:211, 250-251, 376` |
| 2 | High | AI quota grants unlimited access on a raw Firestore `currentPlan` field — no check that `subscriptionStatus === 'active'` or that a Stripe subscription exists | `api/_routes/ai.ts`, `api/_lib/aiUsage.ts` |
| 3 | High | Import limits defined per plan (free: 5, basic: 50, duo: 200) but **enforced nowhere**, client or server | `src/lib/constants/plans.ts`, `src/lib/services/importService.ts`, `src/pages/Import.tsx` |
| 4 | High | Stripe webhook has **zero test coverage** across its 6 event types (only the mappers are tested) | `api/_routes/billing.ts:191-406` |
| 5 | High | **No native push notifications** — Web Notifications API only; no FCM/APNs plugin configured, so backgrounded iOS/Android users are unreachable | `src/lib/services/notificationService.ts`, `capacitor.config.ts` |
| 6 | High | **No audio on review flashcards** despite a working TTS API — `ReviewCard` has no audio field at all | `src/lib/review/reviewCardFactory.ts:15-27`, `src/pages/Review.tsx` |
| 7 | High | **No first-win streak** or visible reward at signup — new users start at streak 0 and the streak chip is hidden until `streak > 0` | `src/lib/services/statsService.ts:64`, `src/lib/hooks/useStats.ts:22`, `src/pages/Dashboard.tsx:283, 336` |
| 8 | Medium (confirmed) | Webhook scans the **entire `users` collection** sequentially instead of querying by `stripeCustomerId`; no `event.id` idempotency, so Stripe retries can double-write | `api/_routes/billing.ts:253-268`, `firestore.indexes.json` |
| 9 | Medium (unrefuted) | AI-cost endpoints not quota-covered: `/api/ai/translate`, `/api/ai/explain`, `/api/ai/ocr`, `/api/audio/tts`; `/api/import/parse` is unauthenticated | `api/_routes/ai.ts`, `api/_routes/parse.ts`, `api/index.ts` |
| 10 | Medium (unrefuted) | **Zero SEO surface**: no meta/OG tags, no robots.txt, no sitemap — the product is invisible to search in a low-competition, high-intent niche | `index.html`, `src/pages/Landing.tsx`, `public/` |
| 11 | Medium (unrefuted) | Demo-mode SRS bypasses SM-2 with naive interval math — trial users don't experience the real algorithm | `src/pages/Review.tsx:276-294` vs `src/lib/srs/sm2.ts` |
| 12 | Medium (unrefuted) | Unbounded Firestore reads on boot (vocabulary, imports, progress loaded with no `limit()`) — slow boot for heavy users, avoidable billing | `src/lib/services/vocabularyService.ts`, `importService.ts`, `statsService.ts` |

---

## 3. Refuted findings — do not re-report

The adversarial verification pass killed these claims. Recorded so future audits and roadmap edits don't resurrect them.

| Claimed finding | Why it's wrong |
|---|---|
| "No placement/diagnostic test" | `KnownWordsStep` (60 frequency-sorted lemmas) + freely switchable Beginner Hub tiers + auto-skip for returning users with prior vocab **is** the placement mechanism, by design. |
| "No multiple-choice/typing exercise variants" (as high severity) | MC exists in `Grammar.tsx` (MorphologyQuiz) and `TCExerciseModal.tsx`; keeping the SRS loop reveal-and-rate is intentional architecture, not a gap. |
| "Only 53 texts; minimal samples per language" | 76 `Text` objects + 200+ extended sections (Gilgamesh ×3 sections, Hammurabi, Gita, …) are wired into `CorpusDB`; the auditor missed the modular `*-extended.ts` files. |
| "Translation coverage incomplete / no parallel grid" | The fallback chain (corpus translation → parallel → lazy AI translation) and the parallel display mode in `ReadingPane.tsx` work as designed. |
| "No email re-engagement" (as a bug) | Accurate observation, but it's an intentional client-push-first architecture, not a defect. (Re-engagement email is still scheduled as deliberate growth work — roadmap 3.8.) |
| "Wildcard CORS is a high-severity vulnerability" | Intentional for Capacitor WebView origins; every sensitive route enforces Bearer-token auth in middleware. Tightening is polish, not a fix. |
| "Stripe webhook missing signature-verification error handling" | Explicit try/catch wraps `constructEvent()` and returns 400 on invalid signature (`billing.ts:199-405`). |
| "Unbounded Firestore offline cache risk" | `persistentLocalCache` is configured (`firebase.ts:51`); realistic vocab sizes are ~1% of the cache limit. A `cacheSizeBytes` cap is optional defensive polish. |

---

## 4. Per-dimension highlights

### Onboarding (6/10)
**Strong:** try-before-signup demo; 4-step personalization (language → level → goal → commitment); cold-start vocab seeding; graded Beginner Hub tiers; streak + daily goal on the dashboard.
**Weak:** no first-win streak at signup; no day-zero micro-lesson guaranteeing a comprehension win; daily goal not tied to the minutes commitment the user actually chose; Beginner Hub poorly discoverable; demo scope not stated on the landing page.

### Learning loop (7/10)
**Strong:** correct SM-2 with bounds and lapse handling; FSRS-5 fully integrated as an alternative backend; 6 card types; dual-write review logs with full audit trail; correct state transitions; retry/backoff write queue; per-concept grammar mastery with decay; session analytics; keyboard shortcuts.
**Weak:** no audio on cards (confirmed); demo SRS diverges from the real algorithm; recognition/production not weighted by word state; review reminders scaffolded but never invoked; no session resume; no SRS-health visibility (interval histogram); SM-2 HARD rating doesn't decay ease distinctly.

### Reader & content (7.2/10)
**Strong:** mature token-tap flow with multi-source lexicon fallback (bundled → Wiktionary → AI); 1,481-line analysis drawer (frequency tiers, paradigms, cognates, notebooks); sentence notes/bookmarks/translations inline; dependency trees; TTS throughout; RTL support; full import pipeline (paste/file/URL/OCR); Firestore ingestion pipeline live with static+Firestore merge.
**Weak:** no phrase/multi-token selection (blocks idiom learning); dictionary not eager-loaded on drawer open; `ParadigmModal` built but unused in the main reader flow; no native (non-TTS) audio assets; A0–A2 rungs missing for the smaller languages.

### Engagement (6/10)
**Strong:** streaks with 2/month freezes; configurable daily goals; XP with 5 scholarly tiers (Novice→Master); 9 challenges with bronze/silver/gold; leaderboards; 13-week heatmap; milestones; session-end celebration; public scholar profiles with follow.
**Weak:** no native push (confirmed — the headline gap); no daily quests; no milestone celebration moments; streak freezes buried in Settings; no home-screen widget; no re-engagement email; weak "all goals complete" dead-end.

### Code health (7.5/10)
**Strong:** all four verification commands pass (855 tests / 76 files); architecture rules hold everywhere **except** billing.ts; strict TS; all 30+ routes lazy-loaded; rate limiting tiered; no hardcoded secrets; legacy code actually removed.
**Weak:** billing.ts client-SDK violation (critical, the one rule-breaker); webhook untested; accessibility tests cover one component; Gemini rate-limit (429/RESOURCE_EXHAUSTED) not detected distinctly; Reader/Dashboard >1,500 lines each.

### Performance / iOS (7/10)
**Strong:** disciplined chunking (corpus single-chunk constraint respected and documented); Workbox runtime caching; Firestore offline persistence on; fetch-polyfill stripping; auth off the native boot critical path; App Store privacy manifest + CI archive scripts correct.
**Weak:** unbounded boot queries; no API caching for dictionary/lemma endpoints; silent SW auto-update can reload mid-reading; no `viewport-fit=cover`/safe-area handling (notch occlusion); offline texts in localStorage (~10-text ceiling) instead of IndexedDB; fonts loaded without `display=swap`.

### Monetization & growth (4/10) — lowest score
**Strong:** functional Stripe integration with signature verification; server-side AI quota with daily reset; 4-tier plan structure; vocab limits enforced client-side; iOS purchase compliance gate correct.
**Weak:** everything in §2 items 1–4 and 8–10; plus no upgrade prompt at the vocab-cap moment, no referral mechanics, plan feature strings not i18n'd.

### Security (6/10)
**Strong:** deny-by-default Firestore rules with ownership checks; consistent `requireAuth` middleware; tiered rate limits; Zod validation on AI responses; upload whitelisting + size caps; prompt-injection surface minimized by input caps.
**Weak:** billing.ts client-SDK issue (same as above); TTS endpoint not per-user quota'd (cost abuse vector); quota gaps on translate/explain; `/api/import/parse` unauthenticated; prompt-injection hardening could move to structured system/user prompt separation.

---

## 5. Quick wins (high value ÷ effort, mostly < half a day each)

1. Swap client SDK → `getAdminDb()` in the 3 webhook cases (~30 lines) — fixes the critical billing bug.
2. Initialize `streak: 1` at profile creation; always show the streak chip.
3. Subscription-status validation in the AI quota path (~30 min) — closes the plan-spoofing hole.
4. Server-side import quota by counting `users/{uid}/imports` (~1–2 h).
5. Demo SRS → call `calculateSM2()` instead of ad-hoc math (~2 h).
6. Wire the already-built `showReviewReminder()`/`showStreakWarning()` calls (~3 h).
7. Upgrade toast when the vocab cap blocks a save, with plan CTA (~30 min).
8. `robots.txt` + static sitemap + OG meta tags (~1–2 h total).
9. SW `registerType: 'prompt'` + update toast; `viewport-fit=cover` + safe-area CSS (~half day).
10. `display=swap` on the Google Fonts URL (minutes) — 0.5–1.5 s faster first paint on slow connections.
11. Streak-freeze chip on the Dashboard when streak ≥ 7 (~3 h).
12. Milestone toasts at 50/100/500/1000 known words and streak 7/30/100 (~3 h).

---

## 6. What NOT to do

Duolingo/LingQ mechanics that would hurt this product (audit-confirmed: the adult scholarly tone is a strength):

- **No mascot, no guilt-trip notification copy.** The conservative tone fits the audience.
- **No hearts/lives/energy or gem economies** — punishing adults for mistakes in Hittite breaks the comprehensible-input philosophy.
- **No demotion-anxiety leagues.** Seasonal events and themed leaderboards yes; weekly Bronze→Obsidian churn no.
- **No exercise-gating before reading.** Reading is the product; never lock the Reader behind drills.
- **Don't copy LingQ's paywalled lookups or coin micro-economy** — instant lookup stays free; monetize languages, depth, and AI.
- **Don't merge multiple-choice into the SRS reveal-and-rate loop** — the separation is deliberate and verified sound.
