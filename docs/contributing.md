# Contributing to Paleoglossa

## Quick start

```bash
git clone https://github.com/oliverdann7/paleoglossa-ai-studio
cd paleoglossa-ai-studio
npm install
cp .env.example .env  # fill in required variables
npm run dev           # http://localhost:3000
```

## Required environment variables

| Variable | Where to get it |
|----------|----------------|
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project settings |
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project settings |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Console → Service Accounts → Generate key (paste JSON or base64) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) |

See `.env.example` for the full list including optional variables (Stripe, PostHog, Sentry, TTS).

## Verification (run before every PR)

```bash
npm run type-check   # TypeScript strict — 0 errors
npm run lint         # ESLint — 0 errors
npm test             # Vitest — all passing
npm run build        # Vite production build — must succeed
```

Formatting:

```bash
npm run format       # prettier --write
npm run format:check # CI mode
```

E2E (requires dev server):

```bash
npm run e2e
```

## Branch + PR workflow

- Branch from `main`: `git checkout -b feat/your-feature`
- Keep PRs small and focused — one logical change per PR
- Never commit directly to `main`
- Every PR must pass CI (type-check → lint → test → build)
- Reference the roadmap item in the PR description where applicable

## Project layout

```
src/
  pages/          # One file per route (Reader, Library, Courses, …)
  components/     # Shared UI components
    ui/           # Primitive components (Button, Modal, …)
    reader/       # Reader-specific components
    courses/      # Course-specific components
  lib/
    services/     # Business logic (CourseService, vocabularyService, …)
    hooks/        # React hooks (useAuth, useKnowledge, …)
    constants/    # Stable constants (languages, wordStates, plans)
  types/          # TypeScript types — use corpus.ts, not library.ts
  data/corpus/    # Per-text corpus data files

api/
  _routes/        # Modular Express routers (ai, audio, courses, billing, …)
  _lib/           # Shared API utilities (firebaseAdmin, auth, aiPrompts, …)
  index.ts        # Express app setup, router registration
```

## Adding a new API route

1. Create `api/_routes/yourFeature.ts` and export a default `Router`
2. Register it in `api/index.ts`: `import yourRouter from './_routes/yourFeature.js'; app.use(yourRouter);`
3. Use `.js` extensions on all relative imports (ESM + Vercel requirement)
4. Protect routes with `requireAuth` from `api/_lib/auth.js`

## Adding a new page

1. Create `src/pages/YourPage.tsx`
2. Add a route in `src/App.tsx` (or the relevant route group)
3. Lazy-load with `React.lazy(() => import('./pages/YourPage.js'))` to keep the initial bundle lean

## TypeScript rules

- `strict` mode is on — no implicit `any`, no unused locals/parameters
- Use `src/types/corpus.ts` and `src/types/firestore.ts` for shared types
- `src/types/library.ts` is legacy — do not add to it
- Only use `any` where existing code already does (e.g. Express middleware)

## Tailwind v4

- Tailwind v4 is configured via `@tailwindcss/vite` — no PostCSS config
- Use design tokens: `text-ink`, `text-ink2`, `text-muted`, `bg-parch`, `bg-parch2`, `border-bdr`, `text-blue`
- Dark/sepia/parchment themes are toggled via a class on `<html>`

## Firebase rules

- **Client SDK** (`firebase/*`): only in `src/`
- **Admin SDK** (`firebase-admin/*`): only in `api/`
- Never call Gemini from the client — all AI calls go through `api/_routes/ai.ts`

## Adding corpus text

See `docs/CORPUS_IMPORT_GUIDE.md` for the full guide. Short version:

1. Add sentences to `src/data/corpus/expanded-sections.ts` using the `sent()` helper
2. Register in `CorpusDB.getSection()` in `src/data/corpus.ts`
3. Update the `Text` definition with new section IDs
4. Run type-check + lint + build

## Held dependency versions

| Package | Held at | Reason |
|---------|---------|--------|
| `firebase` | 11.x | Major SDK API changes in v12 |
| `motion` | 11.x | Major API rewrite in v12 |
| `vitest` | 2.x | Major overhaul in v4 |
| `@vitejs/plugin-react` | 4.x | Breaking changes in v6 |
| `typescript` | 5.x | Breaking changes in v6 |
| `lucide-react` | 0.469 | v1 renames icons |

Do not upgrade these without a dedicated PR and full regression test.

## Writing tests

- **Unit tests**: `src/**/*.test.ts` — run with `npm test`
- **E2E tests**: `e2e/*.spec.ts` — run with `npm run e2e` (requires dev server)
- Known gaps: Stripe webhook handling, Gemini rate-limiting fallback, RTL languages, accessibility

## Commit messages

Follow conventional commits:

```
feat(scope): short description
fix(scope): what was broken
docs(scope): what docs changed
perf(scope): performance improvement
refactor(scope): no behavior change
test(scope): tests added or updated
chore(scope): build, deps, config
```

## Reporting issues

Open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS if UI issue
- Relevant console errors or network responses
