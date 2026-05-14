# AI Coding Guardrails — paleoglossa-ai-studio

> **Purpose:** Prevent architectural drift, duplicated files, broken routes, unsafe Firebase/Gemini usage, and forbidden imports when Claude or Codex works on this repo.
> **Scope:** This document only applies to `paleoglossa-ai-studio`. It is not universal advice.

---

## 1. Required Workflow Before Any Code Change

Before writing a single line of code, this exact sequence must run:

```bash
# 1. Check for uncommitted changes
git status
# If there are uncommitted changes, STOP. Report them to the user.
# Do not create a branch or PR until the tree is clean.

# 2. Switch to main and get the latest
git checkout main
git pull origin main

# 3. Verify main is green
npm run type-check
npm run lint
npm run build
npm test
# If any of these fail, report before proceeding.
```

Only after these steps pass should you create a branch and start work.

---

## 2. Search-Before-Create Rule

**Never write a new file without first confirming it does not already exist.**

```bash
# Search for the file by name
find . -not -path './node_modules/*' -not -path './.git/*' -not -path './dist/*' -iname "*keyword*"

# Search for existing content
rg -il "function name or concept" --glob '!node_modules' --glob '!.git' --glob '!dist'
```

This applies especially to:
- **Service files** — check `src/lib/services/` before adding a new service
- **Hook files** — check `src/lib/hooks/` before adding a new hook
- **Component files** — check `src/components/` and its subdirectories
- **Type definitions** — check `src/types/corpus.ts` and `src/types/firestore.ts` first (these are the canonical type files)
- **Test files** — check `src/**/__tests__/` and `api/__tests__/` before adding a new test suite
- **Route handlers** — check `api/index.ts` or `api/routes/` before adding a new endpoint
- **Translation keys** — check `src/lib/translations/en.ts` before adding new i18n keys
- **Documentation** — check `docs/` before adding a new doc file

### Exceptions

Files that SHOULD be created (never exist yet):
- `docs/roadmap.md` — canonical product roadmap
- `docs/dependency-security-audit.md` — dependency audit
- `docs/repo-health-audit.md` — repo health audit
- `AGENTS.md` — AI tooling conventions (does not exist yet)

---

## 3. No Duplicate Services / Components / Hooks / Types

| What | Where to Check First | Secondary Location |
|------|---------------------|-------------------|
| **Service** | `src/lib/services/` | Check `api/_lib/` for server-side equivalent |
| **Component** | `src/components/` | Also check subdirectories (`reader/`, `library/`) |
| **Hook** | `src/lib/hooks/` | Inline in page files (should be extracted) |
| **Type** | `src/types/corpus.ts` or `src/types/firestore.ts` | `src/types/modules.ts` for feature-specific types |
| **Translation** | `src/lib/translations/en.ts` | Per-language files in same directory |
| **API route** | `api/index.ts` or `api/routes/` | Check both files |
| **Test** | `src/**/__tests__/` or `api/__tests__/` | Test files next to source files |
| **Import adapter** | `src/lib/importers/` | Check `src/lib/importers/adapters/` |
| **SRS algorithm** | `src/lib/srs/` | Only `sm2.ts` and `fsrs.ts` exist |
| **Dictionary data** | `src/lib/data/` | `dictionary.ts`, `dictionaryDB.ts`, `languages.ts` |

**If a similar file already exists, extend it. Do not create a new one.**

### Two Dead Components (do not recreate)

These were intentionally removed and must NOT be recreated:
- `src/components/LexDrawer.tsx` — use `LexDrawerPanel.tsx` instead
- `src/components/FastWordPopup.tsx` — use `GlossTooltip.tsx` instead

---

## 4. Current Architecture Boundaries

### Frontend (src/)

```
src/
├── App.tsx              → Router definition (only)
├── main.tsx             → Entry point (only)
├── index.css            → Tailwind entry + theme variables
├── components/          → Reusable UI components
├── pages/               → Route-level page components
├── lib/
│   ├── contexts/        → React providers (Auth, Toast, Subscription, ActiveLanguage)
│   ├── hooks/           → Custom hooks (useVocabulary, useKnowledge, useSettings, …)
│   ├── services/        → Data access and business logic
│   ├── data/            → Static data (dictionary, languages)
│   ├── constants/       → Enums and config constants
│   ├── importers/       → Text import adapters
│   ├── srs/             → Spaced repetition algorithms
│   └── translations/    → i18n locale files
├── types/               → TypeScript interfaces (corpus.ts, firestore.ts, modules.ts)
├── store/               → Legacy localStorage store (useStudyStore.ts)
└── data/                → Static corpus text data
```

**Rules:**
- New page components go in `src/pages/`
- New reusable components go in `src/components/` or a named subdirectory
- New hooks go in `src/lib/hooks/`
- New services go in `src/lib/services/`
- New types go in `src/types/` — prefer extending existing files over creating new ones
- Do NOT create `src/utils/` or `src/helpers/` — put utility functions in `src/lib/utils.ts`
- Do NOT create `src/store/` entries — the existing `useStudyStore.ts` is legacy; new state belongs in hooks or context

### Server (api/)

```
api/
├── index.ts             → Express app (all routes, target: split into routes/)
├── _lib/
│   ├── firebaseAdmin.ts → Firebase Admin SDK init
│   ├── auth.ts          → requireAuth / optionalAuth middleware
│   ├── aiPrompts.ts     → Gemini prompt templates
│   ├── aiValidation.ts  → Zod schemas for AI responses
│   ├── aiUsage.ts       → Per-user quota tracking
│   └── basicAnalyze.ts  → Rule-based tokenization fallback
└── __tests__/           → API integration tests
```

**Rules:**
- New route handlers should be added to the existing `api/index.ts` OR extracted into `api/routes/{domain}.ts` (preferred for large domains)
- New server-side utilities go in `api/_lib/`
- Never import client-side code (src/) into api/ — they run in different environments
- Never import server-side code (api/) into src/ — API keys would be exposed

### Firebase Client (src/lib/firebase.ts)

- Initialized via Vite `__FIREBASE_CONFIG__` build-time injection
- Provides `auth`, `db`, `googleProvider`
- Firebase API key is compiled into the browser bundle (this is by design — Firebase security comes from rules, not key secrecy)
- **App Check is not configured**

### Firebase Admin (api/_lib/firebaseAdmin.ts)

- Lazy initialization: JSON → individual env vars → ADC → graceful fallback in dev
- Proxy-based access that throws if admin SDK is unavailable
- **Never import this into the client bundle** (contains service account credentials)

### Gemini AI

- **Server-side only.** All AI calls go through Express API routes.
- Client sends requests via `src/lib/services/aiClient.ts` → `apiFetch()` → Express endpoint.
- Server calls `@google/genai` dynamically with `process.env.GEMINI_API_KEY`.
- Per-user daily quota tracked in Firestore `aiUsage/{uid}`.
- Zod validation of all AI responses via `parseAndValidateAIResponse()`.
- Fallback: `basicAnalyze()` for rule-based Greek tokenization when Gemini fails.

---

## 5. Forbidden Imports / Frameworks

These must NEVER appear in package.json or any import statement:

| Technology | Why |
|------------|-----|
| **Next.js** | Vite SPA is final. No SSR needed. Would require full rewrite. |
| **Prisma** | Firestore is the data layer. Prisma needs a relational DB. |
| **PostgreSQL** | No relational data model. All data is user-owned documents. |
| **Turborepo** | Single-package repo. Monorepo tooling is overhead with no benefit. |
| **Auth.js / NextAuth** | Firebase Auth covers auth needs. Second auth library would conflict. |
| **Redux / Zustand / Jotai** | React Context + hooks handle all state. No global store needed. |
| **Tailwind v3** | Already on v4 with `@tailwindcss/vite` plugin. v3 would be a downgrade. |
| **React Router v5/v6** | Already on v7 with `BrowserRouter`. |
| **Algolia / Meilisearch** | Search works via Firestore queries + client filtering. Premature at current scale. |
| **Prisma** | (repeated for emphasis) No relational data modeling needed. |
| **GoogleGenAI old import** | Use `@google/genai` (already installed), not the older `@google-ai/generativelanguage` or REST calls. |
| **node-fetch / cross-fetch** | Node 18+ has native `fetch`. No polyfill needed. |
| **UUID library** | Firestore auto-generates document IDs. No `uuid` package needed. |

### What to Use Instead

| Need | Use |
|------|-----|
| **API calls from client** | `src/lib/services/apiFetch.ts` (auth-aware fetch wrapper) |
| **Server-side API** | Express routes in `api/index.ts` or `api/routes/` |
| **Database** | Firestore via `src/lib/firebase.ts` (client) or `api/_lib/firebaseAdmin.ts` (server) |
| **Auth** | Firebase Auth via `src/lib/contexts/AuthContext.tsx` |
| **AI** | `@google/genai` via `api/index.ts` (server-side dynamic import) |
| **Forms** | Native React state or URL params — no form library needed |
| **Date formatting** | `date-fns` (already installed) |
| **Classnames** | `clsx` + `tailwind-merge` via `src/lib/utils.ts` `cn()` helper |
| **Validation** | `zod` (already installed) |
| **Icons** | `lucide-react` (already installed) |
| **Charts** | `recharts` (already installed) |
| **Markdown** | `react-markdown` + `remark-gfm` (already installed) |

---

## 6. Firebase / Gemini / API Key Safety

### Never Commit Secrets

- **Do not commit** `.env`, `.env.local`, or any file containing real API keys.
- Firebase service account JSON must never be committed. If a test fixture needs fake credentials, use `test/fixtures/fake-service-account.json` (not yet created).
- `firebase-applet-config.json` is checked in — it contains the client-facing Firebase config (API key, project ID), which is safe because these values are already compiled into the JS bundle.

### Environment Variables

| Variable | Exposed to client? | Where used |
|----------|-------------------|------------|
| `VITE_FIREBASE_*` | **Yes** (compiled into JS bundle) | `src/lib/firebase.ts` via Vite `__FIREBASE_CONFIG__` |
| `GEMINI_API_KEY` | **No** (server-only) | `api/index.ts` — `process.env.GEMINI_API_KEY` |
| `STRIPE_SECRET_KEY` | **No** (server-only) | `api/index.ts` |
| `STRIPE_WEBHOOK_SECRET` | **No** (server-only) | `api/index.ts` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **No** (server-only) | `api/_lib/firebaseAdmin.ts` |

**Rule:** Any new API key must be server-side only unless it is a Firebase Web SDK key (which is public by design).

### Stripe Webhook Safety

The Stripe webhook endpoint (`POST /api/stripe/webhook`) must:
1. Capture the raw request body BEFORE `express.json()` parses it (already implemented with `req.rawBody`).
2. Verify the signature with `stripe.webhooks.constructEvent()`.
3. Never trust client-provided data for `currentPlan` or `stripeCustomerId`.

### Firestore Security Rules

- `firestore.rules` enforces per-user data isolation for all `users/{uid}/` collections.
- `publicTexts/` and `texts/` are world-readable, server-writable.
- `syntaxAnnotations/` is world-readable, server-writable.
- If adding a new collection, add corresponding security rules in `firestore.rules` and indexes in `firestore.indexes.json`.

---

## 7. TypeScript Quality Expectations

### Project Configuration

- `strict: true` — all strict checks enabled
- `noUnusedLocals: true` — will error on unused variables
- `noUnusedParameters: true` — will error on unused parameters
- `skipLibCheck: true` — skip `.d.ts` checking for faster compiles
- `moduleResolution: "bundler"` — Vite-compatible resolution
- Path alias `@/*` maps to `./src/*`

### Coding Rules

1. **No `any` unless necessary** — `@typescript-eslint/no-explicit-any` is disabled (project choice), but prefer proper types.
2. **No `@ts-ignore` / `@ts-expect-error` without a comment** — `@typescript-eslint/ban-ts-comment` is disabled, but every suppression must have a justification comment.
3. **Prefer interfaces over types for public APIs** — existing code uses both; be consistent with the surrounding file.
4. **Use Zod for runtime validation** — AI responses (via `parseAndValidateAIResponse`), import validation, API request bodies.
5. **No unused eslint-disable directives** — there are currently 5 in the codebase that should be cleaned up rather than added to.
6. **Hook dependencies must be complete** — missing deps cause stale closures. The 6 current warnings in `Reader.tsx`, `Dashboard.tsx`, `Vocabulary.tsx`, and `SubscriptionContext.tsx` should be fixed, not replicated.

---

## 8. UI / Design Consistency Expectations

### Component Patterns

- **Icons:** Use `lucide-react`. Import named exports: `import { BookOpen } from "lucide-react"`.
- **Classnames:** Use the `cn()` helper from `src/lib/utils.ts` for conditional classes.
- **CSS:** Tailwind utility classes only (except theme variables in `src/index.css`). No CSS modules, no styled-components.
- **Theming:** Use the existing parchment/sepia/dark theme system via CSS custom properties defined in `src/index.css`.

### Existing Components to Reuse

| Need | Component |
|------|-----------|
| Loading state | `Skeleton.tsx` |
| Icon wrapper | `PaleoIcon.tsx` (for the logo) |
| Auth-gated layout | `AppLayout.tsx` |
| Route protection | `AuthGuard.tsx` |
| Error fallback | `ErrorBoundary.tsx` |
| User avatar | `UserProfileCard.tsx` |
| Language picker | `LanguageSwitcher.tsx` |
| Interface language | `InterfaceLanguageSwitcher.tsx` |
| Toast notifications | `useToast()` hook |
| Side panel | `LexDrawerPanel.tsx` (for lexical data) |
| Progress ring | `ProgressRing.tsx` |

### Naming Conventions

- **Files:** PascalCase for components (`ReadingPane.tsx`), camelCase for hooks/services (`useVocabulary.ts`, `vocabularyService.ts`)
- **Exports:** Named exports for components (`export const ReadingPane = ...`), default exports for pages
- **Directories:** camelCase (`reader/`, `library/`, `auth/`, `admin/`)
- **Routes:** kebab-case (`/app/audio-lab`, `/app/forgot-password`)
- **Firestore collections:** camelCase (`publicTexts`, `readingProgress`, `reviewLogs`)
- **Translations keys:** dot-notation (`reader.gloss.toggle`, `nav.library`)

---

## 9. Testing / Check Commands

Run these commands after every change:

```bash
# Required before committing
npm run type-check
npm run lint
npm run build

# If tests exist for the changed code
npm test

# If the change modifies API routes
npm test -- --run api/__tests__/

# If the change is visual
# Manually verify in browser (no visual regression tests exist yet)

# Check for whitespace issues
git diff --check
```

### Current Test Status (baseline)

- `npm run type-check`: 0 errors
- `npm run lint`: 0 errors, 19 warnings (all pre-existing)
- `npm run build`: success, 3371 modules
- `npm test`: 22 files, 185 tests, all passing

If any of these regress due to your change, fix them before committing.

### Environment Variables Needed for Tests

Tests do not require real API keys. They mock or stub external services. However, if adding a new test that touches:
- **Firebase** — stub `getFirestore`, `getAuth`, etc. (see existing tests for patterns)
- **Gemini AI** — mock the `@google/genai` module (see `api/__tests__/aiAnalyze.test.ts` for patterns)
- **Stripe** — mock stripe methods or use test mode keys
- **localStorage** — the test setup (`src/test-setup.ts`) provides a polyfill

---

## 10. PR Discipline

### Branch Naming

```
<type>/<short-description>

Types:
  feat/     → new feature
  fix/      → bug fix
  chore/    → maintenance, dependency updates, tooling
  refactor/ → code restructuring (no behavior change)
  docs/     → documentation only
  perf/     → performance optimization
```

Examples: `feat/reader-virtualization`, `fix/vocabulary-sync-bug`, `chore/remove-dead-components`, `docs/roadmap-update`

### Commit Messages

```
<type>: <brief description>

Optional body with details.
```

Examples:
- `feat: add virtualized sentence rendering to Reader`
- `fix: correct stale closure in useVocabulary.markPageAsSeen`
- `chore: remove LexDrawer and FastWordPopup dead components`
- `docs: update roadmap with phase completion notes`

### Workflow

```bash
# After making changes
git add <files>
git commit -m "<type>: <description>"
git push -u origin <branch-name>

# Create PR (do NOT merge)
gh pr create --base main --head <branch-name> --title "<Title>" --body "<Body>"
```

### Golden Rules

1. **Do not merge your own PR.** Leave it for human review.
2. **Do not force-push to main.** If you need to rebase, use a feature branch.
3. **Do not commit secrets.** See section 6.
4. **Do not make unrelated changes.** Each PR should do exactly one thing.
5. **Do not rewrite the entire app.** Prefer small, safe, incremental changes.
6. **Do not copy code from paleoglossa-app.** Write native implementations using this repo's existing patterns.

---

## 11. How to Handle Partially Implemented Features

Many pages and features in this repo are stubs or partially implemented:

| Feature | Current State |
|---------|---------------|
| **Syntax** | Placeholder page (`/app/syntax`) — "Experimental" message |
| **Manuscripts** | Placeholder page (`/app/manuscripts`) — "Experimental" message |
| **Courses** | Placeholder page (`/app/courses`) — "Experimental" message |
| **AudioLab** | Placeholder page (`/app/audio-lab`) — TTS test UI works |
| **Grammar** | ~10 real Greek concepts, no pathway/adaptivity |
| **Tutor** | Chat UI works, sessions persist, no reader context integration |
| **Notebooks** | CRUD UI works, no reader anchoring |
| **AI pronunciation** | Endpoint exists, response format defined |
| **Lemma API** | Routes registered, returns `null` |

**When encountering a partial implementation:**

1. **Check if the page exists** before creating a new one (search-before-create).
2. **Extend the existing file** — don't create a new page alongside the old one.
3. **Use the existing service** — if a `*Service.ts` file exists, add methods to it rather than creating a new service.
4. **Use the existing types** — extend the interfaces in `src/types/modules.ts` or the appropriate type file.
5. **Use the existing API routes** — extend `api/index.ts` routes rather than creating a new route file (unless Phase 1 route split is complete).

---

## 12. Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Build config, PWA, Tailwind, chunk splitting |
| `tsconfig.json` | TypeScript strict mode config |
| `eslint.config.mjs` | Linter rules (ESLint flat config) |
| `server.ts` | Express dev server + Vite middleware |
| `api/index.ts` | All Express API routes |
| `src/main.tsx` | React entry point |
| `src/App.tsx` | Router definition with lazy imports |
| `src/lib/firebase.ts` | Firebase client SDK init |
| `api/_lib/firebaseAdmin.ts` | Firebase Admin SDK init |
| `src/lib/i18n.ts` | i18next config |
| `src/index.css` | Tailwind entry + theme variables |
| `firestore.rules` | Firestore security rules |
| `firestore.indexes.json` | Composite indexes |
| `docs/roadmap.md` | Product roadmap |
| `docs/dependency-security-audit.md` | Dependency audit |
| `docs/repo-health-audit.md` | Repo health audit |
| `SECURITY_NOTES.md` | Field ownership documentation |
| `security_spec.md` | Threat model |
