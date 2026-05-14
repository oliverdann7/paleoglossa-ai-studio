# PalæoGlossa AI Studio — Product Roadmap

> **Target:** A clean, fast, beautiful, market-leading ancient-language reader.
> **Architecture:** Vite 6 + React 19 + Firebase 11 + Express 5 + Gemini 2.0 Flash + React Router 7 + Tailwind v4.
> **Constraint:** Everything native to the current stack — no Next.js, Prisma, PostgreSQL, Turborepo, or Auth.js.

---

## Product Vision

PalæoGlossa lets you read the ancient world, word by word. It combines an ancient-text reader, morphology engine, spaced-repetition vocabulary, AI philology tools, and a growing corpus library — all in one scholarly-grade SPA.

**North stars:**
- Every word click reveals rich lexical data (morphology, lemma, paradigm, frequency, dictionary entry).
- The reader feels like a beautiful book, not a web app.
- All core features work offline.
- AI augments understanding without replacing the learner's own work.
- Teachers can create courses from the corpus for their students.

---

## Current Architecture Baseline

| Layer | Technology | State |
|-------|-----------|-------|
| **Frontend** | React 19 + TypeScript 5.9 strict | SPA, lazy-loaded pages |
| **Bundler** | Vite 6.4 | PWA plugin, Tailwind v4, React Compiler |
| **CSS** | Tailwind CSS v4 | 3 themes (parchment, sepia, dark) |
| **Routing** | React Router DOM v7 | `BrowserRouter` with lazy routes |
| **Auth** | Firebase Auth | Email/password + Google + guest mode |
| **Database** | Firestore (client + Admin SDK) | 13 collections |
| **Server** | Express 5 (Vercel serverless) | 1868-line `api/index.ts` |
| **AI** | `@google/genai` 2.2.0 (Gemini 2.0 Flash) | Server-side only, 10 endpoints |
| **Payments** | Stripe 22 | Checkout, webhook, customer portal |
| **i18n** | i18next | 8 UI languages |
| **SRS** | SM-2 + FSRS (custom) | 4 card types, 6 word states |
| **Testing** | Vitest + Testing Library | 22 files, 185 tests |
| **PWA** | `vite-plugin-pwa` + Workbox | 107 precached entries |
| **Mobile** | Capacitor 8.3 | iOS + Android native shells |
| **Status** | `type-check` ✅ 0 errs, `lint` ✅ 0 errs, `build` ✅, `test` ✅ 185/185 |

---

## Phase 1: Stability and Repo Health

**Goal:** Eliminate dead code, consolidate types, split the monolithic API file, fix all lint warnings, and harden the CI pipeline so future work is safe and fast.

**Why first:** Every subsequent phase touches files that are messy or duplicated. Cleaning first makes everything faster.

**Files likely touched:**
- `src/types/` (`corpus.ts`, `library.ts`, `firestore.ts`, `modules.ts`) — consolidate into 2 files
- `api/index.ts` — split into `api/routes/ai.ts`, `stripe.ts`, `library.ts`, `search.ts`, etc.
- `src/components/LexDrawer.tsx`, `FastWordPopup.tsx` — delete unused components
- `src/data/tokens.ts`, `src/data/chapters.ts`, `src/data/texts.ts` — archive or remove mock data
- `package.json` — remove `autoprefixer`, `@testing-library/user-event`, `@vitest/ui`
- `.github/workflows/ci.yml` — already exists, add `npm run build` to PR gate

**Implementation steps:**
1. Delete `LexDrawer.tsx` and `FastWordPopup.tsx` (dead, not imported anywhere).
2. Merge `types/library.ts` into `types/corpus.ts` and remove duplicate `Morphology`/`Token` interfaces.
3. Split `api/index.ts` into domain route modules under `api/routes/`.
4. Remove unused dependencies.
5. Fix all 19 eslint warnings (4 are auto-fixable).
6. Run full test suite and verify no regressions.
7. Run `git diff --check` and ensure clean.

**Risks:**
- Splitting the Express app may break Vercel's serverless handler export — test with `npm run build` and a Vercel preview deployment.
- Type consolidation can cascade — do one type file at a time with `tsc --noEmit` between each.

**Acceptance criteria:**
- `npm run type-check`: 0 errors, 0 warnings.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: success.
- `npm test`: all 185 tests pass.
- `api/index.ts` is under 300 lines (delegates to route modules).
- Dead components removed.

---

## Phase 2: Reader Foundation

**Goal:** The reader (`src/pages/Reader.tsx`, currently 700+ lines) is the core feature. Extract it into focused sub-components, fix re-render bottlenecks, and add virtualization for long texts.

**Files likely touched:**
- `src/pages/Reader.tsx` — extract orchestration from rendering
- `src/components/reader/ReadingPane.tsx` — token rendering
- `src/components/reader/GlossTooltip.tsx` — word click popover
- `src/lib/hooks/useVocabulary.ts` — stable `getWordInfo` reference (already partially done)
- `src/components/reader/ReaderToolbar.tsx` — toolbar extraction
- `src/components/reader/ReaderBottomNav.tsx` — chapter nav extraction

**Implementation steps:**
1. Profile the reader with React DevTools to identify re-render hot spots.
2. Extract sentence rendering into `VirtualSentence` with `React.memo`.
3. Extract chapter navigation into `ChapterNavBar`.
4. Extract parallel translation panel into `ParallelPanel`.
5. Extract word-analysis popover into `WordAnalysisPopover`.
6. Add virtualized rendering for chapters with >50 sentences (render visible + buffer only).
7. Ensure each `ReaderToken` updates independently when only its vocabulary state changes.

**Risks:**
- Over-extraction can make the code harder to follow — keep related logic co-located.
- Virtual scrolling with variable-height text requires careful measurement.

**Acceptance criteria:**
- `Reader.tsx` is under 500 lines of orchestration code.
- Scrolling through John 1 (21 chapters) stays at 60 fps.
- State change for one word does not re-render other tokens.
- All existing reader tests pass.

---

## Phase 3: Language Registry and Linguistic Services

**Goal:** Extract language-specific logic from UI components into a testable `linguistics/` domain layer. Each language gets a module that knows its morphology, script, and capabilities. The UI calls a uniform API and never deals with language internals.

**Files likely touched:**
- `src/lib/morphology/` (new directory)
- `src/lib/morphology/greek.ts` — Greek-specific helpers
- `src/lib/morphology/hebrew.ts`, `latin.ts`, `syriac.ts`, etc.
- `src/lib/morphology/types.ts` — language-agnostic types
- `src/lib/services/morphologyService.ts` — strip language-specific formatters
- `src/lib/data/languages.ts` — language definitions
- `src/components/reader/GlossTooltip.tsx` — call domain API

**Implementation steps:**
1. Define `LanguageModule` interface: `formatMorphology()`, `getParadigm()`, `getScriptDirection()`, `getTransliteration()`.
2. Create one module per language in `src/lib/morphology/`.
3. Move formatters from `morphologyService.ts` into the modules.
4. Create a `LanguageRegistry` that maps `languageId → LanguageModule`.
5. Audit `src/lib/data/languages.ts` for completeness (currently 11 languages).
6. Add `LanguageFeature` flags (`hasCase`, `hasGender`, `hasVerbFinitude`, etc.) for conditional UI rendering.

**Risks:**
- Not all 11 languages have equal morphological data — thin modules should return graceful defaults, not crash.
- Over-abstracting can make simple lookups painful — keep the API surface small.

**Acceptance criteria:**
- `morphologyService.ts` no longer contains language-specific string logic.
- Every language module has at least one test.
- UI renders identically (visual regression check).
- Adding a new language = creating one file + registering it.

---

## Phase 4: Word Analysis and Grammar References

**Goal:** Every word click reveals rich, accurate lexical data — morphology, paradigm table, frequency, dictionary entry, and a link to the relevant grammar concept. Replace the placeholder Grammar page with structured grammar pathways.

**Files likely touched:**
- `src/components/reader/LexDrawerPanel.tsx` — lexical detail panel
- `src/components/reader/ParadigmModal.tsx` — inflection table
- `src/lib/data/dictionary.ts` — corpus-derived dictionary builder
- `src/lib/data/dictionaryDB.ts` — static dictionary entries
- `src/pages/Grammar.tsx` — replace placeholder with structured content
- `src/lib/services/grammarService.ts` — grammar concept API
- `api/_lib/grammarData.ts` — static grammar concept data

**Implementation steps:**
1. Expand `dictionaryDB.ts` with structured entries (lemma, POS, gloss, definition, paradigm class, cognates). Source from LSJ, Strong's, Whitaker's Words.
2. Build `ParadigmTable` component that renders full inflection tables from static paradigm maps.
3. Add a deep-linkable word details route (`/app/word/:languageId/:lemma`).
4. Cache dictionary lookups in a `Map` to replace the current O(n) scan.
5. Add Gemini fallback for words not in static dictionary, cache result in Firestore.
6. Define a `GrammarConcept` hierarchy with prerequisites (nominative → accusative → case usage).
7. Build a `/api/grammar/pathway?languageId=grc` endpoint returning recommended next concepts based on user's encountered morphology.
8. Add `QuickGrammar` link from token click to the relevant grammar concept.

**Risks:**
- Grammar prerequisite graph is complex — start linear per language.
- Concept-to-morphology mapping requires domain expertise; begin with Greek.

**Acceptance criteria:**
- Every token in SBLGNT John 1-21 returns a full dictionary entry.
- Word details page loads in < 200ms for static corpus words.
- Paradigm tables render for 10+ high-frequency Greek lemmas.
- Grammar page shows 20+ Greek concepts ordered by prerequisite.
- Token click offers "Grammar of this form" link.

---

## Phase 5: Premium UI and Design System

**Goal:** Elevate the visual design to market-leading quality. The reader must feel like a beautiful book, not a web app. Establish design tokens, refine typography, polish themes, add smooth transitions, and ensure accessibility.

**Files likely touched:**
- `src/index.css` — Tailwind theme configuration
- `src/components/reader/ReadingPane.tsx` — typography and spacing
- `src/components/reader/ReaderToolbar.tsx` — controls
- `src/components/Navbar.tsx` — navigation
- `src/pages/Landing.tsx` — marketing page
- `src/components/reader/GlossTooltip.tsx` — animations
- `src/components/Skeleton.tsx` — loading states
- `src/components/reader/ReaderTutorial.tsx` — onboarding

**Implementation steps:**
1. Define design tokens: spacing scale, color palette per theme, type scale, border radii, shadows.
2. Refine typographic scale — `text-pretty`, balanced line lengths (65-75 chars), proper heading hierarchy.
3. Enhance themes with subtle textures (CSS gradients) and refined colors.
4. Add smooth page transitions between reader chapters using `motion`.
5. Improve gloss tooltip: fade-in, etymology tab, frequency badge, "add to review" button.
6. Add a "reading mode" that hides all navigation chrome.
7. Polish the Landing page with animated hero and feature showcase.
8. Ensure all interactive elements have visible focus styles for keyboard accessibility.

**Risks:**
- CSS animations can cause layout shifts — use `transform` and `opacity` only.
- Visual polish is subjective — establish design tokens first and apply consistently.

**Acceptance criteria:**
- Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90.
- Reader stays at 60 fps during chapter navigation and word clicks.
- All three themes look distinct and polished.
- Reading mode hides chrome and shows only text.
- Keyboard navigation works through all interactive elements.

---

## Phase 6: Performance and Code Splitting

**Goal:** Optimize bundle size, fix the circular chunk warning, add bundle analysis to the build pipeline, and ensure the app loads fast on slow connections.

**Files likely touched:**
- `vite.config.ts` — chunk splitting configuration
- `src/lib/firebase.ts` — lazy Firebase imports
- `src/App.tsx` — lazy page loading (already implemented)
- `package.json` — add `"analyze"` script

**Implementation steps:**
1. Fix the circular chunk warning: `vendor-markdown → vendor-react → vendor-markdown`. Split markdown and firebase vendor chunks to avoid circular references.
2. Add `vite-plugin-visualizer` or `rollup-plugin-visualizer` to generate bundle analysis on build.
3. Audit the `vendor-firebase` chunk (696 KB gzipped): ensure only necessary Firebase modules are imported (not the entire SDK).
4. Lazy-load AI service modules (`aiClient.ts` is 71 KB and only needed on AI-enabled pages).
5. Add `"analyze": "vite build --mode analyze"` script to `package.json`.
6. Measure and document baseline: Time to Interactive, First Contentful Paint, largest bundle chunk.

**Risks:**
- Over-aggressive code splitting can cause flash-of-loading-state on navigation.
- Firebase SDK tree-shaking is limited — check which modules are actually imported in `src/lib/firebase.ts`.

**Acceptance criteria:**
- Bundle analysis report generated on build.
- No circular chunk warnings in build output.
- `vendor-firebase` chunk reduced (if unnecessary modules removed).
- All existing tests pass.
- TTI on 3G simulated connection < 3s.

---

## Phase 7: Ingestion and Content Pipeline

**Goal:** Make text import reliable, extensible, and well-tested. Users paste text, upload files, scrape URLs, or OCR images and get tokenized, analyzable content with lemma assignments.

**Files likely touched:**
- `src/pages/Import.tsx` — multi-step import wizard
- `src/lib/importers/` — adapters (`oshb.ts`, `sblgnt.ts`, `stepbible.ts`, `ogl.ts`, `latin.ts`)
- `src/lib/importers/validate.ts` — input validation
- `src/lib/services/importService.ts` — save/retrieve imports
- `api/index.ts` (or `api/routes/imports.ts`) — import API
- `api/_lib/aiPrompts.ts` — AI tokenization prompts
- `api/_lib/basicAnalyze.ts` — rule-based tokenization fallback

**Implementation steps:**
1. Audit all import adapters — ensure each produces `ImportedText` consistent with the `Text` type from `corpus.ts`.
2. Add a "paste text" flow with language auto-detection.
3. Add file upload for `.txt`, `.srt`, `.tex` (BibleWorks/Logos).
4. Add a `PastePreview` step showing tokenization before saving — let users adjust sentence boundaries.
5. Trigger background analysis after import: generate vocabulary items, compute frequency contribution, assign difficulty level.
6. Improve URL scraping (`/api/ai/scrape`) with retry logic and better HTML-to-text.

**Risks:**
- Tokenization quality varies by language — rule-based fallback handles only Greek well. Rely on Gemini for Hebrew, Syriac, Coptic.
- Background analysis could be slow — show a progress indicator.
- File format parsing is error-prone — validate aggressively.

**Acceptance criteria:**
- Paste Greek text → tokenized with lemma + gloss in < 5s.
- Upload `.txt` → correct paragraph/sentence detection.
- Import from URL → content extracted and tokenized.
- All import adapter tests pass.
- Imported texts are searchable via `/api/search`.

---

## Phase 8: Offline / PWA

**Goal:** Users can read downloaded texts, review vocabulary, and access dictionary entries without network connectivity. All core learning paths work offline.

**Files likely touched:**
- `vite.config.ts` — PWA Workbox precaching
- `src/lib/services/offlineService.ts` — offline data manager
- `src/lib/services/vocabularyService.ts` — local-first writes
- `src/pages/Reader.tsx` — offline-aware rendering
- `src/lib/services/libraryService.ts` — download for offline
- `android/` — Capacitor native configuration
- `ios/` — Capacitor native configuration

**Implementation steps:**
1. Audit current service worker — ensure all static corpus data is precached.
2. Implement "Download for offline" on each text — saves token data to IndexedDB.
3. Make vocabulary operations local-first: IndexedDB immediately, Firestore sync when online.
4. Add a sync queue for offline mutations.
5. Cache dictionary entries in IndexedDB with long TTL.
6. Add offline indicator bar showing connection status and pending sync count.
7. For Capacitor: add `@capacitor/network`, file picker for local import.
8. Test: disable network, verify reader loads cached texts, vocabulary works, review functions.

**Risks:**
- IndexedDB adds complexity — keep API simple: `offline.get(key)`, `offline.set(key, value)`, `offline.sync()`.
- Firestore already has offline persistence via `enableIndexedDbPersistence()` — use that for Firestore-backed data.
- Sync conflicts are rare with per-lemma documents.

**Acceptance criteria:**
- Airplane mode: text fully readable with glosses and dictionary lookups.
- Add word to vocabulary offline → syncs when online.
- Review works offline and syncs results on reconnect.
- Capacitor builds on both platforms.
- PWA install prompt works on Android Chrome.

---

## Phase 9: AI Tutor Quality

**Goal:** The AI tutor (currently a basic chat UI) becomes a contextual, corpus-grounded tutor that answers morphology questions, suggests grammar concepts, generates quizzes, and adapts to the learner's level.

**Files likely touched:**
- `src/pages/Tutor.tsx` — tutor chat UI
- `api/index.ts` (or `api/routes/ai.ts`) — AI tutor endpoints
- `api/_lib/aiPrompts.ts` — tutor prompt templates
- `api/_lib/aiUsage.ts` — usage quota tracking
- `src/lib/services/aiClient.ts` — tutor API client methods
- `src/lib/hooks/useVocabulary.ts` — surface known words for context

**Implementation steps:**
1. Refactor tutor prompts to be context-aware: send current text, sentence, and word when the user asks a question from the reader.
2. Add "Explain this word" button in the reader that opens the tutor pre-seeded with the word's morphology context.
3. Add quiz generation: "Parse this verb form" with AI-generated multiple choice.
4. Implement session summarization: after each session, save key concepts and vocabulary to the user's knowledge base.
5. Add rate limiting and usage tracking per plan tier.
6. Add suggested questions based on the user's recent vocabulary mistakes.

**Risks:**
- AI latency (2-5s per call) — show streaming response or loading state.
- Cost management — cache common explanations, set daily quotas.
- Quality varies by language — Gemini handles Greek well but may struggle with lesser-resourced languages.

**Acceptance criteria:**
- "Explain this word" from the reader opens tutor with word context pre-loaded.
- Tutor generates a morphology quiz from any sentence in the reader.
- Session history persists and is searchable.
- Usage quota is enforced per plan tier.
- All existing AI endpoint tests pass.

---

## Phase 10: Research Notebook

**Goal:** Transform the current Notes and Notebooks stubs into a full research notebook. Users can anchor notes to specific passages, organize them into notebooks, search across notes, and export them.

**Files likely touched:**
- `src/pages/Notebooks.tsx` — rebuild from stub
- `src/pages/Notes.tsx` — extend with passage anchoring
- `src/components/reader/` — note anchors in reading pane
- `src/lib/services/notebookService.ts` — notebook CRUD
- `src/lib/services/importService.ts` — note export
- `api/index.ts` — notebook and note API routes

**Implementation steps:**
1. Extend the note model to support passage anchoring: `textId`, `sentenceRange`, `tokenRange`.
2. Add a highlight-and-annotate mode in the reader: select text → add note.
3. Build notebook organization: create, rename, reorder notebooks.
4. Add full-text search across notes.
5. Add export: Markdown and JSON.
6. Render note indicators in the reader margin (click to view note).
7. Add cross-text note linking: "See also John 1:1."

**Risks:**
- Passage anchoring is UI-intensive — highlight rendering must not conflict with word click for morphology.
- Keep note storage in Firestore `users/{uid}/notes/{noteId}` — no new collections needed.

**Acceptance criteria:**
- Select text in reader → add a note anchored to that passage.
- Notes are visible as margin indicators and clickable.
- Notebooks organize notes with create/rename/delete.
- Search returns notes by content and passage.
- Export produces valid Markdown.
- Note anchoring does not interfere with word click popover.

---

## Explicit Non-Goals

These technologies must NOT be introduced into this codebase:

| Technology | Reason |
|------------|--------|
| **Next.js** | Vite SPA is simpler, faster to iterate, and avoids framework lock-in. No SSR needed. Adding it would require a full app rewrite. |
| **Prisma** | Firestore is the data layer. Adding a relational ORM on top of a document database adds complexity with zero benefit. |
| **PostgreSQL** | No relational data model. All data is user-owned documents (vocabulary, imports, notes). Firestore's document model fits perfectly. |
| **Turborepo** | Single-package repo. A monorepo tool adds overhead with no gain. |
| **Auth.js (NextAuth)** | Firebase Auth already handles auth + Google provider + email/password + custom claims. A second auth library would conflict and require migration. |
| **Redux / Zustand / Jotai** | React Context + custom hooks handle all state needs. No evidence of prop-drilling or state complexity that warrants a global store. |
| **Tailwind v3** | Already on Tailwind v4 with the Vite plugin. v3 would be a downgrade. |
| **Algolia / Meilisearch** | Full-text search works server-side via Firestore queries + client filtering. A dedicated search engine is premature until corpus size exceeds Firestore capabilities. |
| **Sentry (paid tier)** | Error monitoring is desirable (see Phase 6) but must not lock the project into a paid tier. Start with free tier or open-source alternative (GlitchTip). |
| **Storybook** | Component count (< 30) doesn't justify the maintenance overhead. Components are well-isolated in `src/components/`. |

---

## PR Sequencing Recommendations

### Immediate (can start now, no dependencies)

| PR | Phase | Effort | Risk |
|----|-------|--------|------|
| `chore/remove-dead-components` | P1 | 10 min | None (components not imported) |
| `chore/consolidate-types` | P1 | 1 hr | Low (tsc catches issues) |
| `chore/fix-lint-warnings` | P1 | 1 hr | Low (4 auto-fixable, rest manual) |
| `chore/remove-unused-deps` | P1 | 5 min | Low (autoprefixer, user-event, vitest/ui) |
| `chore/add-bundle-analysis` | P6 | 30 min | None (adds script, no code changes) |

### Parallelizable (independent of each other)

| PR | Phase | Depends On | Effort |
|----|-------|-----------|--------|
| `refactor/api-route-split` | P1 | — | 3 hr |
| `feat/language-registry` | P3 | — | 4 hr |
| `feat/premium-ui-typography` | P5 | — | 3 hr |
| `feat/pwa-offline-baseline` | P8 | — | 4 hr |

### Sequential (each builds on prior)

| PR | Phase | Depends On | Effort |
|----|-------|-----------|--------|
| `feat/reader-refactor` | P2 | P1 (types, lint) | 4 hr |
| `feat/dictionary-expansion` | P4 | P2 (reader hooks), P3 (domain types) | 4 hr |
| `feat/grammar-pathways` | P4 | P3 (morphology domain), P4 (dictionary) | 5 hr |
| `feat/ai-tutor-context` | P9 | P2 (reader state), P4 (dictionary) | 4 hr |
| `feat/research-notebook` | P10 | P2 (reader state) | 4 hr |
| `feat/import-refinement` | P7 | P1 (API split) | 3 hr |

### Ongoing Background

| Task | Phase | When |
|------|-------|------|
| Fix circular chunk warning | P6 | After any vendor chunk change |
| Performance budget | P6 | Every 5th PR |
| Accessibility audit | P5 | After each UI PR |
| Test coverage expansion | P1-P10 | With every PR |
| Update `docs/roadmap.md` | — | After each completed phase |

---

## Dependency Map

```
P1 (Stability) ────────────────────────────── foundation
P2 (Reader) ─────── depends on P1
P3 (Lang Registry) ─── depends on P1
P4 (Word Analysis) ─── depends on P2, P3
P5 (UI Polish) ─── independent (parallel with P2-P4)
P6 (Performance) ─── independent (parallel with all)
P7 (Ingestion) ─── depends on P1
P8 (Offline/PWA) ─── independent
P9 (AI Tutor) ─── depends on P2, P4
P10 (Notebook) ─── depends on P2
```

Phases 1 must come first. P5, P6, and P8 are fully independent and can proceed in parallel with any other phase. P9 and P10 need the reader refactor (P2) complete first.
