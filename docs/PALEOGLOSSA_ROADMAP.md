# Paleoglossa: Technical Implementation Roadmap

> **Audit date:** 2026-05-11 · **Updated:** 2026-05-17
> **Target:** A serious platform for studying ancient languages through real texts.
> **Current state:** React 19 + Vite 6 + Firebase/Firestore + Express 5 + Gemini AI.
> **Guiding principle:** Extend what exists; build new modules only where gaps cannot be filled.

---

## 1. Current Architecture Summary

### Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 19, TypeScript (strict), Vite 6 | SPA with client-side routing |
| **CSS** | Tailwind CSS v4 (via `@tailwindcss/vite`), custom parchment/sepia/dark themes | No PostCSS config; pure Vite plugin |
| **Routing** | React Router DOM v7 | `/app/*` for authenticated pages, `/auth/*` for auth, `/` public landing |
| **State** | React hooks + context (`useKnowledge`, `useSettings`, `useAuth`) | No external state library |
| **Server** | Express 5 + `tsx` runtime | Serves Vite dev/prod, exposes `/api/ai/*` routes |
| **AI** | Gemini 2.0 Flash via `@google/genai` | Word explain, translate, analyze, OCR, scrape |
| **Database** | Firestore (9 collections) | Indexes defined in `firestore.indexes.json` |
| **Auth** | Firebase Auth (Google + Email/Password) | Guest/demo mode supported |
| **i18n** | i18next + react-i18next | 8 languages (en, es, de, pt, fr, ru, zh, tr) |
| **SRS** | SM-2 algorithm | Custom implementation in `src/lib/srs/sm2.ts` |
| **Validation** | Zod | AI responses, import validation |
| **Charts** | Recharts | Dashboard statistics |
| **Deployment** | Vercel + GitHub Actions | Auto-deploy on push to `main` via `deploy.yml`; CI on every PR |
| **Monitoring** | Sentry (`@sentry/react`) | Init in `main.tsx`; set `VITE_SENTRY_DSN` in Vercel env |

### Firestore Collections

| Collection Path | Entity | Used By |
|----------------|--------|---------|
| `users/{uid}` | User profile + aggregated stats | Auth, Dashboard |
| `users/{uid}/vocabulary/{termId}` | Per-lemma word knowledge + SRS | Reader, Review, Vocabulary |
| `users/{uid}/settings/main` | User preferences | Reader, Settings |
| `users/{uid}/imports/{importId}` | User-uploaded texts | Import, Reader, Library |
| `users/{uid}/reviewLogs/{logId}` | SRS review history | Review, Statistics |
| `users/{uid}/readingProgress/{textId}` | Per-text reading position | Reader, Dashboard |
| `texts/{textId}` | Public curated texts | Library, Reader |
| `lemmas/{lemmaId}` | Lemma metadata (future) | — |

### Existing Features (Maturity)

| Feature | Status | Quality |
|---------|--------|---------|
| Ancient text reader | ✅ Complete | Good — two reading modes, keyboard shortcuts, parallel text |
| Word knowledge states | ✅ Complete | 6 states (NEW→KNOWN + IGNORED), color-coded |
| Spaced repetition (SM-2) | ✅ Complete | Review page, 4 ratings, multiple card types |
| AI word/phrase explanations | ✅ Complete | Gemini-powered, cached per session |
| Text import (paste/file/URL/OCR) | ✅ Complete | 4 source types, adapter-based importers |
| i18n | ✅ Complete | All user-facing strings in 8 languages (en, es, de, pt, fr, ru, zh, tr) |
| Reading progress tracking | ✅ Complete | Stats, streak, daily goals |
| Settings panel | ✅ Complete | Theme, font, audio, goals, languages |
| Dashboard/Statistics | ✅ Complete | Charts, streak, vocabulary stats |
| User auth (Google/Email) | ✅ Complete | Login, signup, password reset, demo mode |
| Corpus library | ⚠️ Partial | 15+ curated texts across 11 languages; no recommendation engine |
| Lexicon integration | ⚠️ Partial | External dictionary links + lemma lookup; no paradigm browser |
| Grammar pathways | ⚠️ Partial | Grammar reference page and concepts exist; no interactive curriculum |
| Corpus search | ✅ Complete | Multi-source lemma + full-text search (`Search.tsx`) |
| Syntax/treebank viewer | 🚧 Stub | UI scaffold in `Syntax.tsx`; no treebank data wired |
| AI philology tutor | ✅ Complete | Conversational tutor with chat history (`Tutor.tsx`) |
| Research notebook | ✅ Complete | Per-user notebooks with Firestore sync (`Notebooks.tsx`) |
| Manuscript/epigraphy lab | 🚧 Stub | Placeholder only; gated in nav with "Coming Soon" |
| Audio/pronunciation lab | ✅ Functional | TTS testing + pronunciation guides (`AudioLab.tsx`) |
| Classroom/course builder | 🚧 Partial | Models + card UI exist; detail views incomplete; gated in nav with "Coming Soon" |
| Morphology browser | ⚠️ Partial | Token-level tags, no browse/search |
| Parallel text alignment | ⚠️ Partial | Sentence-level parallel, not word-aligned |

### Known Technical Debt

1. ~~**No test suite**~~ ✅ Resolved — Vitest + React Testing Library + Playwright E2E in place
2. ~~**No CI/CD**~~ ✅ Resolved — `ci.yml` (type-check, lint, test, build on every PR) + `deploy.yml` (auto-deploy to Vercel on push to `main`)
3. ~~**No error monitoring**~~ ✅ Resolved — `@sentry/react` initialized in `main.tsx`; set `VITE_SENTRY_DSN` in Vercel env to activate
4. **Monolithic `corpus.ts`** (2508 lines) — all curated texts in one file; needs per-text dynamic imports
5. **Mixed dynamic/static Firebase imports** — `Settings.tsx` uses dynamic import while other files use static
6. **Two legacy word info components** — `LexDrawer` and `FastWordPopup` are unused but maintained
7. **Duplicate type definitions** — `types/corpus.ts` vs `types/library.ts` have overlapping interfaces
8. **Stale closure in `useVocabulary.markPageAsSeen`** — reads `knowledge` from closure, not fresh state
9. **Build chunk warning** — 2MB JS bundle from monolithic Firebase import; switch to modular tree-shaken imports
10. **No E2E tests for critical reader path** — open text → tap word → mark known → review card has no coverage

---

## 2. Recommended Feature Modules

### Module A: Text & Corpus Engine (Extend)
**What exists:** Reader page, ReadingPane, corpus.ts, import pipeline, parallel text toggle.
**Gaps:** No multi-text browsing, no search, no versioned corpus metadata, no tagging.

**Extend:**
- `CorpusDB` into a service with lazy-loaded text chunks (avoid 2508-line file)
- Add text metadata schema (genre, period, dialect, difficulty score)
- Add user-facing library browser with filter/sort
- Build full-text search index (Firestore `array-contains` for lemmas, or Algolia/Typesense)
- Add text versioning (diplomatic → normalized → translated layers)

**Out of scope:** Do not rewrite the Reader. Extend it with plugins/hooks.

### Module B: Lexicon & Morphology Browser (New + Extend)
**What exists:** Token-level morphology tags, `getWordInfo`, external dictionary links.
**Gaps:** No lemma browser, no declension/conjugation tables, no cross-referencing.

**Build:**
- Lemma index page (`/app/lemma/:lemmaId`) with full morphology paradigm
- Lemma-to-lemma cross-references (etymology, cognates, synonyms)
- Inflected form → lemma resolution via search
- Offline-parsable paradigm tables for major languages (Greek, Latin, Hebrew, Syriac, Coptic, Sanskrit)

**Extend:**
- `ParadigmModal` to support offline tables (not just AI-generated)
- `LexDrawerPanel` to show full lemma entry (not just gloss)

### Module C: Corpus Search Engine (New)
**Build:**
- Lemma-aware search: `λέγω` matches all inflected forms
- Proximity search (word n-grams within N tokens)
- Morphology filter: search by POS + case + number (e.g., "all aorist active indicatives in John 1")
- Search results with context (KWC — Key Word in Context)
- Cross-linguistic search (same lemma across different corpora)

**Backend:** Firestore `array-contains` for pre-computed lemma arrays on sentences.
**Heavy search:** Consider Typesense or Meilisearch for full-text.

### Module D: Syntax & Treebank Viewer (New)
**Build:**
- Import/parse treebank data (PROIEL, Gorman, Perseus dependency trees)
- Visualize dependency graph for any sentence
- Color-coded dependency relations (subject, object, adjunct, etc.)
- Click-to-traverse: click a node to highlight its dependents
- Integration with Reader: "Show Syntax" toggle on a sentence

**Data sources:** PROIEL treebanks (Greek, Latin, Gothic, Armenian), Gorman treebank (Greek NT), Perseus Ancient Greek and Latin Dependency Treebanks.

### Module E: Grammar Pathways (New)
**Build:**
- Grammar concept graph (e.g., "Present Active Indicative → Imperfect Active Indicative → Aorist Active Indicative")
- Per-language grammar progression
- Grammar concept pages with examples extracted from the corpus
- Integration with SRS: When a learner encounters a new verb form in a text, surface the relevant grammar lesson
- Quiz: Identify the form of a highlighted word in context

**Data:** Structured grammar JSON per language (not AI-generated on the fly).

### Module F: AI Philology Tutor (New)
**Build:**
- Conversational AI tutor grounded in the corpus
- Context-aware: "Why is this word in the dative here?"
- Socratic prompts: "What case is `λόγῳ` and why does the author use it here?"
- Grammar explanations with real examples from the student's current text
- Morphology drills: "Parse this verb" with AI feedback
- Essay feedback: student writes a composition in Latin/Greek, AI evaluates

**Architecture:** Chat history stored in Firestore per user per session. AI powered by Gemini with retrieval-augmented generation (RAG) over the corpus + grammar database.

### Module G: Research Notebook (New + Extend Notes)
**What exists:** `Notes.tsx` page, note-taking on vocabulary items.
**Extend:**
- Text-anchored notes: highlight a passage and add a note anchored to specific verses/lines
- Notebook collections: organize notes into research notebooks
- Export: Markdown, PDF, JSON export of notebook
- Annotation layers: public/private, peer-reviewed
- Cross-text note linking: "see also John 1:1"

**Model:** `notes/{noteId}` collection with `userId`, `textId`, `sentenceRange`, `tokenRange`, `content`, `tags`, `notebookId`.

### Module H: Manuscript & Epigraphy Lab (New)
**Build:**
- Diplomatic edition viewer: image + transcription side-by-side
- Line-by-line alignment of manuscript image to transcription
- Variant apparatus: critical apparatus display
- Epigraphy: squeeze/photo overlay with line art tracing
- Support for TEI XML import (Text Encoding Initiative)

**Data model:** `manuscripts/{msId}` with image URLs, transcription layers, variant apparatus.
**Complexity:** Very high. Start minimal: image + text side-by-side only.

### Module I: Audio & Pronunciation Lab (New + Extend)
**What exists:** `ReaderAudioBar` with play/pause, speed control, sentence looping.
**Extend:**
- Word-by-word audio highlighting synchronized with TTS
- User recording + playback for pronunciation practice
- Waveform visualization
- IPA transcription display alongside text
- Restored vs. Erasmian vs. Modern pronunciation toggles (for Greek)

**Build:**
- Pronunciation guide page (`/app/pronunciation/:langId`)
- Minimal pair drills
- Audio export (download sentence/word as MP3)

### Module J: Classroom & Course Builder (New)
**Build:**
- Course model: sequence of texts with learning objectives
- Assignment model: teacher assigns texts to students with due dates
- Group model: teachers can create classes, invite students
- Student progress dashboard (teacher view)
- Fork/clone corpus texts for course-specific annotation

**Auth:** Extend Firebase Auth with custom claims for `role: teacher`.
**Data model:** `courses/{courseId}`, `courses/{courseId}/members/{uid}`, `courses/{courseId}/assignments/{assignmentId}`.

### Module K: Explorer/Discover Mode (New UI)
**Build:**
- Corpus browser with metadata cards (language, period, genre, difficulty, word count)
- "Read a random passage" button
- Beginner/intermediate/advanced text recommendations based on vocabulary overlap
- "Similar texts" recommendations using lemma-frequency fingerprinting
- Daily reading suggestion based on SRS review queue

---

## 3. Database / Model Changes

### New Firestore Collections

```typescript
// === LEMMAS (public, read-only by all authenticated users) ===
interface LemmaDoc {
  id: string;                    // Canonical lemma (e.g. "λέγω")
  languageId: string;            // "grc", "lat", "hbo", etc.
  gloss: string;                 // Primary English gloss
  partOfSpeech: string;
  morphology: {                  // Pre-computed paradigm tables
    forms: InflectedForm[];      // [{ surface: "λέγω", features: {...} }, ...]
  };
  frequency: number;             // Occurrence count across corpus
  rank: number;                  // Frequency rank
  cognates: string[];            // Related lemma IDs
  etymology?: string;
  semanticDomain?: string[];
  notes?: string;
}
// Collection: lemmas/{lemmaId}

// === GRAMMAR_CONCEPTS (public, read-only) ===
interface GrammarConcept {
  id: string;
  languageId: string;
  name: string;                  // "Present Active Indicative"
  category: string;              // "verb", "noun", "syntax"
  difficulty: number;            // 1-10
  prerequisites: string[];       // GrammarConcept IDs
  description: string;
  examples: GrammarExample[];    // [{ textId, sentenceIdx, tokenIds, gloss }]
  relatedConcepts: string[];
}
// Collection: grammarConcepts/{conceptId}

// === NOTES (extend existing) ===
interface ResearchNote {
  id: string;
  userId: string;
  notebookId?: string;
  textId: string;
  sentenceRange?: [number, number];
  tokenRange?: [number, number];
  content: string;               // Markdown body
  tags: string[];
  visibility: 'private' | 'shared' | 'public';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
// Collection: users/{uid}/notes/{noteId}

// === NOTEBOOKS ===
interface Notebook {
  id: string;
  userId: string;
  title: string;
  description: string;
  color: string;
  sortOrder: number;
}
// Collection: users/{uid}/notebooks/{notebookId}

// === COURSES ===
interface Course {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  languageId: string;
  texts: CourseTextAssignment[];  // [{ textId, order, week, learningObjectives }]
  isPublic: boolean;
  createdAt: Timestamp;
}

interface CourseMembership {
  userId: string;
  role: 'student' | 'teacher' | 'assistant';
  progress: Record<string, number>; // textId -> completion %
  joinedAt: Timestamp;
}
// Collections: courses/{courseId}, courses/{courseId}/members/{uid}

// === SYNTAX_TREES ===
interface SyntaxTree {
  id: string;
  textId: string;
  sentenceIndex: number;
  tokens: SyntaxToken[];
  relations: DependencyRelation[];  // [{ head: tokenIdx, dependent: tokenIdx, relation: "nsubj" }]
  source: string;                    // "proiel", "gorman", "perseus", "ai-generated"
}
interface SyntaxToken {
  idx: number;
  form: string;
  lemma: string;
  pos: string;
  features: Record<string, string>;
}
interface DependencyRelation {
  head: number;
  dependent: number;
  relation: string;                 // Universal Dependencies relation
}
// Collection: syntaxTrees/{treeId}

// === MANUSCRIPTS ===
interface Manuscript {
  id: string;
  textId: string;
  label: string;                    // "Codex Sinaiticus", "P52", etc.
  languageId: string;
  dateRange: [number, number];      // CE range
  images: ManuscriptImage[];
  transcription: TranscriptionLayer[];
  apparatus?: VariantReading[];
}
// Collection: manuscripts/{msId}

// === AUDIO ===
interface AudioRecording {
  id: string;
  userId: string;
  textId?: string;
  sentenceIndex?: number;
  wordIndex?: number;
  audioUrl: string;
  duration: number;
  recordingType: 'tts' | 'user';
  pronunciationMode?: 'restored' | 'erasmian' | 'modern' | 'reconstructed';
  createdAt: Timestamp;
}
// Collection: users/{uid}/audioRecordings/{audioId}
```

### Firestore Indexes Needed

```
- syntaxTrees: textId ASC, sentenceIndex ASC
- notes: userId ASC, textId ASC
- notes: userId ASC, notebookId ASC
- lemmas: languageId ASC, rank ASC
- lemmas: languageId ASC, partOfSpeech ASC
- grammarConcepts: languageId ASC, difficulty ASC
}

### Storage

- Migration from `corpus.ts` (in-source) to Firestore `texts/{textId}` for all curated texts
- Manuscript images → Firebase Storage / `manuscripts/{msId}/{imageName}.jpg`
- User audio recordings → Firebase Storage / `audio/{userId}/{recordingId}.mp3`
- User notebook exports → Firebase Storage / `exports/{userId}/{notebookId}.md`

---

## 4. API Routes / Services Needed

### New Server Routes (`server.ts` additions)

```
GET    /api/corpus/search?q=<query>&lang=<langId>&morph=<filters>
         → Full-text + morphology search across corpus
GET    /api/corpus/texts?lang=<langId>&genre=<genre>&difficulty=<n>
         → Corpus metadata listing with filters
GET    /api/lemmas/:lemmaId
         → Full lemma entry (forms, frequency, cognates)
GET    /api/lemmas?q=<prefix>&lang=<langId>
         → Lemma autocomplete/search suggestion
GET    /api/syntax/:textId/:sentenceIdx
         → Dependency tree data for a sentence
GET    /api/manuscripts/:msId
         → Manuscript metadata + image URLs
POST   /api/ai/tutor
         → Conversational AI tutor (chat history + context)
POST   /api/ai/pronunciation
         → IPA + syllable breakdown for a word/phrase
POST   /api/ai/quiz
         → Generate morphology quiz question from text context
POST   /api/audio/tts
         → Generate TTS audio for a sentence/word (cached)
```

### New Service Files

```
src/lib/services/
  ├── corpusService.ts        # Corpus text loading, metadata, search indexing
  ├── lemmaService.ts         # Lemma lookup, paradigm tables, frequency
  ├── grammarService.ts       # Grammar concept retrieval, prerequisites
  ├── notebookService.ts      # CRUD for notes, notebooks, export
  ├── syntaxService.ts        # Treebank import/query
  ├── manuscriptService.ts    # Manuscript CRUD, TEI import
  ├── audioService.ts         # TTS generation, user recording storage
  ├── courseService.ts        # Course/assignment/group management
  └── searchService.ts        # Full-text search (Firestore + external index)
```

---

## 5. Frontend Pages / Components Needed

### New Pages

| Route | Page | Module | Priority |
|-------|------|--------|----------|
| `/app/texts` | Corpus browser / library explorer | A | High |
| `/app/lemma/:lemmaId` | Lemma detail page (full entry) | B | High |
| `/app/search` | Cross-corpus search | C | High |
| `/app/grammar/:langId` | Grammar concept browser | E | Medium |
| `/app/grammar/:langId/:conceptId` | Single grammar concept + examples | E | Medium |
| `/app/notebooks` | Notebook list for the user | G | Medium |
| `/app/notebooks/:notebookId` | Single notebook with notes | G | Medium |
| `/app/tutor` | AI conversational tutor | F | Medium |
| `/app/courses` | Course browser (teacher dashboard) | J | Low |
| `/app/courses/:courseId` | Single course view | J | Low |
| `/app/pronunciation` | Pronunciation lab | I | Low |
| `/app/manuscripts` | Manuscript browser | H | Low |
| `/app/manuscripts/:msId` | Manuscript reader (image + text) | H | Low |

### New Components

```
src/components/
├── corpus/
│   ├── CorpusBrowser.tsx       # Filterable grid/list of texts
│   ├── TextMetadataCard.tsx    # Text card with stats
│   └── TextDifficultyBadge.tsx # Difficulty indicator
├── lemma/
│   ├── LemmaHeader.tsx         # Lemma + gloss + frequency
│   ├── ParadigmTable.tsx       # Offline paradigm tables
│   └── InflectedFormList.tsx   # All attested forms in corpus
├── search/
│   ├── SearchBar.tsx           # Global search input
│   ├── SearchResults.tsx       # Results list with context
│   ├── MorphologyFilter.tsx    # POS/case/number filter UI
│   └── KWCViewer.tsx           # Key Word in Context display
├── syntax/
│   ├── TreebankViewer.tsx      # Dependency graph SVG/Canvas
│   ├── RelationLegend.tsx      # Color coding for dep relations
│   └── SyntaxToggle.tsx        # "Show tree" button in Reader
├── grammar/
│   ├── ConceptGraph.tsx        # Prerequisite dependency graph
│   ├── ConceptCard.tsx         # Single grammar concept summary
│   └── GrammarExample.tsx      # Example from corpus
├── tutor/
│   ├── TutorChat.tsx           # Chat UI with message history
│   ├── TutorMessage.tsx        # Single message (user or AI)
│   └── ContextIndicator.tsx    # "Based on [text:verse]"
├── notebook/
│   ├── NotebookList.tsx        # List of notebooks
│   ├── NotebookEditor.tsx      # Markdown note editor
│   ├── NoteCard.tsx            # Single note in a notebook
│   └── ExportButton.tsx        # MD/PDF/JSON export
├── manuscript/
│   ├── ManuscriptViewer.tsx    # Image + transcription panel
│   ├── DiplomaticLine.tsx      # Single line alignment
│   └── ApparatusDisplay.tsx    # Critical apparatus
├── audio/
│   ├── PronunciationGuide.tsx  # IPA + audio for phonemes
│   ├── RecorderWidget.tsx      # Record/playback UI
│   └── WaveformDisplay.tsx     # Audio waveform
├── course/
│   ├── CourseCard.tsx          # Course summary card
│   ├── AssignmentList.tsx      # Text assignments with dates
│   └── StudentProgress.tsx     # Per-student progress table
└── reader/
    ├── SyntaxOverlay.tsx       # Treebank overlay on text
    ├── NoteAnchor.tsx          # Text anchor for notes
    ├── LemmaTooltip.tsx        # Hover tooltip with lemma data
    └── AudioWordHighlight.tsx  # TTS word-level sync
```

### Reader Integration Points

The Reader page should be extended (not rewritten) via:
1. **Plugin-based toolbar items** — syntax toggle, note anchor mode, pronunciation mode
2. **Overlay layers** — treebank visualization on top of text, manuscript image overlay
3. **Context menu** — right-click/long-press word to add note, look up in lexicon, save as flashcard
4. **Side panel tabs** — LexDrawerPanel gains tabs for: Lexicon, Notes, Syntax, AI Tutor

---

## 6. Implementation Phases

### Phase 0: Foundation & Cleanup (2-3 weeks)
**No new features. Pay down technical debt before building up.**

- [ ] Add Vitest + React Testing Library; write smoke tests for existing pages
- [ ] Set up GitHub Actions CI: lint → typecheck → test → build
- [ ] Decompose `corpus.ts` into per-text modules or Firestore documents
- [ ] Consolidate duplicate types (`types/corpus.ts` + `types/library.ts`)
- [ ] Remove unused components (`LexDrawer`, `FastWordPopup`)
- [ ] Fix stale closure in `useVocabulary.markPageAsSeen` (`src/lib/hooks/useVocabulary.ts:96-103`)
- [ ] Bundle optimization: lazy-load Firebase modules where possible
- [ ] Add Sentry or equivalent error monitoring
- [ ] Add `AGENTS.md` with lint/typecheck/build commands for AI tooling
- [ ] Refactor `server.ts` route handlers into separate modules

**Risk:** No tests = changes may regress existing behavior. This phase mitigates that.

### Phase 1: Text & Corpus Engine (3-4 weeks)

- [ ] `corpusService.ts` — lazy-load text chunks from Firestore
- [ ] Text metadata schema migration (genre, period, dialect, difficulty)
- [ ] Corpus browser page (`/app/texts`) with filter/sort
- [ ] Text cards with word count, difficulty, completion stats
- [ ] Lemma index built from corpus tokens → `lemmas/{lemmaId}` in Firestore
- [ ] Lemma detail page (`/app/lemma/:lemmaId`) with paradigm tables
- [ ] Lemma tooltip on hover in Reader
- [ ] Inflected form search: type any form, get lemma + parse

**Deliverable:** A user can browse the corpus, click a text to read it, click any word to see its full lemma entry with paradigm, and look up any inflected form.

### Phase 2: Search & Syntax (3-4 weeks)

- [ ] `searchService.ts` — full-text + lemma search across corpus
- [ ] Search page (`/app/search`) with morphology filter
- [ ] KWC (Key Word in Context) display for search results
- [ ] Syntax tree data import (PROIEL, Gorman, Perseus)
- [ ] `TreebankViewer.tsx` — dependency graph rendering
- [ ] Syntax toggle in Reader — "Show tree" for current sentence
- [ ] Cross-linguistic lemma search

**Deliverable:** A user can search across the entire corpus by lemma, inflected form, or morphology filter; view syntax trees inline; and see dependency relations for any sentence.

### Phase 3: Grammar & AI Tutor (3-4 weeks)

- [ ] Grammar concept model and structured data
- [ ] Grammar concept browser (`/app/grammar/:langId`)
- [ ] Grammar concept page with corpus examples
- [ ] Concept graph visualization (prerequisites)
- [ ] SRS integration: surface relevant grammar when learner encounters new forms
- [ ] AI tutor chat page (`/app/tutor`)
- [ ] Context-aware AI: "Why dative here?" with current text context
- [ ] AI morph parse quiz: "Parse this verb form"
- [ ] AI feedback on user-written compositions

**Deliverable:** A user can explore a structured grammar curriculum, ask AI questions about morphology in context, and test themselves with AI-generated quizzes.

### Phase 4: Research Notebook (2-3 weeks)

- [ ] Notebook CRUD (create/list/rename/delete)
- [ ] Text-anchored notes (select text → add note)
- [ ] Note tagging, search within notebooks
- [ ] Note rendering in Reader (highlighted text, click to view note)
- [ ] Export: Markdown, PDF
- [ ] Cross-text note linking

**Deliverable:** A user can take notes anchored to specific passages, organize them in notebooks, and export them.

### Phase 5: Audio & Pronunciation (2-3 weeks)

- [ ] Server-side TTS caching (avoid regenerating same sentence)
- [ ] Word-by-word audio highlighting with waveform
- [ ] User recording + playback for pronunciation practice
- [ ] IPA transcription display
- [ ] Pronunciation mode switching (restored/Erasmian/modern)
- [ ] Pronunciation guide page

**Deliverable:** A user can hear any sentence pronounced, record themselves, compare waveforms, and learn pronunciation rules.

### Phase 6: Manuscript & Epigraphy (3-4 weeks)

- [ ] Manuscript model + Firestore collection
- [ ] Manuscript viewer: image + transcription side-by-side
- [ ] Line-level alignment
- [ ] Critical apparatus display
- [ ] TEI XML import
- [ ] Manuscript browser page

**Deliverable:** A user can view manuscript images alongside transcriptions, see variant readings, and explore the manuscript tradition.

### Phase 7: Classroom & Courses (3-4 weeks)

- [ ] Course model + Firestore collection
- [ ] Teacher role via Firebase custom claims
- [ ] Course creation: select texts, set order, add objectives
- [ ] Student enrollment flow
- [ ] Assignment tracking with due dates
- [ ] Teacher dashboard: per-student progress, completion rates
- [ ] Fork/clone texts for course-specific annotations

**Deliverable:** Teachers can create courses, assign texts, and track student progress through the corpus.

### Phase 8: Production Hardening (ongoing)

- [ ] Rate limiting on all API routes
- [ ] Firestore security rules audit and hardening
- [ ] Performance audit: chunk size, image optimization, lazy loading
- [ ] Accessibility audit: ARIA labels, keyboard navigation, screen reader support
- [ ] E2E tests with Playwright for critical flows (auth, reader, review)
- [ ] Error reporting dashboard
- [ ] Analytics: track feature usage to guide priorities
- [ ] Documentation: architecture docs, contribution guide, API reference

---

## 7. Risks & Technical Debt

### Architecture Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Firestore query limits for search | High | Use dedicated search engine (Typesense/Meilisearch) for full-text |
| Firestore `in` queries limited to 30 values | Medium | Batch lemma lookups; use `array-contains-any` with pagination |
| Corpus data size in Firestore (100+ texts) | Medium | Pre-compute lemma indexes; lazy-load text chunks |
| AI API costs for tutor + quiz features | Medium | Cache common responses; rate-limit per user; batch generation |
| Real-time dependency tree rendering | Medium | Use SVG with React memo; virtualize for long sentences |
| Audio storage costs | Low | TTS generated on-demand with LRU cache; user recordings compressed |
| No offline support | Medium | Service Worker + IndexedDB for cached texts and vocabulary |
| Mixed RTL/LTL rendering in treebank | Low | Test with Hebrew/Aramaic/Syriac early; SVG respects `dir` attribute |

### Technical Debt to Resolve Early

1. **No test suite** — highest priority. Without tests, refactoring is risky.
2. **Monolithic corpus.ts** — must be decomposed before adding more texts.
3. **Duplicate type definitions** — `types/corpus.ts` and `types/library.ts` conflict.
4. **Unused components** — `LexDrawer`, `FastWordPopup` confuse new developers.
5. **Build chunk size** — 2MB+ JS bundle will grow worse with new features.
6. **No CI/CD** — every change is a manual deploy risk.
7. **Stale closure bug** — `markPageAsSeen` persists wrong data for the current session.

### Licensing & Corpus Considerations

| Corpus | License | Status |
|--------|---------|--------|
| SBLGNT (Greek NT) | SBLGNT — freely distributable | ✅ In corpus |
| MorphGNT (morphology) | CC-BY-SA 4.0 | ✅ In corpus |
| OSHB (Hebrew Bible) | CC0 1.0 Universal | ✅ In corpus |
| Perseus (Latin/Greek) | CC-BY-SA 3.0 | ✅ In corpus |
| Project Gutenberg | Public domain | ✅ In corpus |
| PROIEL treebanks | CC-BY-NC-SA 4.0 | ❌ Needs attribution handling |
| Gorman treebank (Greek NT) | CC-BY 4.0 | ❌ Needs import |
| Perseus treebanks | CC-BY-SA 3.0 | ❌ Needs import |
| STEPBible data | CC-BY 4.0 | ✅ In importers |
| Open Greek & Latin | CC-BY-SA 4.0 | ✅ In importers |

**Policy:**
- All corpus texts must include `SourceAttribution` with license, URL, and author.
- User-imported texts are private by default; public sharing requires explicit opt-in.
- AI-generated content (explanations, translations) is presented as "AI-generated" with disclaimer.
- For copyrighted public domain annotations (like MorphGNT), proper attribution is displayed in the UI.

---

## 8. First Implementation Recommendation

### Start with: Phase 0 — Foundation & Cleanup

**Rationale:** The codebase has substantial technical debt that will compound as new features are added. Spending 2-3 weeks on cleanup before adding features will:

1. Make all subsequent work faster (tests catch regressions instantly)
2. Reduce cognitive load (fewer unused files, cleaner types)
3. Enable safe refactoring (CI pipeline gates quality)
4. Improve developer experience (AI tools work better with clear patterns)

**Recommended first PRs in order:**

| # | Task | Files Affected | Effort |
|---|------|---------------|--------|
| 1 | Set up Vitest + React Testing Library | `vitest.config.ts`, `package.json` | 2h |
| 2 | Add GitHub Actions CI (lint → typecheck → test → build) | `.github/workflows/ci.yml` | 2h |
| 3 | Remove unused components (`LexDrawer`, `FastWordPopup`) | `src/components/LexDrawer.tsx`, `FastWordPopup.tsx`, imports | 1h |
| 4 | Consolidate duplicate types | `src/types/corpus.ts`, `src/types/library.ts` | 2h |
| 5 | Fix `markPageAsSeen` stale closure | `src/lib/hooks/useVocabulary.ts` | 1h |
| 6 | Refactor `server.ts` routes into `src/server/routes/` | `server.ts` → `src/server/routes/*.ts` | 3h |
| 7 | Decompose `corpus.ts` into per-text modules | `src/data/corpus.ts` → `src/data/texts/*.ts` | 4h |
| 8 | Add bundle analysis and chunk splitting | `vite.config.ts` | 1h |
| 9 | Add Sentry error monitoring | `src/lib/monitoring.ts`, `App.tsx` | 2h |
| 10 | Create `AGENTS.md` for AI tooling conventions | `AGENTS.md` | 1h |

**Total estimated effort:** ~18 hours (2-3 days focused, or 1.5 weeks alongside other work).

After Phase 0, immediately begin **Phase 1 (Corpus Engine)** — it delivers the most user-visible value (browsable corpus, lemma pages, paradigm tables) and lays the data foundation for all subsequent phases.

---

## 9. Changes Applied (2026-05-11)

### Files Created

| File | Module | Purpose |
|------|--------|---------|
| `src/types/modules.ts` | All modules | Consolidated type definitions: `LemmaEntry`, `InflectedForm`, `GrammarConcept`, `GrammarExample`, `SearchQuery`, `SearchResult`, `MorphologyFilter`, `SyntaxTree`, `SyntaxTokenData`, `DependencyRelation`, `ResearchNotebook`, `ResearchNote`, `AudioRecording`, `Manuscript`, `ManuscriptImage`, `TranscriptionLayer`, `VariantReading`, `Course`, `CourseTextAssignment`, `CourseMembership`, `TutorMessage`, `TutorSession` |
| `src/lib/services/lemmaService.ts` | Dictionary Hub | `LemmaService.getLemma()`, `.searchLemmas()`, `.getParadigm()` |
| `src/lib/services/grammarService.ts` | Grammar Pathways | `GrammarService.getConcepts()`, `.getConcept()`, `.getPathway()` |
| `src/lib/services/searchService.ts` | Corpus Search | `SearchService.search()`, `.searchLemmas()`, `.searchByMorphology()` |
| `src/lib/services/syntaxService.ts` | SyntaxLab | `SyntaxService.getTree()`, `.getTreesForText()`, `.getRelationLabel()` |
| `src/lib/services/notebookService.ts` | Research Notebook | `NotebookService.getNotebooks()`, `.createNotebook()`, `.deleteNotebook()`, `.getNotes()`, `.createNote()`, `.deleteNote()` |
| `src/lib/services/audioService.ts` | Audio Lab | `AudioService.generateTTS()`, `.getPronunciationGuide()`, `.saveRecording()` |
| `src/lib/services/manuscriptService.ts` | Manuscript Lab | `ManuscriptService.getManuscripts()`, `.getManuscript()` |
| `src/lib/services/courseService.ts` | Classroom Builder | `CourseService.getCourses()`, `.getCourse()`, `.createCourse()`, `.getMembers()`, `.joinCourse()` |
| `src/pages/Search.tsx` | Corpus Search | Placeholder page with `SearchPage` component |
| `src/pages/Grammar.tsx` | Grammar Pathways | Placeholder page with `Grammar` component |
| `src/pages/Tutor.tsx` | AI Tutor | Placeholder page with `Tutor` component |
| `src/pages/Syntax.tsx` | SyntaxLab | Placeholder page with `Syntax` component |
| `src/pages/Notebooks.tsx` | Research Notebook | Placeholder page with `Notebooks` component |
| `src/pages/Manuscripts.tsx` | Manuscript Lab | Placeholder page with `Manuscripts` component |
| `src/pages/Courses.tsx` | Classroom Builder | Placeholder page with `Courses` component |
| `src/pages/AudioLab.tsx` | Audio Lab | Placeholder page with `AudioLab` component |

### Files Extended

| File | What Changed | Why |
|------|-------------|-----|
| `src/lib/services/aiClient.ts` | Added `startTutorSession()`, `sendTutorMessage()`, `generateMorphologyQuiz()`, `analyzeSyntax()` | AI tutor and syntax analysis need new API methods |
| `src/App.tsx` | Added 8 new routes under `/app/*` | Each new module needs a routable page |
| `src/components/Navbar.tsx` | Added "Tools" nav section with Grammar, Syntax, Manuscripts, Audio Lab, Courses; added Search and Tutor to "Study" section | Users need to discover and navigate to new modules |
| `src/lib/translations/en.ts` | Added 30+ translation keys for new pages and nav items | All user-facing strings must be i18n-ready |
| `server.ts` | Added 4 AI endpoints (`/api/ai/tutor/start`, `/api/ai/tutor/message`, `/api/ai/quiz`, `/api/ai/syntax`) + 20+ stub API routes (501 Not Implemented) | Server must define the URL geography for future endpoints |

### Duplication Avoided

| Potential Duplicate | Existing Equivalent | Decision |
|--------------------|--------------------|----------|
| New corpus service | `CorpusDB` in `src/data/corpus.ts` + `LibraryService` in `src/lib/services/libraryService.ts` | Did not create — extend existing instead |
| New morphology types | `Morphology` in `src/types/corpus.ts` | Did not create new — used existing as base for `MorphologyFilter` |
| New vocabulary/state hook | `useVocabulary` in `src/lib/hooks/useVocabulary.ts` | Did not create — extend existing SRS flow |
| New Notes page | `Notes.tsx` at `src/pages/Notes.tsx` | Did not replace — `Notebooks.tsx` adds notebook-organizer layer on top |
| New audio player component | `ReaderAudioBar` in `src/components/reader/ReaderAudioBar.tsx` | Did not create — `AudioService` extends the backend, not the UI |
| New reader word panel | `LexDrawerPanel` in `src/components/reader/LexDrawerPanel.tsx` | Did not create — add tabs to existing panel in future |
| New auth/state context | `AuthContext`, `useAuth`, `useSettings`, `useKnowledge` | Did not create — existing hooks cover state needs |

### Build & Lint Status

- `npm run build` — ✅ passes (3.68s, 3337 modules, no errors)
- `npx eslint` on all new files — ✅ passes (fixed one unused-param warning in `lemmaService.ts`)

### Recommended Next Implementation Step

**Phase 0, Task 1: Set up Vitest + React Testing Library + CI.** The extension architecture is now in place, but without tests and CI, every subsequent implementation is higher risk. Start with a `vitest.config.ts`, write a smoke test for the existing Reader page, and wire up GitHub Actions to run `lint && tsc && test && build` on every PR.
