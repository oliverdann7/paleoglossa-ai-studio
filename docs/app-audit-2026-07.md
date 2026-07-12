# Full App Audit — 2026-07-13

Scope: production health, TestFlight/iOS pipeline, runtime smoke of all 16 app
routes (guest mode, desktop + 375 px mobile), and four code-level sweeps
(security/auth, error handling, performance/bundle, i18n/a11y/native).
Complements `product-audit-2026-06.md`; only deltas and confirmations are
recorded here — accepted items from the June audit and the specialty audit
docs are not re-listed.

## Snapshot

| Surface | State |
|---|---|
| Web production (paleoglossa.com) | ✅ Healthy — `/api/health` ok, admin + Gemini configured, deploy = merged main |
| TestFlight | ✅ Builds 46–48 VALID; 41–45 had all failed (missing Sign in with Apple capability on the App ID — enabled 2026-07-12 via ASC API) |
| Verification suite | ✅ type-check, lint, 943/943 tests, build |
| Runtime smoke (16 routes) | ✅ All render; 1 crash found & fixed (Grammar, below) |
| Firestore rules / auth / Stripe webhook | ✅ Solid (deny-all default, plan-spoof defense, signature verification) |

## Fixed in this audit (PR)

- **Grammar page crashed the whole app on API rate-limit.** `/api/*` error
  bodies are JSON objects (`{error, code:'RATE_LIMITED'}`); `Grammar.tsx`
  stored the response unvalidated, so `concepts.forEach` threw and the single
  top-level ErrorBoundary blanked the entire app (reproduced live during the
  route crawl). Guarded all four unvalidated `setState(json)` sites
  (`Grammar.tsx` ×3, `GrammarPathways.tsx` ×1).

## Open findings, ranked

### High

1. **Anonymous callers can spend AI/TTS money.** `chargeAiQuota` allows
   requests with no uid (`api/_routes/ai.ts:110`); AI/OCR/scrape/TTS routes use
   `optionalAuth`. Only brake is the in-process IP rate limiter, which is
   per-instance (multiplied by serverless fan-out) — `api/_lib/rateLimiter.ts:55`.
   TTS additionally sits under the loose 120/min general limit instead of the
   30/min AI limit (`api/index.ts:91–98`).
2. **AI quota fails open.** Any Firestore error (or missing Admin DB) returns
   `allowed:true` (`api/_lib/aiUsage.ts:130,175`) — a Firestore blip removes
   all caps, even for authed users.
3. **No fetch timeouts anywhere (client or server).** No `AbortController` on
   client fetches (`apiFetch.ts:72`, `corpusService.ts:65,84`) and 16/17 Gemini
   calls server-side; no `maxDuration` in `vercel.json`. A stalled connection
   = infinite spinner; a hanging Gemini call = platform-default 504.
4. **Bundle regression: Greek John is inlined in the corpus chunk.**
   `src/data/corpus/john-full.ts` (644 KB source) ballooned the corpus chunk to
   1.52 MB raw / 373 KB gzip — the only chunk over the 800 KB ceiling. The
   synoptics do it right (served JSON in `public/corpus-data/`); John should be
   migrated the same way (do **not** split the chunk — TDZ constraint).
5. **Corpus is on the Dashboard critical path.** `Dashboard.tsx:18` imports
   `CorpusDB` (and `getLangForLemma` → `data/tokens`), so first post-login
   paint downloads the whole 373 KB-gzip corpus. Decoupling the lemma→lang
   lookup would take Dashboard/Vocabulary/Statistics/Notes off the corpus.
6. **Keyboard access to the reader is impractical**: every token is a tab stop
   with no skip/roving-tabindex (`ReadingPane.tsx:249`), and the word drawer
   (`role="dialog"`) has no focus trap, no Escape, no focus restore
   (`LexDrawerPanel.tsx:649`).

### Medium

7. **Unauthenticated shared-cache write** `POST /api/lexical-cache`
   (`api/_routes/lexicon.ts:44`) — cache-poisoning vector into a cache served
   to all users.
8. **Corpus fetch failure = silent empty chapter.** `getSection` null →
   Reader renders a title with zero sentences, no error/retry
   (`Reader.tsx:132`, `corpusService.ts:97,135,158`). `translate` similarly
   returns 200 with empty text on Gemini failure (`ai.ts:428`).
9. **Single top-level ErrorBoundary.** Any route crash blanks the whole app
   (nav included); "Try again" reloads since PR #352 but per-route isolation
   would be better (`RootProviders.tsx:16`).
10. **`SentenceAnalysisPanel` is fully hardcoded English** (0 `t()` calls) and
    has no `role`/`pb-safe` unlike its sibling `LexDrawerPanel`.
11. **Locale coverage gaps**: es/de/fr/ru/zh each missing the same 108 keys
    (whole blocks: `syncStatus.*`, `privacy.*`, `demo.migration.*`, `terms.*`);
    tr missing 67, pt 32; 32 keys untranslated in every non-en locale.
12. **RTL**: reader panels use physical `ml-/mr-/pl-/pr-` (16 occurrences, zero
    logical `ms-/me-`); two-column analysis layout borders land on the wrong
    side for Hebrew/Syriac/Aramaic (`ReadingPane.tsx:485`).
13. **Reader difficulty scoring is O(full chapter) per nav**
    (`ReadingPane.tsx:379–392`) while rendering is correctly windowed — worst
    on long chapters (Luke 1 = 80 sentences; John once served will be larger).
14. **Admin allowlist is a hardcoded email list** in source
    (`api/_routes/admin.ts:11`).

### Low

15. Guest-mode localStorage unguarded against Safari-private/quota errors
    (`vocabularyService.ts:289,407,471`).
16. Stripe webhook silently no-ops (200) if `STRIPE_WEBHOOK_SECRET` is unset —
    correct for dev, silent billing drop if ever misconfigured in prod
    (`billing.ts:233`).
17. Icon-only buttons missing `aria-label` in `ReaderBottomNav`,
    `ReaderAudioBar`, `SentenceAnalysisPanel` close, tutorial close.

## Verified healthy (worth knowing)

- Auth: Firebase ID-token verification server-side; plan spoofing defeated
  (paid plan honored only with active Stripe sub). Ownership checks on all
  course/notebook/note mutations. Admin routes all gate on `requireAdmin`.
- No secrets in the client bundle; no XSS sinks; SSRF guard on `/api/ai/scrape`.
- Firestore rules: deny-all default, server-controlled fields blocked client-side.
- Route-level code splitting across all 40+ pages; corpus off the
  landing/auth path; PWA precache correctly excludes the 264 MB corpus-data.
- Vocabulary writes: batched, retry/backoff, error toast, flush on pagehide.
- Reader TTS falls back to speechSynthesis; AI `analyze` falls back to
  `basicAnalyze`; dev-only mock corpus confirmed absent from production bundle.
- Mobile reader first-run flow (word tap → drawer → Mark as Known → persisted
  KNOWN state) verified end-to-end at 375 px, zero console errors.

## Suggested order of attack

1. Quota fail-closed + move TTS under the AI rate limit + require auth (or a
   stricter anonymous cap) on AI/TTS spend paths (items 1–2).
2. Timeouts: shared `fetchWithTimeout` client-side; `AbortController` +
   `maxDuration` server-side (item 3).
3. John → served JSON + Dashboard decoupling (items 4–5) — biggest UX win for
   iOS cold start.
4. SentenceAnalysisPanel i18n/role + locale key backfill (items 10–11).
5. Reader a11y pass (items 6, 17) and RTL logical properties (item 12).
