# Production Configuration Audit

Run `npm run config:check` before any production deployment to verify the environment is correctly configured. The script exits with code 1 if any critical variable is missing.

```bash
npm run config:check          # all targets
npm run config:check:web      # web/Vercel only
npm run config:check:native   # Capacitor/mobile only
npm run config:check:server   # server/Admin SDK only
```

---

## Variables Reference

### Web / Vercel

| Variable | Required for | Where to set | Symptom if missing |
|----------|-------------|--------------|-------------------|
| `VITE_FIREBASE_PROJECT_ID` | Firebase SDK init | Vercel → Environment Variables | Wrong Firebase project: user data may appear missing |
| `VITE_FIREBASE_APP_ID` | Firebase SDK init | Vercel → Environment Variables | App will not load at all |
| `VITE_FIREBASE_API_KEY` | Firebase Auth | Vercel → Environment Variables | Users cannot sign in |
| `VITE_FIREBASE_AUTH_DOMAIN` | Google sign-in redirect | Vercel → Environment Variables | Google OAuth will fail |
| `VITE_FIREBASE_STORAGE_BUCKET` | Avatar upload, file storage | Vercel → Environment Variables | Profile pictures and file uploads fail |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Non-default Firestore database | Vercel → Environment Variables | Will silently use `(default)` — check this is correct |
| `GEMINI_API_KEY` | AI features (analyze, tutor, OCR) | Vercel → Environment Variables | All AI features return errors |
| `STRIPE_SECRET_KEY` | Payments / subscriptions | Vercel → Environment Variables | Users cannot upgrade plans |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | Vercel → Environment Variables | Subscription status never updates after payment |
| `VITE_SENTRY_DSN` | Error monitoring | Vercel → Environment Variables | Production errors are silent |
| `VITE_POSTHOG_API_KEY` | Product analytics | Vercel → Environment Variables | No usage analytics |

### Native / Capacitor

| Variable | Required for | Where to set | Symptom if missing |
|----------|-------------|--------------|-------------------|
| `VITE_FIREBASE_PROJECT_ID` | Firebase in native build | `.env.native-production` | Wrong database in mobile app |
| `VITE_FIREBASE_APP_ID` | Firebase in native build | `.env.native-production` | SDK init fails; app crashes |
| `VITE_FIREBASE_API_KEY` | Auth in native build | `.env.native-production` | Sign-in fails in mobile |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth redirects | `.env.native-production` | Google OAuth broken on mobile |
| `VITE_API_BASE_URL` | All API calls from native | `.env.native-production` | All API calls fail (WebView origin ≠ backend) |
| `VITE_ENABLE_MOBILE_PURCHASES` | In-app purchase routing | `.env.native-production` | Stripe shown on iOS/Android (App Store violation) |
| `VITE_ENABLE_COMMUNITY` | Community/social features | `.env.native-production` | Unmoderated community shown in mobile release |

### Server / Admin SDK

| Variable | Required for | Where to set | Symptom if missing |
|----------|-------------|--------------|-------------------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | All authenticated API routes | Vercel → Environment Variables (server) | Missing Admin SDK config: authenticated API routes may fail |
| `FIREBASE_PROJECT_ID` | Admin SDK (alternative to JSON) | Vercel → Environment Variables (server) | Same as above |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK (alternative to JSON) | Vercel → Environment Variables (server) | Same as above |
| `FIREBASE_PRIVATE_KEY` | Admin SDK (alternative to JSON) | Vercel → Environment Variables (server) | Same as above |
| `GEMINI_API_KEY` | AI routes (`/api/ai/*`) | Vercel → Environment Variables (server) | AI routes return 503 |
| `STRIPE_SECRET_KEY` | Billing routes | Vercel → Environment Variables (server) | Payment routes fail |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook handler | Vercel → Environment Variables (server) | Webhooks rejected — subscription status never updates |
| `GOOGLE_TTS_API_KEY` | AudioLab TTS | Vercel → Environment Variables (server) | Pronunciation playback fails |

---

## Why Data May Not Appear in Firebase

This section documents common causes of the symptom "I signed in but my vocabulary / texts / progress is gone."

### 1. Demo mode / localStorage

The app has a guest (demo) mode where data is stored in `localStorage` only — it is never sent to Firestore. If a user signed in from a guest session, their data may still be in `localStorage` on their browser and needs to be migrated via the migration prompt.

**Check:** Open DevTools → Application → Local Storage. Look for keys starting with `paleoglossa_`.

### 2. Wrong Firebase project ID

If `VITE_FIREBASE_PROJECT_ID` points to a different Firebase project (e.g., a dev project instead of production), the app connects to a different Firestore database. User data is not visible because it was written to the correct project but the app is reading from the wrong one.

**Check:** Compare `VITE_FIREBASE_PROJECT_ID` in your deployment with the project ID in the Firebase Console URL (`https://console.firebase.google.com/project/<project-id>`).

### 3. Wrong database ID

`VITE_FIREBASE_FIRESTORE_DATABASE_ID` defaults to `(default)` if unset. If your Firestore database is named something other than `(default)`, data will not be found.

**Check:** Firebase Console → Firestore → top of the panel shows the database name.

### 4. Firestore rules not deployed

If security rules are too restrictive (or the wrong version was deployed), reads and writes fail silently on the client. The app may show empty state instead of an error.

**Check:** Run `firebase deploy --only firestore:rules`. Confirm the rules version in Firebase Console → Firestore → Rules.

### 5. Admin SDK missing

If `FIREBASE_SERVICE_ACCOUNT_JSON` (or the three individual `FIREBASE_*` vars) is not set, the server-side API routes fail to authenticate with Firestore. This affects any feature that uses `/api/*` routes to write data.

**Check:** Run `npm run config:check:server`. Look for the Admin SDK line.

### 6. Native app missing API base URL

Capacitor apps run in a WebView with a different origin (`capacitor://localhost` or `ionic://localhost`). Without `VITE_API_BASE_URL`, all API calls resolve to `capacitor://localhost/api/...` instead of the production backend.

**Check:** In a native build, open Xcode/Android Studio → Logcat/Console. Look for `CORS` or `network` errors.
