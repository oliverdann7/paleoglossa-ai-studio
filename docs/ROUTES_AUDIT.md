# Routes Audit — 2026-05-14

All routed feature pages on `main` classified by maturity.

## Legend

| Icon | Meaning |
|------|---------|
| ✅ Complete | Fully functional, no stubs |
| ⚠️ Partial | Works but has known gaps |
| 🧪 Placeholder | Page renders but uses stub/experimental data |
| ❌ Broken | Crashes or returns empty/unusable state |

---

## Public Routes

| Route | Page | Status | Notes |
|-------|------|--------|-------|
| `/` | Landing.tsx | ✅ **Complete** | Full landing page with features, CTA, demo mode |
| `/pricing` | Subscription.tsx | ⚠️ **Partial** | Plan cards render; Stripe integration requires API key |

## Auth Routes

| Route | Page | Status | Notes |
|-------|------|--------|-------|
| `/auth/login` | SignIn.tsx | ✅ **Complete** | Email/password + Google OAuth |
| `/auth/signup` | SignUp.tsx | ✅ **Complete** | Registration form |
| `/auth/forgot-password` | ForgotPassword.tsx | ✅ **Complete** | Password reset email |
| `/auth/reset-password` | ResetPassword.tsx | ✅ **Complete** | Reset with oobCode |
| `/onboarding` | Onboarding.tsx | ⚠️ **Partial** | Language selection flow works; may need polish |

## App Routes (Authenticated)

| Route | Page | Status | Notes |
|-------|------|--------|-------|
| `/app` | Dashboard.tsx | ✅ **Complete** | Real stats, reading progress, review queue, streak |
| `/app/library` | Library.tsx | ✅ **Complete** | Filterable text grid, coverage badges, recommendations |
| `/app/language/:langId` | Language.tsx | ✅ **Complete** | Language detail with texts grouped by level |
| `/app/reader/:textId` | Reader.tsx | ✅ **Complete** | Two reading modes, parallel text, audio, knowledge states |
| `/app/vocabulary` | Vocabulary.tsx | ✅ **Complete** | Searchable word list with status filters, pagination |
| `/app/dictionary` | Dictionary.tsx | ✅ **Complete** | Corpus-derived entries with lemma search, examples |
| `/app/dictionary/:lang/:lemma` | Dictionary.tsx | ✅ **Complete** | Direct entry lookup by language + lemma |
| `/app/review` | Review.tsx | ✅ **Complete** | SM-2 SRS with 4 ratings, multiple card types |
| `/app/statistics` | Statistics.tsx | ✅ **Complete** | Charts, learning curve, language breakdown |
| `/app/notes` | Notes.tsx | ✅ **Complete** | Per-lemma notes with CRUD |
| `/app/settings` | Settings.tsx | ✅ **Complete** | Theme, font, audio, goals, dictionaries, export, reset |
| `/app/subscription` | Subscription.tsx | ⚠️ **Partial** | Plan cards, Stripe checkout; requires API key |
| `/app/search` | Search.tsx | ✅ **Complete** | Cross-source search (imports, vocab, notes, public texts) |
| `/app/tutor` | Tutor.tsx | ⚠️ **Partial** | Chat UI works; sessions persist to Firestore; session list works |
| `/app/notebooks` | Notebooks.tsx | ⚠️ **Partial** | CRUD UI works; no note-anchoring in Reader yet |
| `/app/grammar` | Grammar.tsx | ⚠️ **Partial** | 10+ real concepts from Greek cases/verbs/nouns; limited scope |
| `/app/syntax` | Syntax.tsx | 🧪 **Placeholder** | Shows "Experimental" page; no treebank data yet |
| `/app/manuscripts` | Manuscripts.tsx | 🧪 **Placeholder** | Shows "Experimental" page; no manuscript data yet |
| `/app/courses` | Courses.tsx | 🧪 **Placeholder** | Shows "Experimental" page; no course data yet |
| `/app/audio-lab` | AudioLab.tsx | 🧪 **Placeholder** | Tests TTS availability + pronunciation guides; functional |

## Admin Routes

| Route | Page | Status | Notes |
|-------|------|--------|-------|
| `/admin/import` | Import.tsx | ✅ **Complete** | Paste/file/URL/OCR import with language analysis |
| `/admin` | AdminDashboard.tsx | ⚠️ **Partial** | User/text stats; requires admin email |

---

## Summary

| Status | Count | Pages |
|--------|-------|-------|
| ✅ Complete | 16 | Landing, SignIn, SignUp, ForgotPassword, ResetPassword, Dashboard, Library, Language, Reader, Vocabulary, Dictionary, Review, Statistics, Notes, Settings, Search |
| ⚠️ Partial | 7 | Subscription, Onboarding, Tutor, Notebooks, Grammar, AdminDashboard, Import |
| 🧪 Placeholder | 4 | Syntax, Manuscripts, Courses, AudioLab |
| ❌ Broken | 0 | — |

**No pages are broken.** All routes render without crashing.

## Key Gaps

1. **Syntax, Manuscripts, Courses, AudioLab** are placeholders — pages exist but have no real data
2. **Tutor** — sessions persist to Firestore and can be reloaded, but no suggested questions or context-aware reader integration
3. **Grammar** — concepts are real but limited (~10 Greek concepts); no Hebrew/Latin grammar yet
4. **Subscription** — requires Stripe API key for real payments; plan comparison works offline
5. **Notebooks** — CRUD works but no Reader integration (can't anchor notes to passages yet)
