# Paleoglossa: Prototype to Production Roadmap

This document outlines the strategic roadmap for transforming Paleoglossa from an AI Studio prototype into a scalable, production-ready SaaS platform specifically optimized for ancient and classical languages.

---

## Phase 1: Data persistence and auth
**Goal:** Migrate from local-only storage to a cloud-synced universally accessible state.
**User value:** Users don't lose their data if they clear browser cache. They can use Paleoglossa on their laptop and pick up right where they left off on their tablet.
**Technical tasks:**
- Complete Firebase Authentication integration (Google + Email/Password).
- Build the data layer mimicking `useKnowledge` but using `vocabularyService.ts` to sync with Firestore's `users/{userId}/vocabulary` collection.
- Implement an optimistic UI update strategy so marking words reads/writes instantly, with background batching to Firestore to reduce document writes.
- Support guest-mode (using `localStorage`) that offers an "Upgrade to save your progress" migration to an authenticated account.
**Files affected:** 
- `src/lib/hooks/useKnowledge.ts`
- `src/lib/services/vocabularyService.ts`
- `src/pages/auth/*`
- `src/lib/services/statsService.ts`
**Risks:** Vocabulary updates happen rapidly during reading. Unoptimized Firestore writes could easily exceed free tier or cause rate-limiting.
**Acceptance criteria:** A user logs in, marks 10 words. They log into a different browser, and those 10 words are accurately marked.
**Estimated complexity:** M

---

## Phase 2: Real reader workflow
**Goal:** Optimize the `Reader` to handle massive texts without lag and provide a "flow state" reading experience.
**User value:** A frictionless, immersive reading experience where interaction (marking words) is intuitive and lightning fast. 
**Technical tasks:**
- Implement pagination or virtualized rendering for long chapters to avoid React DOM lag (rendering 5000 individual `<span>` tokens is extremely slow).
- Add robust keyboard shortcuts: `1-4` for status, `Left/Right` for pagination.
- Implement the "Paging" action: Moving to the next page automatically marks all un-clicked words on the previous page as "Known".
- Decouple `LexDrawer` state so fetching AI insights doesn't block the main Reader render cycle.
**Files affected:**
- `src/pages/Reader.tsx`
- `src/components/LexDrawer.tsx`
- `src/components/reader/*`
**Risks:** Virtualized text with mixed RTL/LTR (Hebrew vs Greek) and tooltips is notoriously difficult to layout correctly.
**Acceptance criteria:** User opens a 10,000-word Latin text. Rendering takes < 500ms. User presses `Right Arrow` and instantly pages forward, marking 200 words as "Known" in a batch update.
**Estimated complexity:** L

---

## Phase 3: Import and AI text analysis
**Goal:** Transform the raw import pipeline into a robust, asynchronous processing engine.
**User value:** Users can upload PDFs, EPUBs, or raw text and immediately get grammatically parsed, lemmatized, and translated reading material.
**Technical tasks:**
- Upgrade `AIClient.analyzeText` to handle long inputs by chunking them securely within context limits.
- Add server-side parsing for EPUB, PDF, and HTML uploads, extracting plain text before passing to Gemini.
- Implement a UI step where users verify or correct AI-generated tokenization/lemmatization before finalizing the import.
**Files affected:**
- `src/pages/Import.tsx`
- `server.ts`
- `src/lib/services/importService.ts`
- `src/lib/services/aiClient.ts`
**Risks:** AI tokenization hallucinations (e.g., Gemini splitting a valid Greek word incorrectly). Rate limits and API costs running large texts through LLMs.
**Acceptance criteria:** User uploads a 5-page Koine Greek PDF. The app extracts text, chunks it, hits the `/api/ai/analyze` route, and saves a perfectly segmented `ImportedText` to Firestore.
**Estimated complexity:** XL

---

## Phase 4: SRS and vocabulary mastery
**Goal:** Deploy a mathematically proven Spaced Repetition System (SRS).
**User value:** Users naturally acquire the language by reviewing the exact words they are about to forget, maximizing retention.
**Technical tasks:**
- Implement the FSRS (Free Spaced Repetition Scheduler) algorithm within `reviewService.ts`.
- Expand Firestore `VocabularyItem` schema to track `ease`, `interval`, `nextReview`, and `lapses`.
- Overhaul `Review.tsx` to handle flashcard sessions: Front (Target Word + Context Sentence) -> Back (Definition + Grammar).
- Implement session daily limits and a review queue in `dashboard`.
**Files affected:**
- `src/pages/Review.tsx`
- `src/pages/Dashboard.tsx`
- `src/lib/services/reviewService.ts`
**Risks:** Fetching the "due now" list quickly for users with 10,000+ vocabulary items. Timezone mismatches causing reviews to appear at the wrong time.
**Acceptance criteria:** User completes a text. Dashboard says "15 Reviews Due". They go to Review, rate a hard word "Learning (1)", and it schedules for tomorrow. They rate an easy word "Familiar (3)" and it schedules for next week.
**Estimated complexity:** M

---

## Phase 5: Library, recommendations, and public lessons
**Goal:** Transform the app into a content discovery platform.
**User value:** An endless, engaging supply of reading material at exactly the right difficulty level.
**Technical tasks:**
- Add `isPublic` flag to `ImportedText` in Firestore.
- Build "Fork" logic: If a user reads a public text, copy it to their progress array but use the shared base text.
- Develop a sorting algorithm in `LibraryService` that accurately measures `% Known` dynamically without requiring 5000+ DB lookups per lesson.
- Implement course grouping ("The Iliad - Book 1-24").
**Files affected:**
- `src/pages/Library.tsx`
- `src/lib/services/libraryService.ts`
**Risks:** Copyright infringement if users make copyrighted material public. High Firestore read costs if dynamically matching global libraries to user vocab lists.
**Acceptance criteria:** User searches "Genesis". They find a public import of Genesis 1, see that it is "85% Known", and click to read it.
**Estimated complexity:** L

---

## Phase 6: Audio and mobile/PWA
**Goal:** Enable auditory learning and on-the-go access.
**User value:** Users can practice listening comprehension, which solidifies reading skills, easily doing it on their commute.
**Technical tasks:**
- Configure `vite-plugin-pwa` for installing the app on iOS/Android.
- Integrate Google Cloud TTS (or Gemini audio API) to generate audio for sentences.
- Build an audio player component in the Reader that highlights sentences as they play (time-syncing).
**Files affected:**
- `vite.config.ts`
- `src/pages/Reader.tsx`
- `server.ts`
- `src/components/reader/AudioPlayer.tsx`
**Risks:** Synthesized voice quality for dead languages (Latin/Ancient Greek) is often poor or reads with wrong pronunciation (e.g. Modern Greek parsing).
**Acceptance criteria:** User installs app to iPhone Home Screen. Opens a text, presses play. High-quality audio plays and the sentence turns gold on the screen matching the audio.
**Estimated complexity:** L

---

## Phase 7: Ancient-language scholarly depth
**Goal:** Tailor the reading model specifically for highly inflected dead languages.
**User value:** Users get deeper structural explanations, crucial for complex grammar, rather than just 1-to-1 definitions.
**Technical tasks:**
- Refine the `ParadigmModal` to natively fetch tables from scholarly APIs (e.g., Morpheus for Latin/Greek) or use highly-structured AI generation.
- Integrate literal/interlinear translation toggles.
- Improve `transliterate.ts` to handle edge cases like Hebrew Niqqud properly.
**Files affected:**
- `src/components/LexDrawer.tsx`
- `src/components/reader/ParadigmModal.tsx`
- `src/lib/transliterate.ts`
**Risks:** Overwhelming beginners with too much morphological data.
**Acceptance criteria:** Clicking a Latin verb opens LexDrawer. User clicks "Paradigm", gets a visually clean table showing it's a 3rd Person Plural Pluperfect Active Indicative.
**Estimated complexity:** M

---

## Phase 8: Payments, admin, analytics, production hardening
**Goal:** Create a sustainable, secure business.
**User value:** The product stays alive, receives updates, and acts responsibly with user data.
**Technical tasks:**
- Implement Stripe Checkout and Webhooks (Free Tier = 5 imports/mo, Premium = Unlimited + AI Insights).
- Harden all `firestore.rules` (users can only read their own vocab, public lessons are read-only).
- Implement PostHog or Google Analytics to track flow drops (Where do users stop reading?).
- Create a simple Admin view to delete flagged public content.
**Files affected:**
- `server.ts`
- `src/pages/Subscription.tsx`
- `firestore.rules`
**Risks:** Dealing with fraud/chargebacks. Free users abusing AI routes and racking up Gemini API bills.
**Acceptance criteria:** A user tries an AI Insight, is told they are out of credits, clicks upgrade, pays $10/mo via Stripe, and the feature unlocks immediately.
**Estimated complexity:** XL
