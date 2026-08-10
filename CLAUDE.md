# CLAUDE.md — Paleoglossa

Ancient-language learning platform (Ancient Greek, Latin, Hebrew, and 8 more).
Full-stack TypeScript: React 19 SPA (Vite 6) + Express 5 API + Firebase/Firestore + Gemini AI.

**Production:** https://paleoglossa.com

---

## Verification commands

Run these after every change. All must pass before opening a PR.

```bash
npm run type-check   # tsc --noEmit — strict mode, 0 errors expected
npm run lint         # eslint — 0 errors expected
npm test             # vitest run — all tests must pass
npm run build        # vite build — must succeed
```

Formatting:
```bash
npm run format       # prettier --write
npm run format:check # prettier --check (CI mode)
```

Dev server:
```bash
npm run dev          # tsx server.ts → http://localhost:3000
```

E2E smoke test (requires dev server running):
```bash
npm run e2e          # playwright test
```

---

## Key paths

| Path | Purpose |
|------|---------|
| `src/pages/` | One file per route (Reader, Library, Courses, AudioLab, …) |
| `src/components/` | Shared UI — `ui/` = primitives, `reader/` `courses/` `library/` = feature sub-components |
| `src/lib/services/` | Business logic (CourseService, vocabularyService, ImportService, …) |
| `src/lib/hooks/` | React hooks (useAuth, useKnowledge, useActiveLanguage, …) |
| `src/lib/constants/` | Stable constants: languages, wordStates, plans, storage keys |
| `src/types/` | Shared TypeScript types — prefer `corpus.ts` over legacy `library.ts` |
| `api/_routes/` | Modular Express routers (ai, audio, courses, billing, …) |
| `api/_lib/` | Shared API utilities (firebaseAdmin, auth, aiPrompts, aiUsage) |
| `src/data/corpus.ts` | All curated texts (2500+ lines) — large, edit carefully |
| `e2e/` | Playwright end-to-end tests |

---

## Feature status — stubs vs complete

### Complete
- Text reader (scroll + page modes), knowledge states, FSRS-5 SRS reviews (`src/lib/srs/fsrs.ts`)
- AI word/phrase/paradigm explanations (Gemini 2.0 Flash)
- Text import (paste, file, URL, OCR), reading progress/streaks
- Auth (Google + Email + guest), Firestore sync
- i18n (8 UI languages), Tailwind parchment/sepia/dark themes
- Grammar browser, AI philology tutor, research notebooks
- Audio lab: TTS with waveform, user recording + compare (server-persisted), IPA, pronunciation mode switching
- Grammar prerequisite graph with per-concept SM-2 mastery tracking (`useGrammarMastery`)
- Classroom courses with teacher custom claims, enrollment, ownership-gated mutations
- Notebook export (Markdown + PDF), cross-text note linking with backlinks

### Data ingestion gaps — code is wired, content isn't bulk-loaded
Both surfaces below are gated behind `VITE_ENABLE_EXPERIMENTAL` (off in production) so they
don't read as unfinished — see `src/lib/features.ts` (`isExperimentalEnabled`). Flip the env
var on in dev to work on them; promote a surface out of the gate once its content is seeded.

| Feature | File(s) | What's missing |
|---------|---------|----------------|
| Syntax treebank | `api/_routes/syntax.ts`, `api/_lib/treebankIndex.ts`, `scripts/treebank/import-proiel.ts` | Reader + PROIEL importer exist; `src/data/treebanks/` ships only `sample-proiel.json`. Run the importer against full PROIEL/Gorman/Perseus drops to populate. |
| Manuscripts | `src/pages/Manuscripts.tsx`, `api/_routes/manuscripts.ts`, `src/lib/data/manuscriptCatalog.ts` | CRUD + IIIF viewer work; `CURATED_MANUSCRIPTS` seeds 9 hand-verified Vatican DigiVatLib manifests. Remaining gap is catalog breadth, not absence. |

---

## Architecture rules

- **TypeScript strict**: `noUnusedLocals` and `noUnusedParameters` are on. No `any` except where existing code already uses it intentionally.
- **Tailwind v4** via `@tailwindcss/vite`. No PostCSS config — do not add PostCSS.
- **Firebase client SDK** (`firebase/*`) only in `src/`. **Admin SDK** (`firebase-admin/*`) only in `api/`.
- **Gemini calls** are server-side only (`api/_routes/ai.ts`). Never call Gemini from the client.
- **React 19** — `react-hooks/exhaustive-deps` warnings are treated as errors in CI intent.
- **No new top-level API files** — add routes as modules in `api/_routes/` and register in `api/index.ts`.
- **Canonical types**: `src/types/corpus.ts` and `src/types/firestore.ts`. `src/types/library.ts` is legacy — do not add to it.
- **Search before create**: always `find`/`grep` before adding a new service, hook, component, or type — duplicates are a recurring problem in this codebase.

---

## Firestore collections

| Collection | Purpose |
|-----------|---------|
| `users/{uid}` | Profile, settings, subscription plan |
| `users/{uid}/vocabulary` | Word knowledge states (NEW/SEEN/LEARNING/KNOWN) |
| `users/{uid}/reviews` | SM-2 review queue items |
| `users/{uid}/readingProgress` | Per-text progress (lastSentence, completionPct) |
| `users/{uid}/notebooks` | Research notebooks |
| `users/{uid}/notes` | Per-word/per-text notes |
| `importedTexts/{uid}/texts` | User-imported texts |
| `courses/{courseId}` | Classroom courses |
| `aiUsage/{uid}` | AI quota tracking per user |

Schema details: `firebase-blueprint.json`, `src/types/firestore.ts`.

---

## Environment variables

See `.env.example` for the full list. Required for local dev:

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_PROJECT_ID` | Firestore DB |
| `VITE_FIREBASE_API_KEY` | Firebase Auth |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth redirect |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server-side Admin SDK (base64 or JSON string) |
| `GEMINI_API_KEY` | AI analysis, translation, tutor (required) |
| `GOOGLE_TTS_API_KEY` | AudioLab TTS |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | Billing |

---

## Held dependency versions — do not upgrade

| Package | Held at | Reason |
|---------|---------|--------|
| `firebase` | 11.x | Major SDK API changes in v12 |
| `motion` | 11.x | Major API rewrite in v12 |
| `vitest` / coverage / ui | 2.x | Major overhaul in v4 |
| `@vitejs/plugin-react` | 4.x | Breaking changes in v6 |
| `typescript` | 5.x | Breaking changes in v6 |
| `lucide-react` | 0.469 | v1 renames icons |
| `jsdom` | 26.x | 27+ pulls ESM-only `@exodus/bytes`, which Vercel's Node launcher cannot `require()` — took down every `/api/*` route (July 2026 outage) |

---

## Known technical constraints

- **ESM imports in `api/`**: Vercel serverless requires `.js` extensions on relative imports. When adding new server files, follow the existing pattern exactly.
- **HMR**: Disabled in AI Studio via `DISABLE_HMR=true`. Do not remove this.
- **Fetch polyfill**: A custom Vite plugin strips `window.fetch` assignments from node_modules — do not remove it from `vite.config.ts`.
- **Bundle size limit**: 800 KB warning threshold. New heavy dependencies must be code-split.
- **`src/data/corpus.ts`** is 2500+ lines. Do not load it eagerly in new code paths.

---

## Test coverage gaps (known)

These areas have no tests — add them when touching the feature:
- Stripe webhook handling (`api/_routes/billing.ts`; only the mappers are tested)
- Gemini quota-exceeded fallback paths (rate limiter + usage tracking are tested)
- PDF/DOCX import edge cases (`src/lib/importers/`)
- Service worker itself (offline service + sync status have unit tests)
- Marketplace, Community/Challenges, and AudioLab pages

Closed since this list was written (keep growing coverage, but these exist):
RTL data (`src/lib/data/__tests__/rtl.test.ts`), course quiz progression
(`src/lib/courses/__tests__/quizScoring.test.ts`), offline/sync services,
first a11y test (`src/components/ui/__tests__/EmptyState.a11y.test.tsx`).

---

## Adding a corpus text

**Full works / bulk content** go through the ingestion pipeline, never the bundle:

1. Add a target to `scripts/corpus/ingest/manifest.ts` + a `SourceAttribution` in `src/data/attributions.ts` (license gate)
2. Drop the source file in `.sources/` and run `npx tsx scripts/corpus/ingest/run-manifest.ts --only <textId> --emit-local` (static JSON in `public/corpus-data/`) or push to Firestore
3. Add a bundled `remoteSections` metadata stub (see `src/data/corpus/*-full.ts`) — its `sentenceCount`/`wordCount` are locked against the served JSON by `validation.test.ts`
4. After regenerating served JSON, run `npx tsx scripts/corpus/clean-served-corpus.ts` (junk-token strip, truthful capability flags, index rebuild)

**Small curated samples** (beginner excerpts, hand-annotated) live in the bundle:

1. Add sentences to `src/data/corpus/expanded-sections.ts` using the `sent()` helper
2. Register section(s) in `CorpusDB.getSection()` in `src/data/corpus.ts`
3. Update the `Text` definition with new section IDs in `sectionsPreview`
4. Set `sourceStatus`, `isSample`, `sentenceCount` appropriately
5. Run `npm run type-check && npm run lint && npm run build`

For full morphology in bundled samples: use the richly-tokenized format (see `caesar-bellum-gallicum.ts`'s `w()` builder) — the plain `sent()` helper emits POS-only tokens.

---

## Docs index

| File | Contents |
|------|---------|
| `docs/PALEOGLOSSA_ROADMAP.md` | Technical roadmap; § 11 is the current audit-driven plan (2026-06) |
| `docs/product-audit-2026-06.md` | Full product/engineering audit: scores, confirmed + refuted findings, quick wins |
| `docs/reader-architecture.md` | Reader internals, token pipeline, knowledge state transitions |
| `docs/ai-coding-guardrails.md` | AI safety, forbidden patterns, deployment checklist |
| `docs/repo-health-audit.md` | Codebase quality assessment |
| `docs/performance-audit.md` | Bundle size, lazy-loading analysis |
| `docs/offline-pwa-audit.md` | PWA / service worker strategy |
| `docs/dependency-security-audit.md` | Package vulnerability notes |
| `docs/premium-ui-audit.md` | Visual polish & accessibility review |
| `SECURITY_NOTES.md` | Security threat model |
| `firebase-blueprint.json` | Firestore collection schema |
