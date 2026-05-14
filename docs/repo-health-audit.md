# Repo Health Audit — paleoglossa-ai-studio

> **Audit date:** 2026-05-14  
> **Branch:** `main` @ `58231b2`  
> **Architecture:** Vite 6 + React 19 + Firebase 11 + Express 5 + Gemini 2.0 Flash

---

## 1. Architecture Summary

| Layer | Technology | Version (wanted) | Notes |
|-------|-----------|-------------------|-------|
| **Bundler** | Vite | 6.4.2 | With `@vitejs/plugin-react` (Babel React Compiler), `@tailwindcss/vite`, `vite-plugin-pwa` |
| **Frontend** | React | 19.2.6 | SPA, lazy-loaded pages, no SSR |
| **CSS** | Tailwind CSS | 4.3.0 | Via Vite plugin (no PostCSS config) |
| **Routing** | React Router DOM | 7.15.0 | `BrowserRouter` with lazy routes |
| **Auth** | Firebase Auth | (client 11.10.0) | Email/password + Google provider |
| **Database** | Firestore | (client + admin) | Client SDK + Admin SDK (lazy-init) |
| **Server** | Express | 5.2.1 | Single 1868-line `api/index.ts` file |
| **AI** | `@google/genai` | 2.2.0 | Gemini 2.0 Flash via dynamic import |
| **Payments** | Stripe | 22.1.1 | Checkout, webhook, customer portal |
| **PWA** | `vite-plugin-pwa` | 1.3.0 | Workbox service worker |
| **Mobile** | Capacitor | 8.3.4 | Native iOS + Android shells |
| **i18n** | i18next | 26.1.0 | 8 UI languages |
| **SRS** | SM-2 + FSRS | (custom) | `src/lib/srs/` |
| **Validation** | Zod | 4.4.3 | AI responses, import validation |
| **Charts** | recharts | 3.8.1 | Statistics dashboard |
| **Animation** | motion | 11.18.2 | UI transitions |
| **Testing** | Vitest | 2.1.9 | jsdom + Testing Library (22 files, 185 tests) |

### Firestore Collections in Use

- `users/{uid}` — Profile + aggregated stats + plan
- `users/{uid}/vocabulary/{lemma}` — Per-lemma knowledge + SRS
- `users/{uid}/imports/{importId}` — User-imported texts
- `users/{uid}/reviewLogs/{logId}` — SRS review history
- `users/{uid}/readingProgress/{textId}` — Scroll position per text
- `users/{uid}/settings/main` — User preferences
- `users/{uid}/notes/{noteId}` — Per-word notes
- `users/{uid}/notebooks/{notebookId}` — Research notebook collections
- `users/{uid}/tutorSessions/{sessionId}` — AI tutor chat history
- `texts/{textId}` — Public curated texts
- `publicTexts/{textId}` — Public shared imports
- `syntaxAnnotations/{annotationId}` — (server-managed)
- `aiUsage/{uid}` — Per-user AI quota tracking

---

## 2. Scripts

| Script | Command | Status | Notes |
|--------|---------|--------|-------|
| `dev` | `tsx server.ts` | ✅ Works | Express + Vite middleware on port 3000 |
| `start` | `tsx server.ts` | ✅ Works | Same as dev (production entry) |
| `build` | `vite build` | ✅ Passes | ~3371 modules, 30s cold, PWA generated |
| `preview` | `vite preview` | ✅ Works | Serves `dist/` |
| `type-check` | `tsc --noEmit` | ✅ Passes | 0 errors |
| `lint` | `eslint .` | ✅ Passes | 0 errors, 19 pre-existing warnings |
| `test` | `vitest run` | ✅ Passes | 22 files, 185 tests |
| `test:watch` | `vitest` | ✅ Works | Watch mode |
| `test:coverage` | `vitest run --coverage` | ✅ Works | v8 coverage provider |
| `clean` | `rm -rf dist` | ✅ Works | — |

**Note:** There is no `format` script, no `e2e` script, and no `storybook` script.

---

## 3. Build Health

| Check | Result | Detail |
|-------|--------|--------|
| **TypeScript** (`tsc --noEmit`) | ✅ Pass | Strict mode enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). 0 errors. |
| **Lint** (`eslint .`) | ✅ Pass | 0 errors. 19 warnings across 6 files. 4 warnings are fixable with `--fix`. |
| **Build** (`vite build`) | ✅ Pass | Chunk warning: circular `vendor-markdown → vendor-react → vendor-markdown`. |
| **Tests** (`vitest run`) | ✅ Pass | 22 files, 185 tests, all passing. 18.13s duration. |
| **PWA** (`vite-plugin-pwa`) | ✅ Works | 107 precached entries, ~3MB. |

### Lint Warnings Summary

| File | Warnings | Issues |
|------|----------|--------|
| `firestore.rules:172` | 1 | Open read rule (`syntaxAnnotations` collection) — intentionally public |
| `ActiveLanguageContext.tsx:81` | 1 | Exports both component + const (fast refresh warning) |
| `SubscriptionContext.tsx` | 5 | 4 unnecessary `useCallback` deps, 1 fast refresh warning |
| `fsrs.ts:55` | 1 | Unused eslint-disable directive |
| `Dashboard.tsx:97` | 1 | Missing `activeLanguageId` in useMemo deps |
| `Reader.tsx` | 8 | 3 unused eslint directives, 4 missing deps, 1 logical expression stability warning |
| `Vocabulary.tsx:58` | 1 | Missing `activeLanguageId` in useMemo deps |

### Test Coverage (by file count)

| Area | Files | Tests | Notes |
|------|-------|-------|-------|
| Frontend components | 3 | 10 | `AuthGuard`, `Reader`, `Subscription.pricing` |
| Frontend lib/data | 2 | 27 | `dictionary.test.ts` (data + services) |
| Frontend services | 1 | 3 | `morphologyService.test.ts` |
| Frontend contexts | 1 | 3 | `profileCreation.test.ts` |
| Frontend constants | 1 | 11 | `plans.test.ts` |
| Frontend SRS | 1 | 4 | `sm2.test.ts` |
| Frontend utils | 2 | 23 | `tutorSession`, `navigationBoundaries`, `reviewCardFactory` |
| Frontend smoke | 1 | 11 | Route rendering smoke tests |
| API routes | 9 | 73 | AI endpoints, usage, public library |
| **Total** | **22** | **185** | — |

---

## 4. Dependency & Package Manager

### Package Manager

- **npm** (lockfile: `package-lock.json`, 17,147 lines)
- No `yarn.lock`, `pnpm-lock.yaml`, or `bun.lock` present
- No `engines` field in `package.json` (no Node.js version pinning)

### Key Package Versions

All dependencies are currently within their caret ranges. Previous audit session applied safe patch/minor updates. The following are intentionally held:

| Package | Current | Latest | Held Because |
|---------|---------|--------|-------------|
| `firebase` | 11.10.0 | 12.13.0 | Major SDK API changes |
| `firebase-admin` | 13.9.0 | — | Dep chain fix blocked upstream |
| `motion` | 11.18.2 | 12.38.0 | Major API rewrite |
| `lucide-react` | 0.469.0 | 1.14.0 | v1 icon renames |
| `@vitejs/plugin-react` | 4.7.0 | 6.0.1 | Major version jump |
| `vitest` / coverage / ui | 2.1.9 | 4.1.6 | Major overhaul |
| `typescript` | 5.9.3 | 6.0.3 | Major breaking |

### Unused Dependencies (candidates for removal)

| Package | Reason |
|---------|--------|
| `autoprefixer` | No PostCSS config; Tailwind v4 + `@tailwindcss/vite` handle prefixing natively. |
| `@testing-library/user-event` | Never imported in any test or source file. |
| `@vitest/ui` | Never configured; no `--ui` script. |

### Security Posture

| Vuln | Severity | Chain | Fixable? |
|------|----------|-------|----------|
| `@tootallnate/once` | Low (8) | deep transitive via `firebase-admin` → GCP stack | ⛔ Blocked upstream in firebase-admin |
| `esbuild` ≤0.24.2 | Moderate (7) | bundled in `vitest` 2.x | ⛔ Requires vitest 4.x (breaking) |
| **Total** | 15 vulns (8 low, 7 moderate) | — | No high/critical |

PostCSS XSS (GHSA-qx2v-qp2m-jg93) was resolved in a prior update.

---

## 5. Environment Variable Documentation

**`docs/.env.example` exists and is comprehensive** (71 lines, 5 sections). It documents:
- Firebase client config (VITE_FIREBASE_*)
- Firebase Admin SDK (FIREBASE_SERVICE_ACCOUNT_JSON or individual vars)
- Stripe keys and price IDs
- Gemini API key
- Production requirements checklist

**Issues:**
- No `.env.local` file is documented in `.gitignore` (`.env` IS in `.gitignore`).
- The `.env.example` mentions `GOOGLE_TTS_API_KEY` but the TTS endpoint in `api/index.ts` references a variable name — verify consistency.
- Stripe price IDs reference `STRIPE_BASIC_PRICE_ID`, `STRIPE_DUO_PRICE_ID`, `STRIPE_FULL_PRICE_ID` — but the actual plan names are "Starter", "Duo", "Fellowship" (see `src/lib/constants/plans.ts`). This naming mismatch could cause confusion during setup.

---

## 6. Firebase / Express / Gemini Boundaries

### Firebase Client SDK (`src/lib/firebase.ts`)
- Initialized via Vite `define` (build-time injected `__FIREBASE_CONFIG__`)
- Provides `auth`, `db` (Firestore), `googleProvider`
- Error handling via `handleFirestoreError` helper
- **No Firebase App Check** configured

### Firebase Admin SDK (`api/_lib/firebaseAdmin.ts`)
- Lazy init: tries service account JSON → individual vars → ADC → warn in dev
- Proxy-based `adminDb` and `adminAuth` that throw if unavailable
- Used by all authenticated API routes

### Express (`api/index.ts`)
- **1868 lines** — monolithic single file
- Route groups: auth, dictionary, AI (10 endpoints), Stripe, notebooks, notes, search, grammar, syntax, manuscripts, courses, audio, public texts, imports, admin
- CORS wide-open (`*`) — acceptable for Vercel serverless but worth noting
- AI endpoints: server-side Gemini via `@google/genai` (dynamic import, model `gemini-2.0-flash`)
- Raw body capture for Stripe webhooks

### Gemini Integration
- Server-side only (never called from client directly)
- Per-endpoint Zod validation of AI responses via `parseAndValidateAIResponse`
- Per-user daily quota tracking via `aiUsage` Firestore collection
- Fallback: `basicAnalyze()` (rule-based tokenization for Greek) when Gemini fails or key missing

---

## 7. Duplicate Files / Services / Issues

### Confirmed Dead Components

| File | Status | Notes |
|------|--------|-------|
| `src/components/LexDrawer.tsx` | **Unused** | Not imported anywhere. `LexDrawerPanel.tsx` is the active component. |
| `src/components/FastWordPopup.tsx` | **Unused** | Not imported anywhere. |

### Duplicate Type Definitions

| Interface | Defined In | Also Defined In | Risk |
|-----------|-----------|-----------------|------|
| `Morphology` | `src/types/corpus.ts:13` | `src/types/library.ts:14` | Drift risk; subtle incompatibilities |
| `Token` | `src/types/corpus.ts:35` | `src/types/library.ts:23` | Same type, separate files |
| `Chapter` | `src/types/library.ts` | (likely redundant) | Possibly unused entirely |

### Duplicate Test Files

| File | Similar File | Notes |
|------|-------------|-------|
| `src/lib/data/dictionary.test.ts` | `src/lib/services/__tests__/dictionary.test.ts` | Different test suites but confusingly named — both test dictionary functionality |

### Monolithic File Concerns

| File | Lines | Issue |
|------|-------|-------|
| `api/index.ts` | 1868 | All API routes in one file. Makes testing and maintenance harder. |
| `src/data/corpus.ts` | 2500+ | All corpus text definitions in one file with `CorpusDB` class. |
| `src/pages/Reader.tsx` | 700+ | Reader page with mixed concerns (navigation, token rendering, audio, state). |

### Naming Inconsistencies

- `npm run type-check` (with hyphen) vs `typecheck` conventions — valid but unusual
- `ROADMAP.md` (root) vs `docs/PALEOGLOSSA_ROADMAP.md` (docs/) — two roadmap files with different content
- `src/lib/constants/storage.ts` vs `src/lib/constants/wordStates.ts` vs `src/lib/constants/plans.ts` vs `src/lib/constants/languages.ts` — constants spread across multiple files (minor)
- Stripe env var naming (`STRIPE_BASIC_PRICE_ID`) mismatches plan display names ("Starter") — noted in env doc section

---

## 8. README Accuracy

The `README.md` has several inaccuracies compared to the actual codebase:

| Claim in README | Actual | Impact |
|-----------------|--------|--------|
| "React 18" | React 19.2.6 | Misleading for new contributors |
| "7 languages" (i18n) | 8 languages (Turkish `tr` added) | Understates i18n coverage |
| "Gemini 2.5 Flash" | Gemini 2.0 Flash (`api/index.ts` confirms `gemini-2.0-flash`) | Inaccurate model version |
| Lists `GET /api/lemmas/:lemma` as stub | Route exists but `lemmaLookup` returns null | Acceptable but could be clearer that it's non-functional |
| "No CI/CD pipeline" in the Roadmap doc | `.github/workflows/ci.yml` exists | Stale documentation |

**Recommendation:** Update the Stack table and Feature Status table in README.md to match reality.

---

## 9. Missing Documentation / Config Risks

| Risk | Severity | Detail |
|------|----------|--------|
| **No `AGENTS.md`** | Medium | AI coding tools lack a file specifying lint/typecheck/build commands, leading to inefficient or incorrect tool use. |
| **No `engines` field in `package.json`** | Low | No Node.js version pinning; the CI uses `node-version: 22` but developers may use other versions. |
| **No `format` script** | Low | No Prettier or dprint configuration for consistent formatting. |
| **No E2E tests** | Medium | Critical flows (auth, reader, review) have no E2E coverage. Smoke tests cover route rendering but not user interactions. |
| **No error monitoring** | Medium | No Sentry, Datadog, or similar in production. Errors are silent. |
| **No Storybook / component library** | Low | Acceptable for the current scale; worth noting as the component count grows. |
| **`firestore.rules` open read on `syntaxAnnotations`** | Low | Intentionally public (server-managed writes). The lint warning is expected and suppressed. |
| **CORS wide-open (`*`)** | Low | Acceptable for Vercel serverless but should be locked down if a dedicated backend is added. |
| **Vite `define` for Firebase config** | Low | Build-time injection works but means rebuild required for config changes. |
| **No `HMR_DISABLE` env removal** | Low | `vite.config.ts` references `DISABLE_HMR` env var — likely unused after initial setup. |

---

## 10. Prioritized Recommendations

### Critical

| # | Task | Files | Effort | Rationale |
|---|------|-------|--------|-----------|
| 1 | Update README to match reality (React 19, 8 languages, Gemini 2.0 Flash) | `README.md` | 15m | Misleading new contributors |
| 2 | Add `AGENTS.md` with lint/typecheck/build/test commands for AI tooling | `AGENTS.md` (new) | 10m | Enables efficient AI-assisted development |
| 3 | Remove dead components `LexDrawer.tsx` and `FastWordPopup.tsx` | `src/components/LexDrawer.tsx`, `src/components/FastWordPopup.tsx` | 10m | Eliminates confusion for new developers |

### Important

| # | Task | Files | Effort | Rationale |
|---|------|-------|--------|-----------|
| 4 | Consolidate duplicate `Morphology` and `Token` types (merge `library.ts` into `corpus.ts`) | `src/types/library.ts`, `src/types/corpus.ts` | 1h | Prevents type drift |
| 5 | Rename one of the two `dictionary.test.ts` files for clarity | `src/lib/data/dictionary.test.ts` or `src/lib/services/__tests__/dictionary.test.ts` | 5m | Reduces confusion |
| 6 | Add `engines` field to `package.json` (`"node": ">=18"` or `"^22"`) | `package.json` | 2m | Ensures consistent Node.js versions |
| 7 | Remove unused dependencies (`autoprefixer`, `@testing-library/user-event`, `@vitest/ui`) | `package.json` | 5m | Cleaner dependency tree |
| 8 | Add `"format"` script with Prettier or dprint | `package.json`, config file | 30m | Consistent code formatting |
| 9 | Fix eslint warnings (unused directives, missing hook deps) — at least the 4 fixable ones | `Reader.tsx`, `Dashboard.tsx`, `Vocabulary.tsx`, `fsrs.ts`, `SubscriptionContext.tsx` | 1h | Clean lint output improves signal-to-noise |

### Nice-to-Have

| # | Task | Files | Effort | Rationale |
|---|------|-------|--------|-----------|
| 10 | Split `api/index.ts` into route modules (`api/routes/ai.ts`, `api/routes/stripe.ts`, etc.) | `api/` | 3h | Easier testing and maintenance |
| 11 | Decompose `src/data/corpus.ts` into per-text modules | `src/data/corpus/` | 4h | Better scalability for more texts |
| 12 | Add Sentry or equivalent error monitoring | `src/lib/monitoring.ts`, `App.tsx` | 2h | Catch production errors |
| 13 | Add E2E tests (Playwright) for auth + reader + review flows | `e2e/` (new) | 4h | Critical path coverage |
| 14 | Align Stripe env var naming with plan display names | `.env.example`, `api/index.ts` | 15m | Reduces setup confusion |
| 15 | Add bundle visualization plugin to Vite config | `vite.config.ts` | 10m | Track bundle size growth |
| 16 | Fix circular chunk warning (`vendor-markdown → vendor-react → vendor-markdown`) | `vite.config.ts` | 30m | Cleaner chunk output |

---

## 11. Safe Next PR Suggestions

Ordered by dependency:

1. **`chore/readme-and-agents-update`** — Fix README inaccuracies, add AGENTS.md. (Critical #1, #2)
2. **`chore/remove-dead-components`** — Delete LexDrawer.tsx, FastWordPopup.tsx. (Critical #3)
3. **`chore/consolidate-types`** — Merge library.ts into corpus.ts, remove duplicate types. (Important #4)
4. **`chore/dependency-cleanup`** — Remove unused deps, add engines field. (Important #6, #7)
5. **`chore/lint-warnings-cleanup`** — Fix the 4 auto-fixable warnings and unused directives. (Important #9)
6. **`chore/add-formatting`** — Add Prettier config and format script. (Important #8)

These can be done in parallel or sequentially in any order. None require architecture changes or deprecate existing behavior.

---

## Appendix: Verification Commands (run 2026-05-14)

```bash
npm run type-check   # → 0 errors
npm run lint         # → 0 errors, 19 warnings
npm run build        # → success (30s, 3371 modules)
npm test             # → 22/22 files, 185/185 tests passed
```

All checks pass on `main` @ `58231b2`.
