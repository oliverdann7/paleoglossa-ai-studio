# AGENTS.md — Paleoglossa

AI coding-agent instructions for the Paleoglossa repo.

## Project overview

Ancient-language learning platform (Ancient Greek, Latin, Hebrew, and 8 more).
Full-stack TypeScript: React 19 SPA (Vite 6) + Express 5 API + Firebase/Firestore + Gemini AI.

## Verification commands

Run these after every change. All must pass before opening a PR.

```bash
npm run type-check   # tsc --noEmit, strict mode, 0 errors expected
npm run lint         # eslint, 0 errors expected
npm test             # vitest run, all tests must pass
npm run build        # vite build, must succeed
```

Formatting (run before committing):
```bash
npm run format       # prettier --write
npm run format:check # prettier --check (CI mode)
```

E2E smoke test (requires dev server):
```bash
npm run e2e          # playwright test
```

## Key paths

| Path | Purpose |
|------|---------|
| `src/pages/` | One file per route (Reader, Library, Courses, AudioLab, …) |
| `src/components/` | Shared UI; `ui/` = primitives, `reader/` `courses/` `library/` = feature sub-components |
| `src/lib/services/` | Business logic (CourseService, vocabularyService, ImportService, …) |
| `src/lib/hooks/` | React hooks (useAuth, useKnowledge, useActiveLanguage, …) |
| `src/lib/constants/` | Stable constants: languages, wordStates, plans, storage keys |
| `src/types/` | Shared TypeScript types — prefer `corpus.ts` over legacy `library.ts` |
| `api/_routes/` | Modular Express routers (ai, audio, courses, billing, …) |
| `api/_lib/` | Shared API utilities (firebaseAdmin, auth, aiPrompts, aiUsage) |
| `src/data/corpus.ts` | All curated texts (2500+ lines) — large, edit carefully |
| `e2e/` | Playwright end-to-end tests |

## Coding constraints

- **TypeScript strict**: `noUnusedLocals` and `noUnusedParameters` are on. No `any` except where the existing code already uses it intentionally.
- **Tailwind v4** via `@tailwindcss/vite`. No PostCSS config. Do not add PostCSS.
- **Firebase client SDK** (`firebase/*`) only in `src/`. **Admin SDK** (`firebase-admin/*`) only in `api/`.
- **Gemini calls** are server-side only (`api/_routes/ai.ts`). Never call Gemini from the client.
- **React 19** — hooks follow strict rules. `react-hooks/exhaustive-deps` warnings are treated as errors in CI intent.
- **No new top-level API files** — add routes as modules in `api/_routes/` and register them in `api/index.ts`.

## Held dependency versions — do not upgrade

These are pinned to avoid breaking changes:

| Package | Held at | Reason |
|---------|---------|--------|
| `firebase` | 11.x | Major SDK API changes in v12 |
| `motion` | 11.x | Major API rewrite in v12 |
| `vitest` / coverage / ui | 2.x | Major overhaul in v4 |
| `@vitejs/plugin-react` | 4.x | Breaking changes in v6 |
| `typescript` | 5.x | Breaking changes in v6 |
| `lucide-react` | 0.469 | v1 renames icons |

## Environment variables

See `.env.example` for the full list. Key vars for local dev:
- `VITE_FIREBASE_*` — Firebase client config (injected at build time via Vite `define`)
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase Admin (base64 or JSON string)
- `GEMINI_API_KEY` — Required for AI features
- `GOOGLE_TTS_API_KEY` — Required for AudioLab TTS
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — Required for billing

## Architecture notes

- Firestore collections: see `api/_lib/firebaseAdmin.ts` and `docs/repo-health-audit.md`
- SRS algorithm: SM-2 in `src/lib/srs/sm2.ts`; FSRS stub in `src/lib/srs/fsrs.ts`
- i18n: 8 UI languages in `src/lib/translations/` (en, es, de, pt, fr, ru, zh, tr)
- All public corpus texts live in `src/data/corpus.ts` as a `CorpusDB` class
- Syntax tree and manuscript features are stubs (`Syntax.tsx`, `Manuscripts.tsx`)
