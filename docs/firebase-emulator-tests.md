# Firebase Emulator Tests

This document explains how to run Firestore rules and service persistence tests locally and in CI.

---

## What these tests protect

### Firestore rules tests (`tests/firestore-rules/rules.test.ts`)

These tests run against the live Firestore Security Rules file (`firestore.rules`) using the official Firebase Emulator. They prove:

| Scenario | Verified by |
|----------|-------------|
| Authenticated owner can CRUD their own vocabulary, imports, reading progress, language stats, notes, and notebooks | `owner can…` tests |
| User A cannot read or write user B's private data | `user B cannot…` tests |
| Unauthenticated users cannot read or write any user data | `unauthenticated…` tests |
| Server-controlled subscription fields (`currentPlan`, `subscriptionStatus`, `stripeCustomerId`, etc.) cannot be set by clients | `server-controlled fields` tests |
| `publicTexts` documents are readable only when `visibility == "public"` | `publicTexts` tests |
| `publicTexts` cannot be written by any client (Admin SDK only) | `publicTexts` write tests |
| `reviewLogs` are append-only: clients cannot update or delete them | `append-only` tests |

### Service persistence tests (`src/lib/services/__tests__/servicePersistence.test.ts`)

Unit tests with mocked Firestore. They verify:

| Scenario | Verified by |
|----------|-------------|
| When `userId === null` (demo/guest mode), services write to `localStorage` and never call Firestore | `demo/guest mode` section |
| `VocabularyService.setWordState` enqueues a write to `users/{uid}/vocabulary/{termId}` with correct payload | `authenticated mode` section |
| `StatsService.setTextProgress` writes to `users/{uid}/readingProgress/{textId}` | `authenticated mode` section |
| `ImportService.saveImport` writes to `users/{uid}/imports/{importId}` | `authenticated mode` section |

---

## Running locally

### Prerequisites

- **Node.js 22+** (already required by this project)
- **Java 11+** — required by the Firebase Emulator (check: `java -version`)
- **Firebase CLI** — install globally: `npm install -g firebase-tools`

### 1. Service persistence tests (no emulator needed)

These run in the standard Vitest suite with mocked Firestore:

```bash
npm run test:persistence
# or, included in the full suite:
npm test
```

### 2. Firestore rules tests (emulator required)

The `test:firestore-rules` script starts the Firestore emulator automatically via `firebase emulators:exec`, runs the tests, then shuts down the emulator:

```bash
npm run test:firestore-rules
```

The emulator downloads on first run (~100 MB). Subsequent runs use the cached binary.

If you want to inspect the emulator UI while tests run, start it manually instead:

```bash
# Terminal 1: start emulator with UI
firebase emulators:start --project paleoglossa-test --only firestore

# Terminal 2: run rules tests (pointing at already-running emulator)
vitest run --config tests/firestore-rules/vitest.config.ts
```

### 3. Full test suite

```bash
npm test                    # unit/component tests (no emulator)
npm run test:persistence    # service persistence tests (no emulator)
npm run test:firestore-rules # rules tests (starts emulator automatically)
```

---

## Emulator configuration

The emulator is configured in `firebase.json`:

```json
{
  "emulators": {
    "firestore": {
      "port": 8080
    }
  }
}
```

The rules test file connects to `localhost:8080` and uses project ID `paleoglossa-test` (a fake project, never touches production).

---

## CI

Two jobs are defined in `.github/workflows/firestore-rules.yml`:

| Job | Trigger |
|-----|---------|
| `rules-tests` | PRs and pushes to main that touch `firestore.rules`, `firebase.json`, or `tests/firestore-rules/**` |
| `persistence-tests` | PRs and pushes to main that touch `src/lib/services/**` |

The `rules-tests` job installs `firebase-tools` via npm and Java via `actions/setup-java`, then runs `npm run test:firestore-rules`.

The existing `ci.yml` job (`npm test`) continues to run the unit/component suite without the emulator.

---

## Adding new rules tests

1. Open `tests/firestore-rules/rules.test.ts`.
2. Add a new `describe` block for the collection.
3. Use `seedDoc(path, data)` to pre-populate documents without going through rules (for read/update/delete tests).
4. Use `assertSucceeds(...)` and `assertFails(...)` from `@firebase/rules-unit-testing`.

Example:

```typescript
describe('users/{userId}/tutorSessions/{sessionId}', () => {
  it('owner can create a tutor session', async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb(), 'users/alice/tutorSessions/session1'), {
        startedAt: new Date().toISOString(),
      })
    );
  });
});
```

## Adding new service persistence tests

Service persistence tests live in `src/lib/services/__tests__/servicePersistence.test.ts` and use the existing Vitest setup (no emulator). Add new `describe` blocks following the existing pattern.

---

## Known limitations

- **`sendBeacon` / synchronous flush**: The browser `beforeunload` handler calls `flushPendingWrites()`, but browsers throttle or block synchronous network operations during unload. The Firestore SDK's `persistentLocalCache` (IndexedDB) mitigates this — writes already submitted to the SDK survive tab closure.
- **Rules test coverage**: `syntaxAnnotations` (public read, admin write) and `settings/**` subcollections are not yet covered. Add tests when those features are fully implemented.
