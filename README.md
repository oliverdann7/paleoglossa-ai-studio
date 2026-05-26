# Παλαιόγλωσσα — Paleoglossa

> An ultra-modern, editorial-grade platform for studying ancient languages through immersive reading.

Read the ancient world, word by word. Paleoglossa combines an ancient-text reader, morphology engine, spaced-repetition vocabulary, AI philology tools, and a growing corpus library — all in one scholarly-grade platform.

**Production:** https://paleoglossa.com

---

## Languages

| Language | ID | Script |
|----------|----|--------|
| Ancient Greek | `grc` | Greek |
| Koine Greek | `grc-koine` | Greek |
| Biblical Hebrew | `hbo` | Hebrew |
| Classical Latin | `lat` | Latin |
| Syriac | `syr` | Syriac |
| Coptic | `cop` | Coptic |
| Aramaic | `arc` | Aramaic |
| Akkadian | `akk` | Cuneiform |
| Sanskrit | `san` | Devanagari |
| Egyptian Hieroglyphs | `egy` | Hieroglyphs |
| Hittite | `hit` | Cuneiform |

## Features

| Feature | Status |
|---------|--------|
| Ancient text reader (scroll + page modes) | ✅ |
| Knowledge states (NEW → KNOWN, color-coded) | ✅ |
| FSRS-5 spaced repetition reviews | ✅ |
| AI word / phrase / paradigm explanations | ✅ |
| Text import (paste, file, URL, OCR) | ✅ |
| Reading progress, streak, daily goals | ✅ |
| Parallel text display | ✅ |
| Transliteration toggles | ✅ |
| i18n (8 languages) | ✅ |
| Google / Email auth + guest mode | ✅ |
| Morphology tags per token | ✅ |
| External dictionary links | ✅ |
| Corpus search | ✅ |
| Lemma browser with paradigm tables | ✅ |
| Grammar pathways & reference | ✅ |
| AI philology tutor | ✅ |
| Research notebook | ✅ |
| Cloud sync (Firestore) + demo migration | ✅ |
| Admin Firebase debug page | ✅ |
| Public Discover / community text library | ✅ |
| Smart text recommendations (i+1 sweet spot, difficulty labels, reasons) | ✅ |
| Reader notes & context-menu actions | ✅ |
| Pronunciation / AudioLab (TTS playback) | ✅ |
| Syntax / dependency treebank viewer | ✅ |
| Manuscript / epigraphy lab (image pan/zoom + IIIF) | ✅ |
| Classroom / course builder | 🚧 |
| User recording upload | 🚧 |

## API Routes

Routes are modularized under `api/_routes/`. Some require a Gemini API key and Firebase backend:

| Route | Method | Status | Description |
|-------|--------|--------|-------------|
| `/api/test` | POST | ✅ | Health check |
| `/api/ai/...` | POST | ✅ | AI: analyze, translate, explain, OCR, tutor chat |
| `/api/lemmas/:language/:lemma` | GET | ✅ | Lemma lookup |
| `/api/lemmas` | GET | ✅ | Lemma search |
| `/api/lemmas/:lemma/paradigm` | GET | 🚧 | Paradigm inflection (stub) |
| `/api/dictionary` / `/api/dictionary/search` | GET | ✅ | Dictionary search |
| `/api/grammar/concepts` | GET | ✅ | Grammar concepts & pathways |
| `/api/search` | POST | ✅ | Multi-source corpus search |
| `/api/notebooks`, `/api/notes` | GET/POST/DELETE | ✅ | Research notebook CRUD |
| `/api/syntax/...` | GET | ✅ | Syntax treebank (AI-generated trees) |
| `/api/audio/tts` | POST | ✅ | TTS generation with server-side cache |
| `/api/audio/recordings` | POST | 🚧 | User recording upload (infrastructure not yet in place) |
| `/api/manuscripts` | GET/POST/PATCH/DELETE | ✅ | Manuscript CRUD (image viewer, IIIF manifest support) |
| `/api/courses` | GET/POST | 🚧 | Classroom management (page exists; teacher roles incomplete) |

## Corpus Status

Texts are marked with their completion status in the app (Sample / In Progress / Complete). Current state:

| Text | Language | Status | Morphology | Source |
|------|----------|--------|------------|--------|
| John 1 (SBLGNT) | Koine Greek | ✅ Complete | Full (vv. 1-5), Basic (vv. 6-18) | SBLGNT (non-commercial), MorphGNT (CC BY-SA 3.0) |
| Genesis 1 (OSHB) | Biblical Hebrew | ✅ Complete | Word-by-word tokens | OSHB (CC BY 4.0) |
| Psalm 23 (OSHB) | Biblical Hebrew | ✅ Complete | Word-by-word tokens | OSHB (CC BY 4.0) |
| Iliad Book 1 (Perseus) | Ancient Greek | ✅ Complete (ll. 1-611) | Full (ll. 1-7), Basic (ll. 8-611) | Perseus (CC BY-SA 3.0) |
| Anabasis 1.1 (Perseus) | Ancient Greek | ✅ Complete (Ch 1-9) | Full (§1-3), Basic (§4-9) | Perseus (CC BY-SA 3.0) |
| Aeneid Book 1 (Perseus) | Latin | ✅ Complete (ll. 1-756) | Full (ll. 1-7), Basic (ll. 8-756) | Perseus (CC BY-SA 3.0) |
| Aesop's Fables | Ancient Greek | ✅ Partial (13 sent.) | Word-by-word tokens | Perseus (CC BY-SA 3.0) |
| Odyssey Book 1 | Ancient Greek | ✅ Partial (27 sent.) | Full (ll. 1-5), Basic (ll. 6-444) | Perseus (CC BY-SA 3.0) |
| Syriac Peshitta John | Syriac | ✅ Partial (16 sent.) | Basic tokens | Project Gutenberg (Public Domain) |
| Coptic Sahidic John | Coptic | ✅ Partial (16 sent.) | Basic tokens | Project Gutenberg (Public Domain) |
| Targum Onkelos | Aramaic | ✅ Partial (15 sent.) | Basic tokens | Project Gutenberg (Public Domain) |
| Gilgamesh Tablet I | Akkadian | ✅ Partial (11 sent.) | Basic tokens | Project Gutenberg (Public Domain) |
| Bhagavad Gita | Sanskrit | ✅ Partial (21 sent.) | Basic tokens | Project Gutenberg (Public Domain) |
| Annals of Mursili II | Hittite | ✅ Partial (11 sent.) | Basic tokens | Project Gutenberg (Public Domain) |
| Maxims of Ptahhotep | Egyptian | ✅ Partial (11 sent.) | Basic tokens | Project Gutenberg (Public Domain) |

### How to add a full text

1. Add raw sentences to `src/data/corpus/expanded-sections.ts` following the existing `sent()` helper pattern
2. Register the new section(s) in `CorpusDB.getSection()` in `src/data/corpus.ts`
3. Update the `Text` definition to include the new section IDs in `sectionsPreview`
4. Set `sourceStatus`, `isSample`, and `sentenceCount` appropriately
5. Run `npm run tsc --noEmit`, `npm run lint`, `npm run build`

For texts with full morphology, add tokens directly to the `src/data/corpus.ts` section definitions using the existing richly-tokenized format.

## Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript (strict), Vite 6 |
| **CSS** | Tailwind CSS v4, custom parchment/sepia/dark themes |
| **Routing** | React Router DOM v7 |
| **Server** | Express 5 + tsx (`npm run dev`) |
| **AI** | Gemini 2.0 Flash via `@google/genai` |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Auth (Google + Email/Password) |
| **i18n** | i18next + react-i18next (en, es, de, pt, fr, ru, zh, tr) |
| **SRS** | FSRS-5 algorithm |
| **Charts** | Recharts |
| **Validation** | Zod |
| **Deployment** | Vercel (SPA rewrites + serverless) |

## Project Structure

```
api/
├── index.ts                # Express entry — mounts all route modules
├── ping.ts                 # Health check endpoint
├── _lib/                   # Server-side helpers
│   ├── firebaseAdmin.ts    # Firebase Admin SDK init
│   ├── aiPrompts.ts        # Gemini prompt templates
│   ├── aiUsage.ts          # AI usage tracking
│   ├── grammarData.ts      # Grammar concept data
│   └── basicAnalyze.ts     # Fallback morphology analysis
├── _routes/                # Modular route handlers
│   ├── ai.ts               # AI analyze, translate, explain, OCR, tutor
│   ├── lexicon.ts          # Lemma / token / dictionary lookup
│   ├── grammar.ts          # Grammar concepts & pathways
│   ├── search.ts           # Multi-source corpus search
│   ├── notes.ts            # Notebooks & notes CRUD
│   ├── audio.ts            # TTS + recording endpoints
│   ├── syntax.ts           # Treebank annotations
│   ├── manuscripts.ts      # Manuscript metadata (stub)
│   ├── courses.ts          # Classroom management (stub)
│   ├── auth.ts             # Auth helpers
│   ├── billing.ts          # Stripe billing
│   ├── admin.ts            # Admin operations
│   └── publicTexts.ts      # Public text listing
src/
├── App.tsx                  # Router: landing, auth, app pages
├── main.tsx                 # Entry point
├── index.css                # Tailwind v4 + theme variables
├── components/
│   ├── AppLayout.tsx        # Authenticated shell (Navbar + Outlet)
│   ├── Navbar.tsx           # Sidebar (desktop) / tab bar (mobile)
│   ├── ErrorBoundary.tsx
│   ├── Skeleton.tsx
│   ├── ui/                  # Shared UI primitives
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorState.tsx
│   └── reader/              # Reader sub-components
│       ├── LexDrawerPanel.tsx    # Word analysis side panel
│       ├── ReadingPane.tsx       # Token-rendered text area
│       ├── ReaderToolbar.tsx, ReaderAudioBar.tsx, ...
│       └── ParadigmModal.tsx
├── pages/
│   ├── Reader.tsx           # Full-screen reader
│   ├── Library.tsx          # Corpus + import browser
│   ├── Dashboard.tsx        # Stats, review queue, continue reading
│   ├── Review.tsx           # SM-2 flashcard session
│   ├── Vocabulary.tsx       # Vocabulary table
│   ├── Notes.tsx            # Per-word notes
│   ├── Import.tsx           # Text import pipeline
│   ├── Settings.tsx         # Preferences
│   ├── Statistics.tsx       # Charts + progress
│   ├── Subscription.tsx     # Plan / pricing
│   ├── Landing.tsx          # Public marketing page
│   ├── Search.tsx           # Multi-source corpus search
│   ├── Grammar.tsx          # Grammar pathways & reference
│   ├── Tutor.tsx            # AI philology tutor
│   ├── Notebooks.tsx        # Research notebooks
│   ├── Syntax.tsx           # Treebank viewer (in progress)
│   ├── Manuscripts.tsx      # Manuscript lab (placeholder)
│   ├── Courses.tsx          # Classroom (placeholder)
│   ├── AudioLab.tsx         # Pronunciation lab (placeholder)
│   └── auth/                # SignIn, SignUp, ForgotPassword, ResetPassword
├── store/
│   └── useStudyStore.ts     # Persistent study state (localStorage)
├── lib/
│   ├── firebase.ts          # Firebase init
│   ├── i18n.ts              # i18next config
│   ├── transliterate.ts     # Script transliteration
│   ├── constants/           # Word states, languages, storage keys
│   ├── contexts/            # AuthContext, ToastContext
│   ├── hooks/               # useKnowledge, useVocabulary, useSettings, …
│   ├── services/            # Vocabulary, Review, Settings, AI, Search, …
│   ├── grammar/             # Grammar reference data & tests
│   ├── importers/           # SBLGNT, OSHB, StepBible, OGL, Latin adapters
│   ├── srs/                 # FSRS-5 + SM-2 algorithms + tests
│   └── translations/        # en, es, de, pt, fr, ru, zh + Turkish
├── types/
│   ├── corpus.ts            # Token, Sentence, Text, Corpus, Morphology
│   ├── linguistics.ts       # LinguisticToken, GlossEntry, GrammarReference
│   ├── firestore.ts         # VocabularyItem, ImportedText, UserSettings, …
│   ├── library.ts           # (legacy, duplicates corpus.ts)
│   └── modules.ts           # Grammar, Syntax, Search, Notebook, …
└── data/
    ├── corpus.ts            # Corpus texts (SBLGNT, OSHB, Latin, …)
    ├── chapters.ts, texts.ts, tokens.ts
```

## Getting Started

### Prerequisites

- Node.js >= 18
- A Gemini API key (for AI features)

### Setup

```bash
git clone https://github.com/oliverdann7/paleoglossa-ai-studio.git
cd paleoglossa-ai-studio
npm install
```

Create `.env.local` in the project root:

```env
GEMINI_API_KEY="your_gemini_api_key"
```

### Run

```bash
npm run dev
```

Opens at `http://localhost:3000`.

### Build

```bash
npm run build    # → dist/
npm run preview  # Serve built app locally
```

### Lint

```bash
npm run lint
```

### Clean

```bash
npm run clean
```

## Architecture Documentation

- **`docs/PALEOGLOSSA_ROADMAP.md`** — Full implementation roadmap, 8 phases, data model changes, API routes, component plans, risks, licensing considerations.
- **`ROADMAP.md`** — Original 8-phase product roadmap.
- **`firestore.rules`** — Firestore security rules.
- **`firebase.json`** — Firebase project configuration (emulators, deploy targets).
- **`firestore.indexes.json`** — Composite indexes for vocabulary, review, reading progress queries.
- **`firebase-blueprint.json`** — Firestore collection and entity schema summary.
- **`security_spec.md`** — Security threat model and mitigations.

## Deployment

The project is deployed on Vercel. Pushes to `origin/main` trigger automatic production deploys.

```bash
vercel --prod
```

Environment variables required in production:
- `GEMINI_API_KEY`
- Firebase config (`VITE_FIREBASE_*` or injected via AI Studio / Vercel environment)

## License

Corpus texts are from public-domain and freely-licensed sources (SBLGNT, OSHB CC0, Perseus CC-BY-SA, Project Gutenberg). See `SourceAttribution` in each text for specific licensing. User-imported texts remain private by default.
