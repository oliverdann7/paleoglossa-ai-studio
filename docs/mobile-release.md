# Mobile Release Guide

This document covers building and releasing Paleoglossa as a native
iOS/Android app via Capacitor.

## Prerequisites

- Xcode 16+ (iOS)
- Android Studio (Android)
- Node 20+
- Java 17+ (Android)

## Environment

Copy `.env.example` to `.env` and fill in the required values.

**Critical for native builds** — set the API base URL so the app can reach
the backend from the native WebView:

```bash
VITE_API_BASE_URL=https://paleoglossa.com
```

Without this, all `/api/…` requests will resolve against the local file
protocol or `capacitor://localhost`, which will fail.

## Build the Web bundle

```bash
npm run build
```

Output goes to `dist/` (as configured in `capacitor.config.ts#webDir`).

## Sync Capacitor

```bash
npx cap sync
```

This copies `dist/` into the native project folders and updates plugin
native code.

## Run on device / simulator

```bash
npx cap run ios
npx cap run android
```

## Open native IDE

```bash
npx cap open ios
npx cap open android
```

Then build and run from Xcode / Android Studio as usual.

## API base URL architecture

- `src/lib/services/apiBaseUrl.ts` exports `getApiUrl(path)`.
- The function reads `import.meta.env.VITE_API_BASE_URL` and prepends it
  to every API path.
- Web deployments leave the variable empty so relative `/api/…` routes work
  as before.
- Native builds set `VITE_API_BASE_URL` to the production origin.
- All raw `fetch('/api/…')` calls and the `apiFetch` wrapper use this
  helper, so a single env var controls the base for the whole app.
