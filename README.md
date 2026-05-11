# Παλαιόγλωσσα — Paleoglossa

> An ultra-modern, editorial-grade platform for studying ancient languages through immersive reading.

Read the ancient world, word by word. Paleoglossa combines an ancient-text reader, morphology engine, spaced-repetition vocabulary, AI philology tools, and a growing corpus library — all in one scholarly-grade platform.

**Production:** https://paleoglossa-ai-studio.vercel.app

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
| SM-2 spaced repetition reviews | ✅ |
| AI word / phrase / paradigm explanations | ✅ |
| Text import (paste, file, URL, OCR) | ✅ |
| Reading progress, streak, daily goals | ✅ |
| Parallel text display | ✅ |
| Transliteration toggles | ✅ |
| i18n (7 languages) | ✅ |
| Google / Email auth + guest mode | ✅ |
| Morphology tags per token | ✅ |
| External dictionary links | ✅ |
| Corpus search | 🚧 |
| Lemma browser with paradigm tables | 🚧 |
| Grammar pathways | 🚧 |
| Syntax / treebank viewer | 🚧 |
| AI philology tutor | 🚧 |
| Research notebook | 🚧 |
| Manuscript / epigraphy lab | 🚧 |
| Pronunciation lab | 🚧 |
| Classroom / course builder | 🚧 |

## Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript (strict), Vite 6 |
| **CSS** | Tailwind CSS v4, custom parchment/sepia/dark themes |
| **Routing** | React Router DOM v7 |
| **Server** | Express 5 + tsx (`npm run dev`) |
| **AI** | Gemini 2.5 Flash via `@google/genai` |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Auth (Google + Email/Password) |
| **i18n** | i18next + react-i18next (en, es, de, pt, fr, ru, zh) |
| **SRS** | SM-2 algorithm |
| **Charts** | Recharts |
| **Validation** | Zod |
| **Deployment** | Vercel (SPA rewrites + serverless) |

## Project Structure

```
src/
├── App.tsx                  # Router: landing, auth, app pages
├── main.tsx                 # Entry point
├── index.css                # Tailwind v4 + theme variables
├── components/
│   ├── AppLayout.tsx        # Authenticated shell (Navbar + Outlet)
│   ├── Navbar.tsx           # Sidebar (desktop) / tab bar (mobile)
│   ├── ErrorBoundary.tsx
│   ├── Skeleton.tsx
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
│   ├── Search.tsx           # Corpus search (placeholder)
│   ├── Grammar.tsx          # Grammar pathways (placeholder)
│   ├── Tutor.tsx            # AI tutor (placeholder)
│   ├── Syntax.tsx           # Treebank viewer (placeholder)
│   ├── Notebooks.tsx        # Research notebooks (placeholder)
│   ├── Manuscripts.tsx      # Manuscript lab (placeholder)
│   ├── Courses.tsx          # Classroom (placeholder)
│   ├── AudioLab.tsx         # Pronunciation lab (placeholder)
│   └── auth/                # SignIn, SignUp, ForgotPassword, ResetPassword
├── lib/
│   ├── firebase.ts          # Firebase init
│   ├── i18n.ts              # i18next config
│   ├── transliterate.ts     # Script transliteration
│   ├── constants/           # Word states, languages, storage keys
│   ├── contexts/            # AuthContext, ToastContext
│   ├── hooks/               # useKnowledge, useVocabulary, useSettings, …
│   ├── services/            # Vocabulary, Review, Settings, AI, Search, …
│   ├── importers/           # SBLGNT, OSHB, StepBible, OGL, Latin adapters
│   ├── srs/                 # SM-2 algorithm + tests
│   └── translations/        # en, es, de, pt, fr, ru, zh
├── types/
│   ├── corpus.ts            # Token, Sentence, Text, Corpus, Morphology
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
