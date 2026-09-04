# Paleoglossa: Technical Implementation Roadmap

> **Audit date:** 2026-05-11 · **Updated:** 2026-06-10
> **Target:** A serious platform for studying ancient languages through real texts.
> **Current state:** React 19 + Vite 6 + Firebase/Firestore + Express 5 + Gemini AI.
> **Guiding principle:** Extend what exists; build new modules only where gaps cannot be filled.
>
> **⭐ Current plan:** § 11 — "Make Paleoglossa amazing" (June 2026 audit-driven roadmap).
> Full audit report: [`docs/product-audit-2026-06.md`](./product-audit-2026-06.md). Sections 1–10 below are the historical build record.

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
| **SRS** | FSRS-5 algorithm | Implementation in `src/lib/srs/fsrs.ts`; SM-2 retained in `sm2.ts` |
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
| Spaced repetition (FSRS-5) | ✅ Complete | Review page, 4 ratings, multiple card types; SM-2 retained as fallback |
| AI word/phrase explanations | ✅ Complete | Gemini-powered, cached per session |
| Text import (paste/file/URL/OCR) | ✅ Complete | 4 source types, adapter-based importers |
| i18n | ✅ Complete | All user-facing strings in 8 languages (en, es, de, pt, fr, ru, zh, tr) |
| Reading progress tracking | ✅ Complete | Stats, streak, daily goals |
| Settings panel | ✅ Complete | Theme, font, audio, goals, languages |
| Dashboard/Statistics | ✅ Complete | Charts, streak, vocabulary stats |
| User auth (Google/Email) | ✅ Complete | Login, signup, password reset, demo mode |
| Corpus library | ✅ Complete | 30+ curated texts across 11 languages; smart recommendations with difficulty labels |
| Lexicon integration | ✅ Complete | Dictionary page, Logeion/Sefaria lookup, paradigm tables, Wiktionary fallback |
| Grammar pathways | ✅ Complete | Grammar reference, prerequisite graph, concept browser with tiered pathways |
| Corpus search | ✅ Complete | Multi-source lemma + full-text search (`Search.tsx`) |
| Syntax/treebank viewer | ✅ Complete | AI-generated + PROIEL/Gorman treebank annotations, inline Reader toggle (`Syntax.tsx`) |
| AI philology tutor | ✅ Complete | Conversational tutor with 6 difficulty modes, chat history (`Tutor.tsx`) |
| Research notebook | ✅ Complete | Per-user notebooks with Firestore sync (`Notebooks.tsx`, `NotebookDetail.tsx`) |
| Manuscript/epigraphy lab | ✅ Functional | Image pan/zoom viewer + IIIF manifest support (`Manuscripts.tsx`, 1092 lines) |
| Audio/pronunciation lab | ✅ Functional | TTS with server-side cache + pronunciation guides (`AudioLab.tsx`) |
| Classroom/course builder | ✅ Complete | Teacher custom claims, student enrollment, assignments, and roster CRUD wired through `api/_routes/courses.ts` + `Courses.tsx` (1257 lines) |
| Smart text recommendations | ✅ Complete | Multi-signal scoring, difficulty labels, reasons; unified Dashboard + Library (`recommendationService.ts`) |
| Beginner hub | ✅ Complete | Language-scoped onboarding, milestones, script primers, daily path (`BeginnerHub.tsx`) |
| XP & gamification | ✅ Complete | XP system, challenges, leaderboard, scholar profiles (`Challenges.tsx`) |
| Language-scoped content | ✅ Complete | All pages filter by active language (LingQ-style UX) |
| Morphology browser | ✅ Complete | Token-level tags, paradigm tables, AI morphology analysis |
| Parallel text alignment | ⚠️ Partial | Sentence-level parallel, not word-aligned |

### Known Technical Debt

1. ~~**No test suite**~~ ✅ Resolved — Vitest + React Testing Library + Playwright E2E in place (41+ test files)
2. ~~**No CI/CD**~~ ✅ Resolved — `ci.yml` (type-check, lint, test, build on every PR) + `deploy.yml` (auto-deploy to Vercel on push to `main`)
3. ~~**No error monitoring**~~ ✅ Resolved — `@sentry/react` initialized in `main.tsx`; set `VITE_SENTRY_DSN` in Vercel env to activate
4. ~~**Monolithic `corpus.ts`**~~ ⚠️ Partially resolved — corpus decomposed into `src/data/corpus/` subdirectory (30+ per-text/language files); main `corpus.ts` still 5095 lines as orchestrator
5. **Mixed dynamic/static Firebase imports** — `Settings.tsx` uses dynamic import while other files use static
6. ~~**Two legacy word info components**~~ ✅ Resolved — `LexDrawer.tsx` and `FastWordPopup.tsx` removed; `LexDrawerPanel` is the active component
7. ~~**Duplicate type definitions**~~ ✅ Resolved — `types/library.ts` removed; `types/corpus.ts` is canonical
8. ~~**Stale closure in `useVocabulary.markPageAsSeen`**~~ ✅ Resolved — uses `knowledgeRef.current` instead of stale closure
9. ~~**Build chunk warning**~~ ✅ Resolved — manual chunk splitting in `vite.config.ts` (firebase, react, markdown, motion vendors)
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

### Phase 0: Foundation & Cleanup ✅ Complete
**No new features. Pay down technical debt before building up.**

- [x] Add Vitest + React Testing Library; write smoke tests for existing pages (41+ test files)
- [x] Set up GitHub Actions CI: lint → typecheck → test → build
- [x] Decompose `corpus.ts` into per-text modules (`src/data/corpus/` — 30+ files)
- [x] Consolidate duplicate types — removed `types/library.ts`; `types/corpus.ts` is canonical
- [x] Remove unused components — deleted `LexDrawer.tsx`, `FastWordPopup.tsx`, legacy `data/texts.ts`, `data/chapters.ts`
- [x] Fix stale closure in `useVocabulary.markPageAsSeen` — uses `knowledgeRef.current`
- [x] Bundle optimization: manual chunk splitting (firebase, react, markdown, motion vendors)
- [x] Add Sentry error monitoring (`@sentry/react` initialized in `main.tsx`)
- [x] Add `CLAUDE.md` / `AGENTS.md` with conventions for AI tooling
- [x] Refactor `server.ts` route handlers into separate modules under `api/_routes/`

**Risk:** No tests = changes may regress existing behavior. This phase mitigates that.

### Phase 1: Text & Corpus Engine ✅ Complete

- [x] `corpusService.ts` — corpus data access layer with language filtering
- [x] Text metadata schema (genre, period, dialect, difficulty, sourceStatus)
- [x] Corpus browser page — Library with filter/sort, language-scoped by default
- [x] Text cards with word count, difficulty, completion stats, coverage badges
- [x] Dictionary page (`/app/dictionary/:languageId/:lemma`) with paradigm tables
- [x] Lemma lookup in Reader via LexDrawerPanel — click any word for full analysis
- [x] Smart text recommendations — multi-signal scoring, i+1 coverage, difficulty labels
- [ ] Semantic concept layer: extend `LemmaDoc` with `semanticDomain`, `cognates`, `usageNotes`
- [ ] "Concept" tab in `LexDrawerPanel` — semantic domains, historical usage evolution, cross-corpus occurrences
- [ ] AI-generated concept summaries for theologically rich words (λόγος, תורה, חסד) via Gemini
- [ ] Cross-language cognate linking (e.g. Greek λόγος ↔ Latin verbum)

**Deliverable:** ✅ Core complete. Users can browse the corpus filtered by language, click a text to read it, click any word to see its full analysis with paradigm tables, and get personalized text recommendations. Semantic concept layer (domains, cognates, usage evolution) remains as a future enhancement.

### Phase 2: Search & Syntax ✅ Complete

- [x] `searchService.ts` — multi-source lemma + full-text search
- [x] Search page (`/app/search`) with morphology filtering
- [x] Search results with context display
- [x] Treebank annotation integration (PROIEL/Gorman data in `treebank-sections.ts`)
- [x] Syntax page (`/app/syntax`) — dependency tree rendering per sentence
- [x] Syntax annotations integrated into Reader (PR #234)
- [x] Cross-linguistic search across all corpus languages

**Deliverable:** ✅ Users can search across the entire corpus by lemma or full text, view syntax trees for sentences, and see dependency annotations inline in the Reader.

### Phase 3: Grammar & AI Tutor ✅ Complete

- [x] Grammar concept model and structured data (`grammarData.ts`, grammar reference data)
- [x] Grammar concept browser (`/app/grammar`) with per-language filtering
- [x] Grammar pathways page (`/app/grammar/pathways`) with tiered progression
- [x] Concept graph visualization (prerequisite graph)
- [x] AI tutor chat page (`/app/tutor`) with conversational history
- [x] 6 difficulty modes: beginner, grammar, seminary, scholar, devotional, historical (PR #232)
- [x] Context-aware AI with tutor bridge from Reader (PR #231)
- [x] AI morphology analysis in word panel (PR #230)

**Deliverable:** ✅ Users can explore structured grammar, ask AI questions in context, and use 6 specialized tutor modes.

### Phase 4: Research Notebook ✅ Complete

- [x] Notebook CRUD (create/list/rename/delete) — `Notebooks.tsx`, `NotebookDetail.tsx`
- [x] Note creation with text context
- [x] Note tagging and organization
- [x] Notebook detail view with note rendering
- [x] Export: Markdown (per-note and full notebook download) + PDF (styled HTML export with print dialog)
- [x] Cross-text note linking — wikilink syntax `[[lemma]]` and `[[text:id|label]]` with link insertion toolbar and backlinks display

**Deliverable:** ✅ Users can create notebooks, add notes, organize research, export as Markdown or PDF, and cross-link between notes using wikilinks with backlink navigation.

### Phase 5: Audio & Pronunciation — ✅ Complete

- [x] Server-side TTS caching (audio route with cache)
- [x] Pronunciation guide page (`/app/audio-lab`)
- [x] Script primers for Syriac, Coptic, Aramaic, Sanskrit (PR #228)
- [x] Word-by-word audio highlighting with waveform — `useReaderTTS` drives proportional token highlighting in `ReadingPane`
- [x] User recording + playback for pronunciation practice — MediaRecorder-based widget in AudioLab with compare-to-TTS
- [x] IPA transcription display — AI-generated IPA via `/api/ai/pronunciation`, displayed in AudioLab
- [x] Pronunciation mode switching (restored/Erasmian/modern) — per-language mode selector in AudioLab, passed to TTS and guide endpoints
- [x] Waveform visualization — canvas-based waveform with playback progress and seek

**Deliverable:** ✅ Users can listen to TTS with word-by-word highlighting, record themselves and compare with TTS, view IPA transcriptions, and switch between pronunciation traditions (restored/Erasmian/modern for Greek, restored/ecclesiastical for Latin, Tiberian/modern for Hebrew).

### Phase 5b: Historical Context Panels — ✅ Complete

> **Reality check (2026-06-09):** shipped. The checkboxes below were stale; re-verified against the code.

- [x] `HistoricalContextPanel` component (`src/components/reader/HistoricalContextPanel.tsx`) — modal dialog (`role="dialog"`, Escape-to-close, RTL-aware)
- [x] AI-generated context via Gemini: geography, period, key figures, cultural background, literary context (`api/_routes/ai.ts` → `POST /api/ai/historical-context`, 30s timeout)
- [x] Cached to avoid repeated AI calls — server-side 24h TTL cache **and** client-side persistent localStorage cache (`historicalContextService.ts`, 30-day TTL, survives reloads / works offline)
- [ ] Extend `Text` interface with a first-class `historicalContext` field — **not done**; context is fetched on demand and cached, not stored on the `Text` model
- [x] Toggle in Reader sidebar — non-intrusive, per-text (`src/pages/Reader.tsx`)

**Deliverable:** ✅ A user reading a text can open a side panel showing geographic, period, cultural, and literary background — turning "decoding words" into "understanding the world."

### Phase 6: Manuscript & Epigraphy — Mostly Complete

> **Reality check (2026-06-09):** the variant/apparatus/TC cluster and TEI import were marked unstarted but are in fact implemented; re-verified against the code.

- [x] Manuscript model + page (`Manuscripts.tsx`)
- [x] Manuscript viewer: image pan/zoom + IIIF manifest support
- [ ] Line-level alignment — **not done** (no diplomatic-line UI)
- [x] Critical apparatus display (`src/lib/data/criticalApparatus`, apparatus tab in `Manuscripts.tsx`)
- [x] TEI XML import (`api/_lib/teiParser.ts`, wired into `api/_routes/parse.ts`)
- [~] Manuscript browser with filtering — list exists; no dedicated filter UI
- [x] Variant apparatus explorer: tap a word in Reader to see variant readings (`VariantApparatusSection.tsx` in `LexDrawerPanel`)
- [x] "Variants" tab in `LexDrawerPanel` for inline apparatus display
- [x] `VariantReading` data: witness, reading, type, scribal tendency (`src/types/modules.ts`, `src/lib/data/textualVariants.ts`)
- [x] Textual criticism exercises (`TCExerciseModal.tsx`, backed by curated `textualVariants.ts` data)
- [ ] Exercise generation via Gemini from apparatus data — **not done**; exercises use curated static data, not AI generation
- [ ] Integration with XP/achievement system for TC exercise completions — **not done**

**Deliverable:** ✅ Manuscript viewing, critical apparatus, TEI import, and the in-Reader variant explorer + TC exercises all work. Remaining: line-level alignment, AI-generated exercises, and XP integration.

### Phase 7: Classroom & Courses — Mostly Complete

> **Reality check (2026-06-09):** teacher role and enrollment shipped (see CLAUDE.md "Complete"); re-verified against the code.

- [x] Course model + page (`Courses.tsx`)
- [x] Course creation with text assignment and reading lists
- [x] Language-scoped course filtering (PR #235)
- [x] Teacher role via Firebase custom claims (`api/_routes/courses.ts` sets `teacher: true`; ownership-gated mutations)
- [x] Student enrollment flow (`POST /api/courses/:courseId/join`)
- [ ] Assignment tracking with due dates — **not done** (no `dueDate` on text assignments)
- [~] Teacher dashboard: per-student progress, completion rates — roster endpoint exists; progress/completion incomplete
- [ ] Fork/clone texts for course-specific annotations — **not done**

**Deliverable:** ✅ Teachers can create courses, assign texts, and enroll students. Remaining: due dates, full progress dashboard, and text forking.

### Phase 8: Production Hardening (ongoing)

> **Reality check (2026-06-09):** rate limiting, rules hardening, perf audit, and E2E flows are in place; re-verified against the code.

- [x] Rate limiting on all API routes (`api/_lib/rateLimiter.ts`; auth/ai/import/api limiters in `api/index.ts`)
- [x] Firestore security rules audit and hardening (`firestore.rules` — deny-by-default, ownership/membership gating)
- [x] Performance audit: chunk size, image optimization, lazy loading (`docs/performance-audit.md`; all pages `React.lazy`)
- [~] Accessibility audit: ARIA labels, keyboard navigation, screen reader support — in progress; dialog semantics + a11y test coverage landing incrementally (`EmptyState.a11y.test.tsx`, `HistoricalContextPanel`). No full WCAG sweep / `jest-axe` yet.
- [x] E2E tests with Playwright for critical flows (auth, reader, review) (`e2e/`)
- [ ] Error reporting dashboard — Sentry is wired (passive); no custom dashboard
- [x] Analytics: track feature usage to guide priorities (PostHog wired in `src/lib/analytics.ts`; events fired from Reader, LexDrawer, Review, Import, Auth, Subscription)
- [x] Documentation: architecture docs, contribution guide, API reference (`docs/contributing.md`, `docs/api-reference.md`)

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

1. ~~**No test suite**~~ ✅ Resolved — Vitest + React Testing Library in place (41+ test files).
2. ~~**Monolithic corpus.ts**~~ ⚠️ Partially resolved — decomposed into `src/data/corpus/` (30+ files); main orchestrator still large.
3. ~~**Duplicate type definitions**~~ ✅ Resolved — `types/library.ts` removed.
4. ~~**Unused components**~~ ✅ Resolved — `LexDrawer.tsx`, `FastWordPopup.tsx` deleted.
5. ~~**Build chunk size**~~ ✅ Resolved — manual chunk splitting in `vite.config.ts`.
6. ~~**No CI/CD**~~ ✅ Resolved — `ci.yml` runs lint + typecheck + test + build on every PR.
7. ~~**Stale closure bug**~~ ✅ Resolved — `markPageAsSeen` uses `knowledgeRef.current`.

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

~~**Phase 0: Foundation & Cleanup**~~ ✅ Complete.
~~**Phase 1: Text & Corpus Engine**~~ ✅ Complete.
~~**Phase 2: Search & Syntax**~~ ✅ Complete.
~~**Phase 3: Grammar & AI Tutor**~~ ✅ Complete.
~~**Phase 4: Research Notebook**~~ ✅ Complete.
~~**Phase 5: Audio & Pronunciation**~~ ✅ Complete.

**Next:** Phase 5b (Historical Context Panels) — AI-generated context for text sections would transform word-level study into historical understanding. Alternatively, the Phase 1 semantic concept layer (domains, cognates, usage evolution) deepens the lexicon experience.

---

## 10. Remaining Next Priorities (as of 2026-05-28)

The items below track completed work and identify remaining gaps.

### Production Hardening — PR #167 (merged 2026-05-20)

| Priority | Item | Status |
|----------|------|--------|
| High | Demo migration safety — migration functions must throw on failure; `discardDemoData()` must not run on partial failure | ✅ Complete |
| High | Production config audit — `scripts/check-production-config.ts` with `npm run config:check` | ✅ Complete |
| High | Sync status consistency — `ImportService.updateImport` and other write paths missing `markPendingWrite`/`markWriteSuccess` calls | ✅ Complete |
| Medium | README/ROADMAP accuracy — SM-2 corrected to FSRS-5, stub statuses updated | ✅ Complete |
| Medium | Word Analysis panel auto-close — keyboard status shortcuts in Reader do not close the selected-word panel | ✅ Complete |

### Language Entitlements — PR #168 (open 2026-05-20)

| Priority | Item | Status |
|----------|------|--------|
| High | Global ancient-language selection — Grammar, Syntax, Discover pages now use `ActiveLanguageContext` | ✅ Complete |
| High | Free language + paid second language UI — Navbar (LanguageSwitcher vocab progress bar) and Settings Language Slots section | ✅ Complete |
| High | 200-word free-language vocabulary limit — `FREE_LANGUAGE_WORD_LIMIT=200`, `useVocabLimit`, gate in `useKnowledge`, paywall toast in Reader + Vocabulary | ✅ Complete |

### Reading Loop & Social (medium-term)

| Priority | Item | Status |
|----------|------|--------|
| Medium | LingQ-style reading loop — seamless click → mark → continue without panel friction | ✅ Complete — PR #200 |
| Medium | Public Discover / community text library — browse and fork public imported texts | ✅ Complete — `Discover.tsx` |
| Medium | Vocabulary frequency and difficulty recommendations | ✅ Complete — PR #220 |
| Low | Social/community roadmap — follow readers, share notebooks, leaderboard | ✅ Complete — scholar profiles, challenges, leaderboard |

### Smart Recommendations — PR #220 (merged 2026-05-26)

| Priority | Item | Status |
|----------|------|--------|
| Medium | Multi-signal recommendation engine in `recommendationService.ts` — coverage sweet spot (i+1 @ ~90%), reading history exclusion, genre diversity, morphology preference | ✅ Complete |
| Medium | Personalized difficulty labels — "Easy read", "Just right", "Stretch yourself", "Challenging" per text | ✅ Complete |
| Medium | Recommendation reasons — "{{n}} new words at your level", "Explore {{genre}}", "Reinforce what you know" | ✅ Complete |
| Medium | Richer `RecommendationRail` cards — difficulty label, language badge, new-word count, reason, coverage bar | ✅ Complete |
| Medium | Unified Dashboard recommendation — replaces ad-hoc level-sort with vocabulary-aware scoring + fallback | ✅ Complete |
| Low | 10 unit tests for the recommendation service | ✅ Complete |

### Learning Loop & UX Polish — PRs #226–#235 (merged 2026-05-26 to 2026-05-28)

| Priority | Item | Status |
|----------|------|--------|
| Medium | 7-day review forecast widget on Dashboard | ✅ Complete — PR #226 |
| Medium | Beginner Hub — milestones, script primers, daily path (Phases 1–3) | ✅ Complete — PRs #224, #227, #228 |
| Medium | Launch readiness — email, legal pages, analytics, PWA, Sentry | ✅ Complete — PR #229 |
| Medium | Word analysis panel polish — knowledge-first layout, paradigm styling, AI morphology | ✅ Complete — PR #230 |
| Medium | Tutor bridge from Reader, grammar prerequisite graph, bundle analysis | ✅ Complete — PR #231 |
| Medium | AI tutor — 6 difficulty modes (beginner, grammar, seminary, scholar, devotional, historical) | ✅ Complete — PR #232 |
| Medium | Expanded paradigm tables, corpus metadata, XP gamification system | ✅ Complete — PR #233 |
| Medium | Treebank annotations — PROIEL/Gorman data integrated into Reader and Syntax page | ✅ Complete — PR #234 |
| Medium | Language-scoped content — Library, BeginnerHub, Syntax, Courses filter by active language | ✅ Complete — PR #235 |
| Low | Dead code removal — `LexDrawer.tsx`, `FastWordPopup.tsx`, `types/library.ts`, legacy data files | ✅ Complete — this PR |

### Remaining Gaps (next priorities)

| Priority | Item | Phase | Notes |
|----------|------|-------|-------|
| Medium | Historical context panels in Reader | 5b | AI-generated geography/culture context per text section |
| Medium | Semantic concept layer (domains, cognates) | 1 | Extend LemmaDoc, concept tab in LexDrawerPanel |
| Low | Manuscript line-level alignment | 6 | Viewer works; fine-grained alignment not done |
| Low | TEI XML import | 6 | Manuscript data model exists; importer needed |
| Low | Variant apparatus explorer + TC exercises | 6 | Gamified textual criticism with Gemini |
| Low | Teacher roles via Firebase custom claims | 7 | Course page exists; auth roles incomplete |
| Low | Student enrollment + assignment tracking | 7 | Course creation works; classroom features stub |
| Low | Parallel text word-level alignment | 1 | Sentence-level works; word alignment complex |
| Low | E2E tests for reader critical path | 8 | Playwright setup exists; reader flow untested |

---

## 11. Make Paleoglossa amazing: a LingQ-pro learning loop with a Duolingo-grade beginning (2026-06-10)

> Derived from the June 2026 full product & engineering audit (8 dimensions, adversarial verification — 9 findings confirmed, 8 refuted).
> Full report with evidence, scores, and refuted-findings list: [`docs/product-audit-2026-06.md`](./product-audit-2026-06.md).
>
> **Verdict:** a deep, scholarly product with a broken cash register and a cold front door. The reading/SRS core is LingQ-class; the moat features (treebanks, manuscripts, Audio Lab, tutor, notebooks) are built but gated or buried. Weakest dimensions: monetization (4/10), onboarding (6/10), engagement (6/10).
>
> **Progress audit (2026-06-19):** Phase 0 is fully shipped (0.8 boot-query bounding via `getDocsPaged`; 0.9 PWA prompt + safe-area). Phase 1 ("Duolingo-grade first hour") is essentially shipped — Day-One Lesson, first-win streak, minutes→word daily goal, guest-first lesson, fast level-up, and the onboarding known-words seed all exist in code. Phase 2 is mostly shipped (2.1 review-card audio, 2.2 phrase selection, 2.3 known-words metric, 2.4 weighted card selection, 2.5 session resume, 2.6 reminders, 2.7 paradigm tables, 2.8 instant dictionary). **Phase 2 is now fully shipped** (2.9 offline IndexedDB migration + wider API runtime cache landed 2026-06-20). **Remaining genuine gaps:** the un-started Phase 3/4 engagement & growth work (3.5 colophons/laurels shipped). *(1.6 Beginner Hub discoverability shipped 2026-06-19.)*

Effort key: **S** ≤ 1 day · **M** = days · **L** = 1–2+ weeks.

### Phase 0 — "Fix what's broken" (1–2 sprints; do nothing else first)

| # | What to build | Build on | Effort | Payoff |
|---|---|---|---|---|
| 0.1 | ✅ **Done** — all 3 subscription webhook cases (`checkout.session.completed`, `customer.subscription.updated/deleted`) now write via `getAdminDb()` + `FieldValue.serverTimestamp()` through a single unified path (`buildSubscriptionWrite`); client SDK removed from the webhook | `api/_routes/billing.ts` | S | Paid subscriptions reliably persist; no silent billing failures |
| 0.2 | ✅ **Core done** — users resolved by indexed `stripeCustomerId` equality query (auto-indexed single field, no scan); `event.id` idempotency via `stripeWebhookEvents/{id}` `create()` guard (fail-open); `buildSubscriptionWrite` unit-tested for all subscription event types in `billingMappers.test.ts`. *Remaining:* full integration test mocking Stripe+Firestore for the email/booking side-effect cases | `api/_routes/billing.ts`, `billingMappers.test.ts` | M | Webhooks scale past a few hundred users; Stripe retries can't double-write |
| 0.3 | ✅ **Done** — `resolveEffectivePlan()` in `aiUsage.ts` only honors a paid plan when `subscriptionStatus === 'active'` AND a non-empty `stripeSubscriptionId` is present; otherwise collapses to `free`. `lookupUserPlan()` calls it and logs a warning on mismatch. Unit-tested (spoofing/missing-sub/unknown-plan cases) in `aiUsage.test.ts` | `api/_routes/ai.ts` (`lookupUserPlan`), `api/_lib/aiUsage.ts` | S | Closes the plan-spoofing / AI-cost hole |
| 0.4 | ✅ **Done** — `GET /api/imports/quota` (`api/_routes/imports.ts`) counts `users/{uid}/imports` via Admin SDK aggregate, resolves the effective plan (shared `lookupEffectivePlan`), and returns 429 `IMPORT_LIMIT_REACHED` at the plan limit; pure `evaluateImportQuota()` unit-tested in `importQuota.test.ts`; Import page checks quota before saving and shows an upgrade CTA banner (+ `import_limit_blocked` analytics). Fails open on server/network errors | `src/lib/constants/plans.ts` (`importLimit`), `importService.ts`, `src/pages/Import.tsx` | M | Free tier actually has edges → conversion pressure |
| 0.5 | ✅ **Done** — `chargeAiQuota` guard applied to analyze/ocr/translate/explain; TTS gets `optionalAuth` + quota on uncached synthesis only; `/api/import/parse` gets `optionalAuth` + size-based quota (1 unit per started MB via `computeParseUnits`, multi-unit support added to `checkAndIncrementUsage`); shared `enforceAiQuota` in `aiUsage.ts`; unit-tested | `api/_lib/aiUsage.ts`, `api/_routes/ai.ts`, `audio.ts`, `parse.ts` | M | Caps Gemini / Google-TTS cost-abuse vectors |
| 0.6 | ✅ **Done** — demo-mode Review path now calls `calculateSM2()` and persists its output verbatim (ad-hoc interval math removed); multi-session round-trip test added in `sm2.test.ts` | `src/pages/Review.tsx`, `src/lib/srs/sm2.ts` | S | Demo users experience the real algorithm — honest trial |
| 0.7 | ✅ **Done** — verified already implemented: `calculateSM2` applies the standard SM-2 ease formula, so HARD (q=3) decays ease by 0.14 while GOOD leaves it unchanged and EASY adds 0.1; explicit distinct-decay test added in `sm2.test.ts` | `src/lib/srs/sm2.ts` | S | Scheduling correctness for struggling words |
| 0.8 | ✅ **Done** — boot loads route through `getDocsPaged()` (`firestorePaging.ts`); vocabulary/imports/readingProgress reads are batched/bounded rather than unbounded single fetches | `vocabularyService.ts`, `importService.ts`, `statsService.ts`, `firestorePaging.ts` | M | 50–80% faster boot for heavy users; lower Firestore bill |
| 0.9 | ✅ **Done** — `VitePWA({ registerType: 'prompt' })` + `UpdatePrompt.tsx` update toast; `viewport-fit=cover` in `index.html` + `env(safe-area-inset-*)` padding in `index.css` | `vite.config.ts`, `index.html`, `src/index.css`, `UpdatePrompt.tsx` | S | No mid-reading surprise reloads; no notch occlusion on iPhone |

### Phase 1 — "Duolingo-grade first hour"

| # | What to build | Build on | Effort | Payoff |
|---|---|---|---|---|
| 1.1 | **Day-One Lesson**: a 2–3 sentence A0 micro-text per flagship language (Greek, Latin, Hebrew first), 90% of vocabulary pre-seeded as known, auto-completing with a celebration modal; routed immediately after onboarding, before the full library | `src/data/corpus.ts` + ingestion pipeline for content; `Onboarding.tsx` `finish()`; celebration via `useToast` + `xpService.ts` | M | Guaranteed comprehension win in minute one — the single highest-leverage retention move |
| 1.2 | **First-win streak**: initialize `streak: 1` at profile creation; streak chip always visible from day 0 | `statsService.ts:64`, `useStats.ts:22`, `Dashboard.tsx` | S | Day-one momentum; the confirmed onboarding gap, closed in hours |
| 1.3 | **Daily goal that means something**: map the onboarding minutes commitment (5/10/20/60) to a word goal; one-time "Daily Goal Complete" celebration; raise goal-step priority in the study plan | `Onboarding.tsx` (CommitmentStep), `Dashboard.tsx`, `StudyPlanWidget.tsx` | S | The goal a user chose is the goal they're measured on |
| 1.4 | **Guest-first lesson**: "Try Demo" on the Landing page drops straight into the Day-One Lesson (not the dashboard), with honest scope copy and a "make it permanent" nudge after ~15 min | `Landing.tsx`, `DemoModeBanner.tsx`, existing demo seeding | M | Zero-friction trial that ends in a win, not a tour |
| 1.5 | **Fast first level-up**: show Level 1 / XP bar from zero activity; first level threshold low enough to hit in session one | `xpService.ts` (Novice→Master tiers already on-brand), `useXP.ts`, `Dashboard.tsx` | S | Visible progression on day one |
| 1.6 | ✅ **Done** — one-time dismissible "Your Beginner Hub is ready" dashboard card for absolute-beginners + 7-day sidebar pulse highlight on the Beginner Hub nav item, backed by a `useBeginnerHubDiscovery` external store (pure selectors unit-tested) | `Dashboard.tsx`, `Navbar.tsx`, `useBeginnerHubDiscovery.ts` | S | The curriculum that already exists gets found |
| 1.7 | **Returning-learner vocab import**: optional onboarding step to paste/upload a known-words CSV/JSON | `Onboarding.tsx` (KnownWordsStep), `vocabularyService.ts` | M | Migrating LingQ/Anki users skip the cold start |

### Phase 2 — "LingQ-pro learning loop"

| # | What to build | Build on | Effort | Payoff |
|---|---|---|---|---|
| 2.1 | **Audio on every review card** (confirmed top gap): `audioUrl?` on `ReviewCard`, fetched from the TTS API at card generation, URL cached on the vocab doc; play button + auto-play setting | `reviewCardFactory.ts`, `Review.tsx`, `api/_routes/audio.ts`, `useReaderTTS.ts` patterns | M | LingQ-premium parity; phonological memory enters the loop |
| 2.2 | **Phrase selection ("lingQs for idioms")**: drag/long-press multi-token selection in the Reader; phrases saved as vocab items with lemma arrays + AI gloss; phrase cards in review | `ReadingPane.tsx`, `LexDrawerPanel.tsx`, `useKnowledge.ts` | L | Idiomatic/formulaic learning — essential for Homeric formulae, Hebrew construct chains |
| 2.3 | **Known-words as the headline metric**: per-language counter on the Dashboard header + Statistics; interval-distribution/ease histograms in an "SRS Health" panel | `reviewService.ts`, `Statistics.tsx`, `useLanguageStats.ts` | M | LingQ's signature motivator: watching the number climb |
| 2.4 | ✅ **Done** — card-type selection is now word-state + preset weighted (`pickWeighted`/`cardTypeWeight` in `reviewCardFactory.ts`) instead of uniform-random: recognition cards (FORM_TO_MEANING, LEMMA_RECOGNITION, CLOZE, CONTEXT_TRANSLATION) are favored for NEW/SEEN/LEARNING words, production cards (MEANING_TO_FORM, PARSE) for KNOWN words, FAMILIAR balanced. User-selectable preset (`adaptive`/`recognition`/`production`/`balanced`) in Review Settings, persisted; 8 unit tests added | `reviewCardFactory.ts`, `Review.tsx`, `en.ts` | M | Pedagogically correct progression; less frustration on new words |
| 2.5 | ✅ **Done** — live session mirrored to sessionStorage per language; "Resume session" prompt recovers the queue + position on reload (PR #341); only applies to the matching active language | `Review.tsx`, `reviewSession.ts` | M | Mobile-grade session stability |
| 2.6 | **Wire the review reminders that already exist**: invoke `showReviewReminder(dueCount)` / `showStreakWarning()` (currently never called), gated by a setting | `notificationService.ts`, `Review.tsx`, `useStreakNotifications.ts` | S | Habit loop closes on web today, before native push lands |
| 2.7 | **Paradigm tables in the reading flow**: surface the existing `ParadigmModal` from the lexicon drawer; binyan/shoresh for Hebrew, principal parts for Latin | `ParadigmModal.tsx` (built, unused in main flow), `LexDrawerPanel.tsx` | S | Morphology becomes explorable, not just labeled |
| 2.8 | **Instant dictionary**: eager-load the bundled definition on drawer open; source-switcher search box; cache by (lemma, language, source) | `LexDrawerPanel.tsx`, `dictionaryResolver.ts` | S | LingQ-grade single-tap lookup latency |
| 2.9 | ✅ **Done** — offline reading payloads migrated localStorage → IndexedDB (`idb-keyval` + `lz-string` compression) so 100+ texts fit past the ~5 MB localStorage quota; lightweight metadata index + sync queue stay synchronous in localStorage; one-time non-blocking `migrateLegacyPayloads()` on boot moves existing payloads + reclaims keys; Workbox runtime cache widened to `/api/lemmas/`, `/api/paradigms/`, `/api/lexicon-lookup/` (was corpus/texts/dictionary only); `fake-indexeddb` in test setup, round-trip + migration unit-tested | `vite.config.ts`, `offlineService.ts`, `Reader.tsx`, `bootstrap.tsx` | M | 100+ offline texts and offline lookups — train/plane reading |

### Phase 3 — "Habit engine" (adult, scholarly — the scriptorium, not the owl)

| # | What to build | Build on | Effort | Payoff |
|---|---|---|---|---|
| 3.1 | **Native push notifications** (confirmed top gap): `@capacitor/push-notifications`, FCM + APNs, review-due and streak-at-risk reminders at user-chosen times | `notificationService.ts`, `capacitor.config.ts`, `android/app/build.gradle` (google-services hook scaffolded) | L | The mechanism every retention mechanic below depends on, on mobile |
| 3.2 | **The Daily Scriptorium**: reskin the existing daily path (script → reading → review) as a scriptorium session; an oil-lamp that "burns" as you progress and is "lit" each day | `dailyPathService.ts`, `BeginnerHub.tsx` / `DailyPath.tsx` | M | A ritual, not a checklist — on-brand habit framing |
| 3.3 | **Lectio continua streak + "sabbatical" freezes**: scholarly-voice streak mechanics; surface the existing 2/month freezes as a one-tap "declare a sabbatical day" on the Dashboard | `useStats.ts`, `Settings.tsx`, `Dashboard.tsx` | S | The powerful retention tool currently buried in Settings |
| 3.4 | **Marginalia (daily quests)**: 3 rotating daily tasks ("Review 10 cards", "Read 50 words", "Annotate one sentence"), +25 XP each, dashboard banner | `challengeService.ts`, `xpService.ts`, `StudyPlanWidget.tsx` | M | Daily variable reward without childishness |
| 3.5 | **Laurels & colophons (milestones)**: toasts at 50/100/500/1000 known words; laurel modal at streak 7/30/100; session-end screen becomes a scribal colophon ("Explicit feliciter — 23 cards, 92%") with a shareable card | `Statistics.tsx` milestones, `Review.tsx` end screen, `useToast` | S | Dopamine, in Latin |
| 3.6 | **Symposia (seasonal events)**: monthly featured challenge tied to the ancient calendar — a drama for the City Dionysia (March), a Saturnalia review marathon (December); themed per-language leaderboards | `Challenges.tsx` (9 challenges + tiers exist), `Community.tsx` | M | Time-limited engagement that flatters the audience instead of patronizing it |
| 3.7 | **Hidden scholarly achievements**: 8–10 discoverables ("Nyktophilos: reviewed after midnight", "Polyglottos: 50 words in 5 languages") on the Profile | `users/{uid}/achievements`, `Profile.tsx`, `challengeService.ts` | S | Replayability for power users |
| 3.8 | **Re-engagement emails + cron**: streak-at-risk (day 2), comeback ("your 312 words are waiting"), weekly digest; Vercel cron | `api/_lib/email.ts` (welcome/receipt templates exist), `vercel.json` | M | The only channel that reaches lapsed users without push permission |
| 3.9 | **Home-screen widget**: streak + cards due, taps into Review | Capacitor widget plugin, `useStats.ts` | M/L | Glanceable daily trigger on the device home screen |

### Phase 4 — "Content moat & growth"

> Launch/growth plan of record (2026-09-04): [`docs/LAUNCH_PLAYBOOK.md`](LAUNCH_PLAYBOOK.md) — it sequences 4.4–4.6 behind the still-open cost-control items from `app-audit-2026-07.md` and adds the marketing playbook.

| # | What to build | Build on | Effort | Payoff |
|---|---|---|---|---|
| 4.1 | **Per-language graded ladders**: ingestion sprints adding an A0→C1 ladder for each of the 11 languages (extended sections for Akkadian/Sanskrit/etc. exist; the gaps are at the A0–A2 rungs); 3–5 classics per smaller language | `scripts/ingest-corpus-to-firestore.ts`, `scripts/corpus/importJson.ts`, static+Firestore merge live in `api/_routes/corpus.ts` | L (continuous) | Nobody else has graded readers in Ugaritic; this is the moat |
| 4.2 | **Promote Syntax treebanks out of the experimental gate**: bulk-import PROIEL/UD annotations for ~20 flagship texts (Anabasis, Aeneid, Genesis, John), then lift the flag | `scripts/treebank/import-proiel.ts`, `src/lib/features.ts`, `Syntax.tsx`, Reader DependencyTree | M | A headline feature competitors structurally cannot copy |
| 4.3 | **Promote Manuscripts**: seed the manuscripts collection with IIIF references for flagship texts; wire `VariantApparatusSection` to a Firestore variants collection | `manuscriptService.ts`, `Manuscripts.tsx`, manuscripts API routes | L | "Read the actual codex" — unmatched marketing and pedagogy |
| 4.4 | **SEO foundation**: robots.txt, dynamic sitemap (landing + public library texts), OG/Twitter/JSON-LD meta via react-helmet-async, public scholar pages at `/scholars/{username}` | `index.html`, `Landing.tsx`, `publicTexts.ts`, `profileService.ts` | M | Currently invisible to search; ancient-language queries are low-competition, high-intent |
| 4.5 | **Referral + achievement sharing**: referral codes, UTM capture at signup, "I read my first page of Homer" share-card images | `profileService.ts`, `AuthContext.tsx`, colophon share card from 3.5 | M | Organic growth in a niche that talks to itself (classics Twitter, seminaries, r/AncientGreek) |
| 4.6 | **Conversion polish**: upgrade toast when the vocab cap blocks a save (currently silent), `VOCAB_LIMIT_BLOCKED` analytics, plan feature strings into i18n | `useKnowledge.ts`, `useVocabLimit.ts`, `plans.ts`, `Subscription.tsx` | S | The paywall moment finally has a door, not a wall |
| 4.7 | **Native audio pipeline + iOS purchases**: GCS bucket + `corpus/{textId}/audio` refs, "native audio" Library badges, learner recording submissions; StoreKit 2 bridge for native subscriptions | `useReaderTTS.ts`, `ReaderAudioBar.tsx`, `Subscription.tsx` compliance gate, `features.isMobilePurchaseEnabled()` | L | Audio depth LingQ users expect; revenue from the iOS audience currently turned away |

### Creative differentiators (no competitor has these)

1. **"Read the Hand" — progressive paleography.** A Reader mode that fades the same verse from typeset text → diplomatic transcription → the actual IIIF manuscript facsimile, with tap zones aligned to tokens. Builds on `Manuscripts.tsx` + `manuscriptService.ts` + `ScriptLab`. Duolingo teaches you words; Paleoglossa teaches you to read Codex Sinaiticus.
2. **"Collate This Verse" — apparatus criticus exercises.** Spot-the-variant drills between two manuscript witnesses; correct collations feed XP and grammar mastery. Builds on `VariantApparatusSection` + the variants collection from 4.3. Text criticism as a game, for the only audience on earth that wants that.
3. **Pronunciation Time Machine.** Audio Lab toggle between reconstruction schemes — Classical/Koine/Byzantine Greek, Classical/Ecclesiastical Latin, Tiberian/reconstructed Hebrew — with minimal-pair ear-training cards flowing into the SRS (after 2.1 adds audio cards).
4. **"Diagram like Dionysius Thrax" — treebank duels.** Drag-the-arc dependency exercises generated from PROIEL data; mistakes route into per-concept grammar-mastery decay. Turns the experimental treebank into the most rigorous grammar trainer in any language app.
5. **AI Viva Voce.** After finishing a section, the philology tutor (existing `/api/ai/tutor/*` endpoints) conducts a 5-minute Socratic oral exam grounded in *that passage* and *your actual known-words map*, then writes the summary into a research notebook. The graduate-seminar experience, on demand.
6. **Living Scholia — community commentary layers.** Research notebooks (the `visibility` field and text/token anchoring already exist) become publishable commentary layers togglable in the Reader — a crowdsourced apparatus of scholia per text, doubling as indexed SEO pages.
7. **Etymology Constellation.** A cross-language cognate graph ("you already know 40% of this Sanskrit word's family from Greek") leveraging the cognate links already in `LexDrawerPanel` + `lemmaService.ts`. Uniquely valuable for users studying 3+ related ancient languages.
8. **Lectionary & Fasti calendar mode.** Daily readings keyed to historical calendars — church lectionary for Koine/Latin/Syriac/Coptic, the parashah cycle for Hebrew, Roman fasti for Latin — as an alternative daily-path source in `dailyPathService.ts`. A habit trigger with two millennia of proven retention.

### What NOT to do

See `docs/product-audit-2026-06.md` § 6 for the full list (no mascot, no hearts/gems, no demotion leagues, no exercise-gating before reading, no paywalled lookups) and § 3 for the eight refuted audit findings that must not be re-reported as gaps.
