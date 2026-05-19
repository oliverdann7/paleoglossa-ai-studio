# Firebase Diagnostic Page

The Firebase Debug page helps diagnose why user data may not be saving. It runs
safe read-only or self-cleaning tests on both the client SDK and the server
Admin SDK without exposing secrets.

## Access

1. Sign in with an admin account.
2. Navigate to `/admin` (Admin Dashboard).
3. Click the **Firebase Debug** button in the top-right header.
4. Or navigate directly to `/admin/firebase-debug`.

## What the page shows

### Environment
- `window.location.origin` — current host
- `VITE_API_BASE_URL` — API endpoint for native builds
- `import.meta.env.MODE` — `development` / `production`
- Platform detection — `Capacitor` vs `Web / PWA`

### Firebase Client Config (from `__FIREBASE_CONFIG__`)
- `projectId` — which Firebase project the client SDK targets
- `authDomain`, `storageBucket`, `appId` — partially shown
- `firestoreDatabaseId` — named database or `(default)`
- Any empty fields are highlighted in amber with a warning icon

### Current User
- `uid`, `email`, `emailVerified`, `isAnonymous`
- Provider IDs (e.g. `google.com`, `password`, `apple.com`)

### Client Firestore Test (manual button)
Writes to `users/{uid}/settings/__debug__`, reads it back, then deletes it.
This path is owner-only per Firestore rules, so it validates that:

- Firebase client SDK is fully initialized
- Auth token is valid and current
- Firestore rules allow the operation
- The Firestore database is reachable

### Server Admin SDK Test (manual button)
Calls `GET /api/admin/firebase-debug` which checks:

- Admin SDK initialization (`FIREBASE_SERVICE_ACCOUNT_JSON`)
- Admin Firestore write/read/delete on a safe `adminDebug/` collection
- Admin Auth can look up the requesting user's Auth record
- Server-side project ID detection

## How to use this page to diagnose common problems

### Wrong Firebase project
1. Check the **Project ID** in the "Firebase Client Config" section.
2. Compare it to the expected project for the current environment
   (development vs. production).
3. Run the **client Firestore test** — if it writes to a project you don't
   expect, the `VITE_FIREBASE_*` env vars or `firebase-applet-config.json`
   are pointing at the wrong project.
4. Run the **server Admin SDK test** and compare the server's `projectId`
   with the client's — a mismatch means the client and server talk to
   different Firebase projects.

### Missing Vercel / production environment variables
1. Check that the "Firebase Client Config" section shows non-empty values.
   Empty projectId, apiKey, or authDomain means the `__FIREBASE_CONFIG__`
   was not injected (missing `VITE_FIREBASE_*` env vars in Vercel).
2. Run the **server test** — if it returns `adminSdkAvailable: false`,
   the `FIREBASE_SERVICE_ACCOUNT_JSON` env var is not set or invalid.

### Firestore rules not deployed
1. Run the **client Firestore test**.
2. If the test writes but the error says `permission-denied`, the rules may
   not allow the `settings/__debug__` subcollection.
3. Run `firebase deploy --only firestore:rules` to deploy the latest rules.

### Admin SDK unavailable / misconfigured
1. Run the **server Admin SDK test**.
2. If `adminSdkAvailable` is `false`, the server cannot initialize the
   Firebase Admin SDK. Set `FIREBASE_SERVICE_ACCOUNT_JSON` in the server
   environment.
3. If `serverTests.adminDb` fails with `permission-denied`, the service
   account does not have Firestore write access.
4. If `serverTests.adminAuth` fails with `auth/user-not-found`, the
   requesting user's UID does not exist in Firebase Authentication.

### Native builds missing VITE_API_BASE_URL
1. Check the **API Base URL** under "Environment". If it is empty and the
   platform is "Capacitor (native)", API calls will fail because the native
   WebView cannot reach relative `/api/...` endpoints.
2. Set `VITE_API_BASE_URL` in the native build environment to the production
   API origin (e.g. `https://paleoglossa.com`).

## Security

- No secrets are exposed. API keys are truncated to 8 characters, app IDs
  to 24 characters.
- The server diagnostic endpoint is protected by the same `requireAdmin`
  middleware as all other admin routes.
- Client Firestore writes go to the user's own subcollection and clean up
  after themselves.
- Server Firestore writes go to an `adminDebug/` collection and also clean
  up.
- The diagnostic page is only accessible to admin users (`RequireAdmin`).

## Troubleshooting checklist

| Symptom | Check this section |
|---------|-------------------|
| Data not saving in any browser | Client Firestore test |
| Data not saving in native app only | Environment → VITE_API_BASE_URL |
| 403 errors from API | Server test → Admin Auth |
| 503 errors from API | Server test → Admin SDK available |
| "Wrong project" suspicion | Both config sections → compare projectId |
| User appears but writes fail | Current User → emailVerified, provider IDs |
| Fresh deploy not working | Firebase Client Config → all fields populated |
