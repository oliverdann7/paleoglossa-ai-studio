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
| i18n (8 UI languages) | ✅ |
| Google / Email auth + guest mode | ✅ |
| Morphology tags + paradigm tables per token | ✅ |
| Dictionary with Logeion / Sefaria / Wiktionary lookup | ✅ |
| Corpus search (lemma + full-text) | ✅ |
| Grammar pathways, prerequisite graph, concept browser | ✅ |
| AI philology tutor (6 difficulty modes) | ✅ |
| Research notebooks with Firestore sync | ✅ |
| Cloud sync (Firestore) + demo migration | ✅ |
| Public Discover / community text library | ✅ |
| Smart text recommendations (i+1, difficulty labels, reasons) | ✅ |
| Reader notes & context-menu actions | ✅ |
| Pronunciation / AudioLab (TTS playback) | ✅ |
| Syntax / dependency treebank viewer (AI + PROIEL/Gorman) | ✅ |
| Manuscript / epigraphy lab (image pan/zoom + IIIF) | ✅ |
| Beginner Hub with milestones, script primers, daily path | ✅ |
| XP gamification, challenges, leaderboard | ✅ |
| Language-scoped content filtering (LingQ-style) | ✅ |
| 7-day review forecast | ✅ |
| Study activity heatmap | ✅ |
| Scholar profiles | ✅ |
| Classroom / course builder | 🚧 |
| User recording upload | 🚧 |

## API Routes

Routes are modularized under `api/_routes/`. Some require a Gemini API key and Firebase backend:

| Route | Method | Status | Description |
|-------|--------|--------|-------------|
| `/api/test` | POST | ✅ | Health check |
| `/api/ai/...` | POST | ✅ | AI: analyze, translate, explain, OCR, tutor chat, quiz, syntax |
| `/api/corpus` | GET | ✅ | Corpus text listing and detail |
| `/api/search` | POST | ✅ | Multi-source corpus search |
| `/api/grammar/concepts` | GET | ✅ | Grammar concepts & pathways |
| `/api/syntax/...` | GET | ✅ | Syntax treebank (AI + PROIEL/Gorman) |
| `/api/audio/tts` | POST | ✅ | TTS generation with server-side cache |
| `/api/manuscripts` | GET/POST/PATCH/DELETE | ✅ | Manuscript CRUD (image viewer, IIIF) |
| `/api/annotations` | GET/POST/DELETE | ✅ | Text annotations |
| `/api/bookmarks` | GET/POST/PATCH/DELETE | ✅ | User bookmarks |
| `/api/challenges/completions` | GET/POST | ✅ | XP challenge tracking |
| `/api/public/texts` | GET/POST | ✅ | Public/community texts |
| `/api/import/parse` | POST | ✅ | File import parsing |
| `/api/auth/me` | GET | ✅ | Current user info |
| `/api/admin/...` | GET/POST/DELETE | ✅ | Admin operations |
| `/api/courses` | GET/POST | 🚧 | Classroom management (teacher roles incomplete) |
| `/api/audio/recordings` | POST | 🚧 | User recording upload (stub) |

## Corpus Status

The corpus spans 11 languages with 60+ texts decomposed across `src/data/corpus/` (30+ module files). Texts are marked with completion status in the app.

| Language | Texts | Highlights |
|----------|-------|------------|
| **Koine Greek** | John (full), Mark, Greek NT extended | SBLGNT + MorphGNT morphology |
| **Ancient Greek** | Iliad 1, Odyssey 1, Anabasis, Aesop, Plato Apology, mini stories, patristic texts (1 Clement, Didache, Athanasius, etc.), Herodotus, Thucydides, Sophocles, Lucian | Perseus (CC BY-SA 3.0) |
| **Biblical Hebrew** | Genesis, Psalms 23, beginner texts, extended passages | OSHB (CC BY 4.0) |
| **Latin** | Aeneid 1, Caesar De Bello Gallico, Cicero In Catilinam, Ovid Metamorphoses, beginner texts, mini stories, Disticha Catonis, Horace, Livy, Sallust, Tacitus | Perseus (CC BY-SA 3.0) |
| **Septuagint (LXX)** | Genesis, Exodus, Psalms 1/33/50, Isaiah, Proverbs, Jonah | LXX (Public Domain) |
| **Syriac** | Peshitta John (extended) | Project Gutenberg (Public Domain) |
| **Coptic** | Sahidic John (extended) | Project Gutenberg (Public Domain) |
| **Aramaic** | Targum Onkelos Genesis | Project Gutenberg (Public Domain) |
| **Akkadian** | Gilgamesh (Tablets I, II, VI, X), Code of Hammurabi | Public Domain |
| **Sanskrit** | Bhagavad Gita / Mahabharata | Project Gutenberg (Public Domain) |
| **Hittite** | Annals of Mursili II | Public Domain |
| **Egyptian** | Maxims of Ptahhotep | Public Domain |
| **Ugaritic** | Baal Cycle (Aliyan Baal) | Public Domain |

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
│   ├── ai.ts               # AI analyze, translate, explain, OCR, tutor, quiz, syntax
│   ├── audio.ts            # TTS + recording endpoints
│   ├── annotations.ts      # Text annotations
│   ├── bookmarks.ts        # User bookmarks
│   ├── challenges.ts       # XP challenge completions
│   ├── corpus.ts           # Corpus text listing/detail
│   ├── courses.ts          # Classroom management (partial)
│   ├── grammar.ts          # Grammar concepts & pathways
│   ├── manuscripts.ts      # Manuscript CRUD + IIIF
│   ├── parse.ts            # File import parsing
│   ├── publicTexts.ts      # Public/community texts
│   ├── search.ts           # Multi-source corpus search
│   ├── syntax.ts           # Treebank annotations
│   ├── auth.ts             # Auth helpers
│   ├── billing.ts          # Stripe billing
│   ├── admin.ts            # Admin operations
│   └── account.ts          # Account deletion
src/
├── App.tsx                  # Router: landing, auth, app pages
├── main.tsx                 # Entry point
├── index.css                # Tailwind v4 + theme variables
├── components/
│   ├── AppLayout.tsx        # Authenticated shell (Navbar + Outlet)
│   ├── Navbar.tsx           # Sidebar (desktop) / tab bar (mobile)
│   ├── ErrorBoundary.tsx
│   ├── ui/                  # Shared UI primitives
│   ├── reader/              # Reader sub-components (LexDrawerPanel, ReadingPane, …)
│   ├── beginner/            # BeginnerHub sub-components
│   ├── corpus/              # Corpus browser components
│   ├── courses/             # Course components
│   └── library/             # Library components (RecommendationRail, CoverageBadge, …)
├── pages/
│   ├── Reader.tsx           # Full-screen reader
│   ├── Library.tsx          # Corpus browser (language-scoped)
│   ├── Dashboard.tsx        # Stats, review queue, recommendations
│   ├── Review.tsx           # FSRS-5 flashcard session
│   ├── Vocabulary.tsx       # Vocabulary table
│   ├── Dictionary.tsx       # Lemma browser + paradigm tables
│   ├── Search.tsx           # Multi-source corpus search
│   ├── Grammar.tsx          # Grammar reference
│   ├── GrammarPathways.tsx  # Tiered grammar progression
│   ├── Tutor.tsx            # AI philology tutor (6 modes)
│   ├── Syntax.tsx           # Treebank viewer
│   ├── Notebooks.tsx        # Research notebooks
│   ├── NotebookDetail.tsx   # Single notebook view
│   ├── BeginnerHub.tsx      # Onboarding hub (milestones, daily path)
│   ├── Challenges.tsx       # XP challenges & leaderboard
│   ├── Statistics.tsx       # Charts + progress + heatmap
│   ├── AudioLab.tsx         # Pronunciation lab (TTS)
│   ├── Manuscripts.tsx      # Manuscript lab (IIIF viewer)
│   ├── Courses.tsx          # Classroom (partial)
│   ├── Discover.tsx         # Community text library
│   ├── Import.tsx           # Text import pipeline
│   ├── Notes.tsx            # Per-word notes
│   ├── Settings.tsx         # Preferences
│   ├── Landing.tsx          # Public marketing page
│   └── auth/                # SignIn, SignUp, ForgotPassword, ResetPassword
├── lib/
│   ├── firebase.ts          # Firebase init
│   ├── i18n.ts              # i18next config
│   ├── transliterate.ts     # Script transliteration
│   ├── constants/           # Word states, languages, storage keys
│   ├── contexts/            # AuthContext, ToastContext, ActiveLanguageContext
│   ├── hooks/               # useKnowledge, useVocabulary, useSettings, useActiveLanguage, …
│   ├── services/            # 30+ services (AI, vocabulary, search, recommendations, …)
│   ├── grammar/             # Grammar reference data & tests
│   ├── importers/           # SBLGNT, OSHB, StepBible, OGL, Latin adapters
│   ├── srs/                 # FSRS-5 + SM-2 algorithms + tests
│   └── translations/        # en, es, de, pt, fr, ru, zh, tr
├── types/
│   ├── corpus.ts            # Token, Sentence, Text, Corpus, Morphology (canonical)
│   ├── linguistics.ts       # LinguisticToken, GlossEntry, GrammarReference
│   ├── firestore.ts         # VocabularyItem, ImportedText, UserSettings, …
│   └── modules.ts           # Grammar, Syntax, Search, Notebook, …
└── data/
    ├── corpus.ts            # Corpus orchestrator (CorpusDB)
    ├── corpus/              # Per-language/text corpus files (30+ modules)
    └── tokens.ts            # Token data for dictionary
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
