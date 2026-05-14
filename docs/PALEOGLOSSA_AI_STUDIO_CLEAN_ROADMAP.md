# PalæoGlossa AI Studio — Clean Roadmap

> **Target:** A clean, fast, beautiful, market-leading ancient-language reader.
> **Constraint:** Everything must be built in the current architecture — no Next.js, Prisma, PostgreSQL, Turborepo, or Auth.js.

---

## Current Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | React 19 + TypeScript 5.9 | SPA with lazy-loaded pages |
| **Bundler** | Vite 6.4 | Dev server, build, code splitting |
| **Styling** | Tailwind CSS v4 + `@tailwindcss/vite` plugin | Utility-first CSS |
| **Routing** | React Router DOM v7 | Client-side routing with `BrowserRouter` |
| **Auth** | Firebase Auth (email/password + Google) | Authentication + custom claims |
| **Database** | Firestore (client SDK) + Firestore (Admin SDK) | User data, vocabulary, imports |
| **Server** | Express 5 (Vercel serverless) | API routes, AI proxy, Stripe |
| **AI** | Google Gemini 2.0 Flash via `@google/genai` | Morphology, translation, explanations |
| **Payments** | Stripe | Subscriptions, checkout, webhooks |
| **PWA** | `vite-plugin-pwa` + Workbox | Service worker, offline caching |
| **Mobile** | Capacitor 8 | Native iOS/Android shells |
| **i18n** | i18next + react-i18next | 8 UI languages |
| **SRS** | SM-2 + FSRS (custom) | Spaced repetition algorithms |
| **Testing** | Vitest + Testing Library + jsdom | Unit and integration tests |
| **Animation** | motion (v11) | UI transitions (not a priority target) |
| **Charts** | recharts | Statistics visualizations |

---

## What Should Stay

- **Vite** — fast bundler, excellent HMR, PWA plugin, Tailwind v4 integration.
- **React** — current app architecture; no migration needed.
- **Firebase** — Auth + Firestore + Admin SDK cover all backend needs without extra infra.
- **Express** — simple API layer; keep routes modular rather than the current monolithic `api/index.ts`.
- **Gemini** — core AI capability; no replacement needed.
- **React Router** — `BrowserRouter` + lazy routes are working well.
- **Tailwind v4** — latest version already in use; no migration needed.

---

## What Should NOT Be Imported

- **Next.js** — Vite SPA is simpler, faster to iterate, and avoids Next.js lock-in. No SSR needed for this app.
- **Prisma** — Firestore is the data layer. Adding an ORM over Firestore adds complexity without benefit.
- **PostgreSQL** — No relational data model. Firestore's document model fits the per-user vocabulary, imports, and notes.
- **Turborepo** — Single-package repo; a monorepo tool adds overhead with no gain.
- **Auth.js** — Firebase Auth already handles auth + custom claims + Google provider. A second auth library would conflict.

---

## Phased Roadmap

---

### Phase 1: Stability and Cleanup

**Goal:** Remove dead code, consolidate duplicate types, make the build reliable and the codebase navigable.

**Files likely touched:**
- `src/types/` — consolidate `corpus.ts`, `library.ts`, `firestore.ts`, `modules.ts` into a clean type hierarchy
- `src/data/texts.ts`, `src/data/chapters.ts`, `src/data/tokens.ts` — remove or archive mock/legacy data not used by the real corpus system
- `api/index.ts` — extract route groups into separate files in `api/routes/`
- `src/store/useStudyStore.ts` — decide if this localStorage-based store is still needed alongside Firestore-backed review
- `src/lib/contexts/` — audit provider hierarchy for unnecessary re-renders
- `src/lib/srs/fsrs.ts`, `src/lib/srs/sm2.ts` — verify both are actually exercised

**Implementation steps:**
1. Run `npm run type-check` and fix all pre-existing warnings (missing deps in hooks, unused eslint disables).
2. Consolidate the four type files into two: `corpus.ts` (data model) and `firestore.ts` (persistence shape). Move legacy types inline or delete them.
3. Audit `src/data/tokens.ts` (80 token arrays) — flag unused exports; remove or tree-shake.
4. Split `api/index.ts` by domain: `api/routes/ai.ts`, `api/routes/stripe.ts`, `api/routes/library.ts`, etc.
5. Add `vitest.config.ts` (separate from `vite.config.ts`) for test-specific configuration.
6. Remove unused dependencies: `autoprefixer`, `@testing-library/user-event`, `@vitest/ui`.

**Risks:**
- Refactoring types can cascade across the entire app — do one file at a time with `tsc --noEmit` after each change.
- Splitting the Express app may break Vercel serverless handler export — test with `npm run build` and Vercel preview.

**Acceptance criteria:**
- `npm run type-check` passes with 0 errors and 0 warnings.
- `npm run lint` passes with 0 errors.
- `npm run build` succeeds.
- All existing tests pass with `npm test`.
- Dead mock data is removed or clearly marked.
- `api/index.ts` is split into at most 300-line route modules.

---

### Phase 2: Reader Architecture

**Goal:** The reader (`src/pages/Reader.tsx`) is the core feature. It must be fast, accessible, and maintainable — not a 2000+ line file with mixed concerns.

**Files likely touched:**
- `src/pages/Reader.tsx` — extract into smaller pieces
- `src/components/reader/` — home for all extracted sub-components
- `src/types/corpus.ts` — reader-specific types may need refinement
- `src/lib/hooks/useReadingProgress.ts` — scroll position tracking
- `src/components/reader/ReadingPane.tsx` — token rendering

**Implementation steps:**
1. Profile the reader with React DevTools to find re-render bottlenecks (likely every `ReaderToken` re-rendering on any state change).
2. Extract sentence rendering into `VirtualSentence` component with `React.memo` and stable `getWordInfo` reference (already partially done with `useRef` in `useVocabulary`).
3. Extract the chapter navigation into `ChapterNavBar`.
4. Extract parallel translation panel into `ParallelPanel`.
5. Extract word-analysis popover into `WordAnalysisPopover` (replace the in-line modal logic).
6. Add virtualized rendering for long chapters — only render visible sentences + a buffer.
7. Ensure each token component updates independently when its vocabulary state changes (avoid parent re-render cascades).

**Risks:**
- Virtual scrolling is tricky with variable-height text — use a library like `react-virtuoso` or build a simple height estimator.
- Over-extraction can make the code harder to follow — keep related logic co-located.

**Acceptance criteria:**
- `Reader.tsx` is under 500 lines of orchestration code.
- Token rendering does not re-render more than 2× when vocabulary state changes for a single word.
- Scrolling through John 1 (21 chapters) at default font size stays at 60 fps.
- All existing reader tests pass.

---

### Phase 3: Word Analysis and Dictionary Quality

**Goal:** Make every word click reveal rich, accurate, well-sourced lexical data — morphology, lemma, gloss, dictionary entry, paradigm, frequency, and usage notes.

**Files likely touched:**
- `src/components/reader/GlossTooltip.tsx` — current click popover
- `src/components/LexDrawer.tsx` — side-panel lexical view
- `src/components/reader/LexDrawerPanel.tsx` — detailed entry rendering
- `src/lib/data/dictionary.ts` — corpus-derived dictionary builder
- `src/lib/data/dictionaryDB.ts` — static dictionary entries
- `src/components/reader/ParadigmModal.tsx` — paradigm display

**Implementation steps:**
1. Audit the current `getGlossWithFallbacks()` chain — ensure every lookup strategy is tested and measured.
2. Expand `dictionaryDB.ts` with well-structured entries (lemma, part of speech, gloss, definition, paradigm class, cognates, usage notes). Source from public-domain lexica (LSJ, Strong's, Whitaker's).
3. Build a `ParadigmTable` component that renders full inflection tables for Greek/Hebrew from the static paradigm maps already in `morphologyService.ts`.
4. Add a "Word Details" route (`/app/word/:languageId/:lemma`) as a deep-linkable page — reuses `LexDrawerPanel`.
5. Cache dictionary lookups in a `Map` to avoid repeated scans of the corpus array (O(n) per lookup currently).
6. Add fallback to Gemini for words not in the static dictionary — and cache the response in Firestore.

**Risks:**
- The dictionary builder currently scans all corpus tokens at import time — this is fine for static data but won't scale to user-imported texts. Separate static corpus lookup from dynamic lookup.
- Gemini fallback adds latency and cost — cache aggressively with TTL.

**Acceptance criteria:**
- Every token in SBLGNT John 1-21 returns a dictionary entry (gloss + part of speech + paradigm information).
- Word details page loads in < 200ms for static corpus words.
- `dictionary.test.ts` covers all lookup strategies.
- Paradigm tables render correctly for at least 10 high-frequency Greek lemmas.

---

### Phase 4: Linguistic Domain Layer

**Goal:** Extract pure-language logic from UI components into a testable `linguistics/` domain layer. The UI should not know about Greek cases or Hebrew stems — only call well-typed domain functions.

**Files likely touched:**
- `src/lib/morphology/` — new directory
- `src/lib/morphology/greek.ts` — Greek-specific helpers
- `src/lib/morphology/hebrew.ts` — Hebrew-specific helpers
- `src/lib/morphology/latin.ts` — Latin-specific helpers
- `src/lib/morphology/types.ts` — language-agnostic morphological types
- `src/lib/data/dictionary.ts` — refactor to use domain types
- `src/lib/services/morphologyService.ts` — strip UI concerns
- `src/components/reader/GlossTooltip.tsx` — use domain API instead of inline logic

**Implementation steps:**
1. Define `MorphologicalFeature`, `ParadigmCell`, `LemmaInfo` interfaces in `src/lib/morphology/types.ts`.
2. Move language-specific morphology formatters from `morphologyService.ts` into `src/lib/morphology/{lang}.ts`.
3. Create a `MorphologyAnalyzer` interface with implementations per language — the UI calls `analyzer.format(morphology, language)` and gets back display-ready data.
4. Move the paradigm lookup logic from `morphologyService.ts` into the relevant language module.
5. Add a `LanguageFeature` registry that declares per-language capabilities (has case, has gender, has verb finiteness, etc.) — used by the UI to conditionally render columns.

**Risks:**
- Over-abstracting can make simple lookups painful. Keep the API surface small: `getParadigm(lemma, lang)`, `formatMorphology(morph, lang)`, `getDictionaryEntry(lemma, lang)`.
- Not all 11 languages have equal morphological data — some languages may return thin results; handle gracefully without crashing the UI.

**Acceptance criteria:**
- `src/lib/services/morphologyService.ts` no longer contains language-specific string formatting — all logic lives in `src/lib/morphology/`.
- Every language module has at least one test demonstrating correct formatting.
- The UI renders identically to the current state (visual regression check).
- A new language can be added by creating one file in `src/lib/morphology/` — no UI changes required.

---

### Phase 5: Lemma/Token Lookup APIs

**Goal:** Replace the current `null`-returning `/api/lemmas/:lemma` endpoint with a real API. Support lemma disambiguation, lookups across multiple corpora, and hybrid (static + user-imported) search.

**Files likely touched:**
- `api/index.ts` (or `api/routes/lemma.ts` after Phase 1 refactor) — the lemma route
- `api/_lib/lemmaLookup.ts` — new module for server-side lemma resolution
- `src/lib/services/lemmaService.ts` — client-side service
- `src/lib/data/dictionary.ts` — expose static data to the server
- `src/data/corpus.ts` — ensure corpus data is accessible from server context

**Implementation steps:**
1. Build a server-side lemma index — load the static corpus data into a `Map<lemma, DictionaryEntry[]>` at startup, persisted across warm Vercel lambda invocations.
2. Implement the `/api/lemmas/:lemma` endpoint:
   - Accept optional `languageId` and `corpusId` query params.
   - Return matching entries from the static corpus index.
   - Fall back to Gemini analysis for unknown lemmas (cached in Firestore `lemmaCache` collection).
3. Build a `/api/lemmas/search?q=` endpoint for typeahead — returns lemma + gloss for autocomplete.
4. Update `lemmaService.ts` on the client to call these endpoints instead of scanning corpus arrays client-side.
5. Add `LemmaLookupResult` type with confidence scoring (exact match > fuzzy match > Gemini fallback).

**Risks:**
- Vercel serverless functions have cold starts — the lemma index may take 100-300ms to load. Mitigate by lazy-loading only the requested language's index.
- Gemini fallback per lemma is slow (2-5s). Only trigger when static lookup returns zero results, and cache aggressively with a long TTL (7 days).

**Acceptance criteria:**
- `GET /api/lemmas/%CE%BB%CF%8C%CE%B3%CE%BF%CF%82?languageId=grc` returns the correct dictionary entry for λόγος in < 50ms (static cache hit).
- Typeahead search returns results within 100ms of keystroke pause.
- Unknown lemmas are analyzed via Gemini and cached in Firestore for subsequent lookups.
- All existing `npm test` API tests pass.

---

### Phase 6: Occurrence/Frequency Intelligence

**Goal:** Show users how often a word appears, in which texts, in which forms — turning the corpus into a learning resource rather than just a reading list.

**Files likely touched:**
- `src/lib/data/frequency.ts` — new module for frequency computation
- `src/data/corpus.ts` — expose full token lists for frequency analysis
- `src/components/reader/GlossTooltip.tsx` — display frequency badge
- `src/components/reader/LexDrawerPanel.tsx` — show occurrence list
- `src/pages/Vocabulary.tsx` — sort/filter by frequency
- `src/lib/services/vocabularyService.ts` — integrate frequency into word info

**Implementation steps:**
1. Precompute a `FrequencyIndex` at build time (or on first load) from all static corpus data:
   - `totalOccurrences[lemma]` — count across all texts
   - `textOccurrences[lemma][textId]` — per-text breakdown
   - `formDistribution[lemma][morphCode]` — how often each form appears
2. Display frequency in the UI as a simple badge: hapax (1x), rare (2-5), uncommon (6-20), common (21-100), frequent (100+).
3. Build a "See all occurrences" feature in `LexDrawerPanel` — list every sentence where the lemma appears, grouped by text, linked to the reader at the correct sentence.
4. Add frequency-based sorting to `Vocabulary.tsx` — let users filter to "hapax legomena" or "most common words I haven't learned yet."
5. Extend `useVocabulary` to suggest words to review based on frequency × time-since-last-seen.

**Risks:**
- Full corpus frequency scan is O(n × m). Precompute the index and store it as a JSON file loaded alongside corpus data — don't compute at runtime.
- Frequency data is static (based on bundled corpus). User-imported texts should also contribute to frequency counts — add an incremental update when imports change.

**Acceptance criteria:**
- Every lemma in the SBLGNT corpus has a frequency count displayed in its tooltip.
- "All occurrences" for λόγος shows every verse in John 1-21 where it appears, linked to the reader.
- Vocabulary page can sort by frequency and filter to "uncommon words."
- Frequency index loads in < 500ms on first page load (precomputed JSON).

---

### Phase 7: Grammar Pathways

**Goal:** Replace the static grammar reference (`src/pages/Grammar.tsx`) with a structured learning pathway that adapts to the user's vocabulary and reading level.

**Files likely touched:**
- `src/pages/Grammar.tsx` — refactor from static page to adaptive pathway
- `src/lib/services/grammarService.ts` — backend grammar data fetching
- `api/_lib/grammarData.ts` — static grammar concept data
- `api/index.ts` (or `api/routes/grammar.ts`) — grammar pathway endpoint
- `src/lib/hooks/useVocabulary.ts` — expose known concepts for pathway adaptation
- `src/components/grammar/` — new directory for grammar-specific components

**Implementation steps:**
1. Define a `GrammarConcept` hierarchy with prerequisites — e.g., "Nominative Case" → "Accusative Case" → "Case Usage."
2. Build a server endpoint `GET /api/grammar/pathway?languageId=grc` that returns the recommended next concepts based on:
   - The user's known vocabulary (which lemmas they've encountered in which case/tense).
   - The frequency of each concept in the user's reading corpus.
3. Build a `GrammarPathway` component that renders a graph/sequence of concepts, highlighting mastered, available, and locked nodes.
4. Each concept node links to a `GrammarConceptPage` with explanations, examples from the user's corpus, and related exercises.
5. Add a `QuickGrammar` popover to the reader — when a user clicks a token, show a "Grammar of this form" link that opens the relevant concept in the grammar pathway.

**Risks:**
- Building a prerequisite graph is complex — start with a simple linear pathway per language and add branching later.
- Concept-to-morphology mapping requires deep domain knowledge. Start with Greek (best-supported) and add other languages progressively.

**Acceptance criteria:**
- Grammar page shows an adaptive pathway with at least 20 Greek grammar concepts ordered by prerequisite.
- Clicking a token in the reader offers a "Grammar of this form" link that navigates to the relevant concept.
- Pathway correctly marks concepts as "available to learn" based on the user's encountered morphology.
- All concepts include at least 2 example sentences drawn from the user's corpus.
- Grammar pathway endpoint returns in < 200ms.

---

### Phase 8: Import/Ingestion Pipeline

**Goal:** Make text import reliable, well-validated, and extensible. Users should be able to paste text, upload files, scrape URLs, or OCR images and get tokenized, analyzable content.

**Files likely touched:**
- `src/pages/Import.tsx` — refactor into multi-step wizard
- `src/lib/importers/` — adapters for each source type
- `src/lib/importers/types.ts` — refine import adapter types
- `src/lib/importers/validate.ts` — strengthen validation
- `src/lib/services/importService.ts` — save/retrieve imports
- `api/index.ts` (or `api/routes/imports.ts`) — import API routes
- `api/_lib/basicAnalyze.ts` — local tokenization fallback
- `api/_lib/aiPrompts.ts` — AI-based tokenization prompts

**Implementation steps:**
1. Audit current import adapters (`oshb.ts`, `sblgnt.ts`, `stepbible.ts`, `ogl.ts`, `latin.ts`) — ensure each produces valid `ImportedText` output consistent with the corpus `Text` type.
2. Add a "paste text" flow with language auto-detection (try rule-based tokenization first, fall back to Gemini).
3. Add a file upload flow for common formats:
   - `.txt` — plain text with paragraph detection.
   - `.srt` — subtitle files (useful for interlinear video).  
   - `.tex` — BibleWorks/Logos export format.
4. Add a `PastePreview` step showing the tokenization result before saving — let users adjust sentence boundaries and correct obvious errors.
5. After import, trigger background analysis:
   - Generate vocabulary items from new tokens (using Phase 5 lemma lookup).
   - Compute frequency contribution (Phase 6).
   - Assign difficulty level based on vocabulary overlap with known words.
6. Add "Import from URL" with server-side scraping (already stubbed in `/api/ai/scrape`) — improve reliability with retry logic and better HTML-to-text conversion.

**Risks:**
- Tokenization quality varies wildly by language — the rule-based fallback (`basicAnalyze.ts`) handles only Greek well. For Hebrew, Syriac, Coptic, rely on Gemini.
- File format parsing is error-prone — validate aggressively and show clear error messages.
- Background analysis after import could be slow — use a Firestore-triggered Cloud Function or run it synchronously with a progress indicator.

**Acceptance criteria:**
- Paste Greek text → tokenized result with lemma and gloss assignments in < 5s.
- Upload a `.txt` file → imported with correct paragraph/sentence detection.
- Import from a valid URL → content extracted and tokenized.
- All existing import adapter tests pass.
- Imported texts are fully searchable via `/api/search`.

---

### Phase 9: Premium UI Polish

**Goal:** Elevate the visual design to market-leading quality — typography, spacing, animations, reading comfort, and responsive layout. This is a reader app; the UI must feel like a beautiful book.

**Files likely touched:**
- `src/index.css` — Tailwind theme configuration
- `src/components/reader/ReadingPane.tsx` — typography and spacing
- `src/components/reader/ReaderToolbar.tsx` — controls layout
- `src/components/Navbar.tsx` — navigation refinement
- `src/pages/Landing.tsx` — marketing page polish
- `src/components/reader/GlossTooltip.tsx` — popover animation
- `src/components/Skeleton.tsx` — loading states
- `src/components/reader/ReaderTutorial.tsx` — onboarding overlay

**Implementation steps:**
1. Refine the typographic scale in `index.css` — use `text-pretty`, balanced line lengths (65-75 chars), proper heading hierarchy.
2. Enhance the parchment/sepia/dark themes with subtle textures (CSS gradients or SVG patterns) and refined color palettes.
3. Add smooth page transitions between reader chapters using `motion` (preserve reading position during transition).
4. Improve the gloss tooltip: fade in, follow cursor, show etymology tab, frequency badge, "add to review" button.
5. Add a "reading mode" that hides all navigation chrome — full-screen text with minimal controls.
6. Polish the Landing page with animated hero, feature showcase, and clear CTA.
7. Ensure all interactive elements have focus styles for keyboard accessibility.
8. Add responsive breakpoint refinement for tablet and mobile (already partially handled by Capacitor).

**Risks:**
- CSS animations can cause layout shifts — use `transform` and `opacity` only, prefer `motion`'s layout animations.
- Visual polish is subjective — establish design tokens first (spacing scale, color palette, type scale) and apply consistently.

**Acceptance criteria:**
- Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90.
- Reader passes 60 fps during chapter navigation and word-click interactions.
- All three themes (parchment, sepia, dark) look distinct and polished.
- Reading mode hides chrome and shows only the text.
- Keyboard navigation works through all interactive elements in the reader.
- No visual regressions in existing tests.

---

### Phase 10: Mobile/Offline/PWA

**Goal:** Deliver a reliable offline reading experience via PWA and native Capacitor shells. Users should be able to read downloaded texts, review vocabulary, and access dictionary entries without network connectivity.

**Files likely touched:**
- `vite.config.ts` — PWA Workbox configuration
- `src/lib/services/offlineService.ts` — offline data management
- `src/lib/services/vocabularyService.ts` — local-first reads
- `src/lib/services/audioService.ts` — offline TTS (pre-download)
- `android/` — Capacitor native tweaks
- `ios/` — Capacitor native tweaks
- `src/pages/Reader.tsx` — offline-aware rendering
- `capacitor.config.ts` — native configuration
- `src/lib/services/libraryService.ts` — download for offline

**Implementation steps:**
1. Audit current PWA service worker — ensure Workbox precaches all static corpus data (`src/data/corpus.ts` is ~485 KB gzipped).
2. Implement a "Download for offline" button on each text — saves the text's token data to IndexedDB via `idb-keyval` or raw IndexedDB.
3. Make vocabulary operations local-first: write to IndexedDB immediately, sync to Firestore when online (add a sync queue for offline mutations).
4. Cache dictionary entries (Phase 5) in IndexedDB with a long TTL.
5. Add an offline indicator bar that shows connection status and pending sync count.
6. For Capacitor: add network state plugin (`@capacitor/network`), file picker for local import, and share sheet integration.
7. Add a simple splash screen and app icon refinement for both platforms.
8. Test offline: disable network, verify reader can load downloaded texts, vocabulary displays cached data, review works with cached SRS data.

**Risks:**
- IndexedDB adds complexity — keep the API simple: `offlineStorage.get(key)`, `offlineStorage.set(key, value)`, `offlineStorage.sync()`.
- Google Fonts are cached by Workbox runtime caching (already configured in `vite.config.ts`).
- Firestore persistence (offline cache) is already built into the Firestore SDK — use `enableIndexedDbPersistence()` for Firestore-backed data.
- Sync conflicts: Firestore's server timestamps and last-write-wins semantics handle most cases. For vocabulary, individual lemma documents mean conflicts are rare.

**Acceptance criteria:**
- Open app, load a text, enable airplane mode — the text is fully readable with all glosses and dictionary lookups.
- Add a word to vocabulary offline → it syncs to Firestore when back online.
- Review cards work offline and sync results on reconnect.
- Capacitor builds on both platforms (`npm run build && npx cap sync`).
- PWA install prompt works on Android Chrome.
- Offline indicator shows connection status accurately.

---

### Phase 11: Classroom/Course Builder

**Goal:** Allow teachers to create courses with assigned readings, vocabulary lists, grammar milestones, and student progress tracking.

**Files likely touched:**
- `src/pages/Courses.tsx` — rebuild from stub to full feature
- `src/components/courses/` — new directory for course components
- `src/lib/services/courseService.ts` — course CRUD
- `api/index.ts` (or `api/routes/courses.ts`) — course API routes
- `src/types/modules.ts` — `Course`, `CourseTextAssignment`, `CourseMembership` types
- `src/pages/Reader.tsx` — course-specific annotations
- `src/pages/Dashboard.tsx` — course progress widgets

**Implementation steps:**
1. Build the data model in Firestore:
   - `courses/{courseId}` — title, description, language, instructorId, start/end dates, enrollment mode (open/invite/closed).
   - `courses/{courseId}/assignments/{assignmentId}` — textId, order, requiredCompletion, grammarConcepts[], vocabThreshold.
   - `courses/{courseId}/members/{userId}` — role (student/ta/instructor), progress per assignment.
2. Build a `CourseEditor` page for instructors: create course, add texts from the library, set reading order, assign grammar milestones.
3. Build a `CourseView` page for students: see progress, navigate to the next uncompleted assignment, view class statistics.
4. Extend the Reader (via URL param `?courseId=...`) to show assignment-level progress, highlight required vocabulary, and block advancement until prerequisites are met.
5. Add a "Classroom" plan tier that enables course creation (gated by SubscriptionContext).

**Risks:**
- Course builder is a complex CRUD feature — invest in the Firestore security rules (`firestore.rules`) to prevent unauthorized access.
- Student progress tracking requires real-time updates — use Firestore `onSnapshot` for live updates.
- This feature targets a smaller audience (teachers) — don't over-invest before validating demand.

**Acceptance criteria:**
- Instructor can create a course, add 3 texts in sequence, and invite a student.
- Student sees the course on their dashboard, opens the first reading, completes it, and the next assignment unlocks.
- Instructor can view student progress (percentage complete per assignment).
- All course data is protected by Firestore security rules.
- Only users with the "Classroom" plan (or instructor role) can create courses.

---

## Summary Dependency Map

```
Phase 1  ────────────────────────────────────── (foundation — unblocks everything)
Phase 2  ─── depends on Phase 1
Phase 3  ─── depends on Phase 1, │ Phase 2 (reader hooks)
Phase 4  ─── depends on Phase 1 (type consolidation), Phase 3 (dictionary data)
Phase 5  ─── depends on Phase 1 (API split), Phase 4 (domain types)
Phase 6  ─── depends on Phase 1, Phase 5 (lemma API)
Phase 7  ─── depends on Phase 4 (morphology domain), Phase 6 (frequency data)
Phase 8  ─── depends on Phase 1 (API split), Phase 5 (lemma lookup for tokenization)
Phase 9  ─── independent (can run in parallel with 5-8)
Phase 10 ─── depends on Phase 1, Phase 3 (dictionary cache)
Phase 11 ─── depends on Phase 2, Phase 6, Phase 8
```

Phases 2-4 can run in parallel after Phase 1. Phase 9 (UI polish) is fully independent and can start at any time.
