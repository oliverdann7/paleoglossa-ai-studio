# Dependency & Security Audit — paleoglossa-ai-studio

> **Audit date:** 2026-05-14  
> **Branch:** `main` @ `324f925`  
> **Focus:** Dependencies, vulnerabilities, API key handling, client/server boundary risks, upgrade recommendations.

---

## 1. Package Manager & Lockfile

| Property | Value |
|----------|-------|
| **Package manager** | npm  (lockfile: `package-lock.json`) |
| **Lockfile version** | 3 (Node.js 22.x native) |
| **Lockfile size** | 17,123 lines, 1,185 `node_modules/` entries |
| **Total installed packages** | 1,047 (after `npm update` + `npm audit fix`) |
| **Engines field** | ❌ **Missing** — no Node.js version pin in `package.json` |
| **Integrity** | ✅ Consistent (`npm install` confirms) |

Other lockfiles checked: no `yarn.lock`, `pnpm-lock.yaml`, or `bun.lock` present.

---

## 2. Dependency Categories

### Runtime Dependencies (27 packages)

| Category | Packages | Count |
|----------|----------|-------|
| **UI Framework** | `react`, `react-dom` | 2 |
| **Routing** | `react-router-dom` | 1 |
| **Styling** | `tailwind-merge`, `clsx` | 2 |
| **Animation** | `motion` | 1 |
| **Icons** | `lucide-react` | 1 |
| **Charts** | `recharts` | 1 |
| **Markdown** | `react-markdown`, `remark-gfm` | 2 |
| **i18n** | `i18next`, `react-i18next` | 2 |
| **Date** | `date-fns` | 1 |
| **Validation** | `zod` | 1 |
| **Firebase Client** | `firebase` | 1 |
| **Firebase Admin** | `firebase-admin` | 1 |
| **Google AI** | `@google/genai` | 1 |
| **Payments** | `stripe` | 1 |
| **Server** | `express` | 1 |
| **Mobile** | `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` | 4 |
| **State sync** | `use-sync-external-store` (bundled via React 19) | 0 |

### Dev Dependencies (22 packages)

| Category | Packages | Count |
|----------|----------|-------|
| **Build** | `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-pwa` | 4 |
| **TypeScript** | `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `@types/express` | 5 |
| **Lint** | `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `@firebase/eslint-plugin-security-rules` | 7 |
| **Test** | `vitest`, `@vitest/coverage-v8`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | 7 |
| **Compiler** | `babel-plugin-react-compiler` | 1 |
| **CSS** | `tailwindcss`, `autoprefixer` | 2 |
| **Runtime** | `tsx` | 1 |

---

## 3. Vulnerability Report (`npm audit`)

### Resolved This Session

| ID | Package | Severity | Description | Fix |
|----|---------|----------|-------------|-----|
| GHSA-qx2v-qp2m-jg93 | `postcss` < 8.5.10 | **High** | XSS via unescaped `</style>` in CSS stringify | ✅ `npm audit fix` resolved to 8.5.10 |

### Remaining (cannot fix without breaking changes)

| ID | Package | Severity | Affected Versions | Chain | Action |
|----|---------|----------|-------------------|-------|--------|
| GHSA-vpq2-c234-7xj6 | `@tootallnate/once` | Low (8 advisories) | < 3.0.1 | `firebase-admin` → `@google-cloud/storage` → `teeny-request` → `http-proxy-agent` → `@tootallnate/once` | ⛔ Blocked upstream. `npm audit fix --force` would downgrade `firebase-admin` from 13.x to 10.x (breaking). |
| GHSA-67mh-4wv8-2f99 | `esbuild` ≤ 0.24.2 | Moderate (7 advisories) | ≤ 0.24.2 | `vitest` 2.x bundles its own esbuild | ⛔ Fix requires `vitest` 4.x (major breaking). `vite` 6.4.2 itself is patched (its bundled esbuild was updated). |

**Totals: 15 remaining (8 low, 7 moderate). Zero high/critical.**

These are transitive dependency issues with no safe fix. Both require upstream package maintainers to update their dependency chains, or major version migrations of the direct dependencies.

---

## 4. Outdated Packages (`npm outdated`)

All packages within their `^` semver ranges are **already at "Wanted" version** (safe updates applied).

### Held at Current (all major jumps — no safe upgrade path)

| Package | Current | Latest | Jump | Risk |
|---------|---------|--------|------|------|
| `firebase` | 11.10.0 | 12.13.0 | 11 → 12 | Major SDK API changes. New Firestore SDK patterns. |
| `firebase-admin` | 13.9.0 | — | — | Dep chain fix blocked; latest is same. |
| `motion` (framer-motion v11) | 11.18.2 | 12.38.0 | 11 → 12 | API rewrite. `AnimatePresence`, layout animations changed. |
| `lucide-react` | 0.469.0 | 1.15.0 | 0 → 1 | v1 has icon renames and tree-shaking changes. |
| `@vitejs/plugin-react` | 4.7.0 | 6.0.1 | 4 → 6 | Jumps 4 → 6. May require React Compiler config changes. |
| `vitest` | 2.1.9 | 4.1.7 | 2 → 4 | Major API and config changes. |
| `@vitest/coverage-v8` | 2.1.9 | 4.1.7 | 2 → 4 | Tied to vitest major. |
| `@vitest/ui` | 2.1.9 | 4.1.7 | 2 → 4 | Tied to vitest major. |
| `typescript` | 5.9.3 | 6.0.3 | 5 → 6 | Breaking type system changes (era-based emit, new syntax). |
| `@types/node` | 22.19.19 | 25.7.0 | 22 → 25 | Major Node.js types versioning — tied to Node runtime. |

---

## 5. Security: Environment Variables & API Keys

### How Keys Are Handled

| Secret | Location | Exposed to Client? | Risk Level |
|--------|----------|-------------------|------------|
| `VITE_FIREBASE_*` (API key, project ID, etc.) | Build-time `__FIREBASE_CONFIG__` global via Vite `define` | ✅ **Yes** (compiled into JS bundle) | **Low** — Firebase API keys are designed to be public. Security is enforced via Firestore rules and Firebase App Check (not configured). |
| `GEMINI_API_KEY` | Server-only `process.env.GEMINI_API_KEY` in `api/index.ts` | ❌ **Never** — Gemini API called server-side only | **Low** — Properly isolated. |
| `STRIPE_SECRET_KEY` | Server-only `process.env.STRIPE_SECRET_KEY` in `api/index.ts` | ❌ **Never** — Stripe operations server-side only | **Low** — Properly isolated. |
| `STRIPE_WEBHOOK_SECRET` | Server-only for webhook signature verification | ❌ **Never** | **Low** — Properly isolated. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server-only via Admin SDK lazy init | ❌ **Never** — Never imported in client code | **Low** — Properly isolated. |

### Key Findings

1. **Firebase API key is in the client bundle** — This is by design. Firebase Auth and Firestore security come from security rules and App Check, not key secrecy. However, **App Check is not configured**, meaning a determined attacker could call Firebase APIs from outside the app. This is documented in `SECURITY_NOTES.md` but App Check is worth adding.

2. **`GEMINI_API_KEY` is server-only** ✅ — All AI calls go through Express API routes, which read `process.env.GEMINI_API_KEY` server-side. The client never sees this key. This is the correct architecture.

3. **`firebase-applet-config.json` contains client Firebase config** — This is in the repo (not gitignored). It's the same data as `VITE_FIREBASE_*` env vars, so no additional risk, but worth noting it's checked into version control.

4. **No `.env` file is in `.gitignore`** — Confirmed `.env` is in `.gitignore`. `.env.local` is NOT listed in `.gitignore` but also not present. Low risk.

5. **Stripe webhook endpoint uses `express.raw()` for signature verification** ✅ — The raw body is correctly captured before JSON parsing, enabling proper webhook signature verification.

---

## 6. Client/Server Boundary Risks

### What the Client CAN Do (Firebase Client SDK)

- Read/write `users/{uid}/vocabulary/{lemma}` (own vocab)
- Read/write `users/{uid}/imports/{importId}` (own imports)
- Read/write `users/{uid}/settings/main` (own settings)
- Read/write `users/{uid}/reviewLogs/{logId}` (own review logs)
- Read/write `users/{uid}/readingProgress/{textId}` (own progress)
- Read/write `users/{uid}/notes/{noteId}` (own notes)
- Read/write `users/{uid}/notebooks/{notebookId}` (own notebooks)
- Read `texts/{textId}` (public corpus texts)
- Read `syntaxAnnotations/` (public annotations)

### What the Client CANNOT Do

- **Write `currentPlan`** — Server-only via Stripe webhook
- **Write `stripeCustomerId`** — Server-only
- **Write `publicTexts/{id}`** — Server-only (Admin SDK)
- **Admin operations** — Gated by Firebase custom claims verified server-side
- **AI operations** — All go through Express API, not direct Firestore

### Server-Side API Routes (Express)

All AI operations, Stripe operations, admin operations, and moderation endpoints are server-side only. The Express app validates Firebase Auth tokens via `requireAuth`/`optionalAuth` middleware.

### CORS Configuration

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id
```

CORS is wide-open (`*`). Acceptable for Vercel serverless but should be locked down if a dedicated backend domain is introduced.

### Missing Security Headers

The Express app does not set:
- `Content-Security-Policy` — No CSP header
- `X-Content-Type-Options` — No nosniff header
- `X-Frame-Options` — No clickjacking protection
- `Strict-Transport-Security` — No HSTS (handled by Vercel edge)

Vercel may add some of these at the edge, but the Express app itself doesn't set them.

---

## 7. Duplicate/Hanging Dependencies

### Unused Direct Dependencies (can be removed)

| Package | Reason | Savings |
|---------|--------|---------|
| `autoprefixer` | No PostCSS config. Tailwind v4 + `@tailwindcss/vite` handles prefixing natively. | ~10KB |
| `@testing-library/user-event` | Never imported in any test file. Zero references. | ~15KB |
| `@vitest/ui` | Never configured; no `--ui` script exists. | ~2MB (dev only) |

### Potentially Redundant

| Package | Reason |
|---------|--------|
| `@types/express` | Express 5.x ships its own TypeScript declarations. May conflict with built-in types. |

### No Duplicate Packages

The lockfile contains no duplicate package entries at different versions. Tree is clean.

---

## 8. Upgrade Recommendations

### Safe to Upgrade Now (within semver ranges)

All packages that could be safely updated within their `^` ranges have been updated in this session. Nothing remains at "Wanted" version.

Packages updated this session (from `main` baseline):

| Package | Before → After | Reason |
|---------|---------------|--------|
| `@capacitor/*` | 8.3.3 → **8.3.4** | Patch fix, no code change |
| `@google/genai` | 2.0.1 → **2.2.0** | Minor, within 2.x |
| `@tailwindcss/vite` | 4.2.2 → **4.3.0** | Minor, within 4.x |
| `tailwindcss` | 4.2.2 → **4.3.0** | Minor, within 4.x |
| `i18next` | 26.0.10 → **26.1.0** | Minor, within 26.x |
| `tailwind-merge` | 3.5.0 → **3.6.0** | Minor, within 3.x |
| `typescript-eslint` | 8.59.2 → **8.59.3** | Patch |
| `@types/node` | 22.19.17 → **22.19.19** | Patch |
| `typescript` | 5.8.3 → **5.9.3** | Minor, within 5.x |
| `autoprefixer` | 10.4.27 → **10.5.0** | Minor (unused, but harmless) |
| `tsx` | 4.21.0 → **4.21.1** | Patch |
| `vite` | 6.4.1 → **6.4.2** | Patch (also fixes bundled esbuild) |
| `postcss` (transitive) | < 8.5.10 → **8.5.10** | ✅ **Fixes high-severity XSS** |

### Safe Upgrade Order (future PRs)

| Order | PR | Packages | Verification |
|-------|----|----------|-------------|
| 1 | **`chore/update-vitest`** | `vitest` 2.x → 4.x, `@vitest/coverage-v8`, `@vitest/ui` | Run all 185 tests; check coverage script; check test config in vite.config.ts |
| 2 | **`chore/update-firebase`** | `firebase` 11.x → 12.x, `firebase-admin` 13.x (check latest) | Run type-check, build, test Firebase-integrated features |
| 3 | **`chore/update-plugin-react`** | `@vitejs/plugin-react` 4.x → 6.x | Verify React Compiler Babel plugin still works; run build |
| 4 | **`chore/update-motion`** | `motion` 11.x → 12.x | Check animations in Reader (transitions, tooltips) |
| 5 | **`chore/update-lucide`** | `lucide-react` 0.x → 1.x | Audit icon imports for renamed icons |
| 6 | **`chore/update-typescript`** | `typescript` 5.x → 6.x | Check for new strictness issues; run type-check |

**Note:** Each of these should be a separate PR with independent testing. Several can be done in parallel.

---

## 9. Packages That Must NOT Be Introduced

| Package | Why Not |
|---------|---------|
| **Next.js** | Vite SPA is simpler, no SSR needed, avoids framework lock-in. Adding it would require rewriting the entire app. |
| **Prisma** | Firestore is the data layer. Prisma requires a relational database. Adding a second data layer adds complexity with no benefit. |
| **PostgreSQL** | No relational data model. All data is user-owned documents (vocabulary, imports, notes). Firestore's document model fits perfectly. |
| **Turborepo** | Single-package repo. A monorepo tool adds overhead with no gain. |
| **Auth.js (NextAuth)** | Firebase Auth already handles auth + Google provider + custom claims. A second auth library would conflict and require migration. |
| **Redux / Zustand** | React Context + custom hooks handle all state needs. No evidence of prop-drilling or state complexity that warrants a global store. |
| **Algolia / Meilisearch** | Full-text search is currently server-side and works via Firestone queries + client filtering. A dedicated search engine is premature until corpus size exceeds Firestore's capabilities. |

---

## 10. Verification Results

All commands ran on the final state (safe upgrades applied, PostCSS fixed):

```bash
npm run type-check   # → 0 errors
npm run lint         # → 0 errors, 19 pre-existing warnings
npm run build        # → success (5s, 3371 modules)
npm test             # → 22/22 files, 185/185 tests passed
git diff --check     # → no whitespace errors
```

No architecture changes. No new dependencies added. Only `package-lock.json` modified (safe version bumps + transitive fix).

---

## Appendix: Upgrade Detail — Packages Updated This Session

| Package | Before | After | Type | Semver Range |
|---------|--------|-------|------|-------------|
| @capacitor/android | 8.3.3 | 8.3.4 | patch | ^8.3.3 |
| @capacitor/cli | 8.3.3 | 8.3.4 | patch | ^8.3.3 |
| @capacitor/core | 8.3.3 | 8.3.4 | patch | ^8.3.3 |
| @capacitor/ios | 8.3.3 | 8.3.4 | patch | ^8.3.3 |
| @google/genai | 2.0.1 | 2.2.0 | minor | ^2.0.1 |
| @tailwindcss/vite | 4.2.2 | 4.3.0 | minor | ^4.0.0 |
| tailwindcss | 4.2.2 | 4.3.0 | minor | ^4.0.0 |
| i18next | 26.0.10 | 26.1.0 | minor | ^26.0.10 |
| tailwind-merge | 3.5.0 | 3.6.0 | minor | ^3.5.0 |
| typescript-eslint | 8.59.2 | 8.59.3 | patch | ^8.59.2 |
| @types/node | 22.19.17 | 22.19.19 | patch | ^22.10.2 |
| typescript | 5.8.3 | 5.9.3 | minor | ^5.7.2 |
| autoprefixer | 10.4.27 | 10.5.0 | minor | ^10.4.20 |
| tsx | 4.21.0 | 4.21.1 | patch | ^4.19.2 |
| vite | 6.4.1 | 6.4.2 | patch | ^6.2.0 |
| postcss (transitive) | < 8.5.10 | 8.5.10 | patch | transitive |
