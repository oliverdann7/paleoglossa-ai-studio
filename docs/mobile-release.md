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

## Firebase Authentication in native builds

### Web vs native flow

The auth logic lives in `src/lib/services/authService.ts`.

- **Web browser:** `signInWithPopup` is used for Google and Apple OAuth
  (unchanged from the original behaviour).
- **Capacitor native (iOS/Android):** `signInWithRedirect` is used instead.
  The WebView navigates to the OAuth provider, and the result is recovered
  by `getRedirectResult` via `handleRedirectResult()` in the AuthContext
  on the next page load.

Email/password sign-in works identically in every environment.

### Firebase Console — Authorized domains

Add these domains so the redirect flow is allowed:

1. Go to **Firebase Console > Authentication > Settings > Authorized domains**.
2. Ensure these are present (add any missing ones):
   - `localhost` — required for Android native (serves from `https://localhost`)
   - `paleoglossa.com`
   - `paleoglossa-reader.firebaseapp.com`
   - `paleoglossa-reader.web.app`

### iOS — URL scheme / deep-link setup

Because the Capacitor WebView navigates away from the app during OAuth
redirect, the app must be able to receive the redirect back.  Configure
the iOS project:

1. Open `ios/App/App/Info.plist` in Xcode.
2. Add a **URL Types** entry with the identifier
   `com.paleoglossa.app` and the URL scheme `paleoglossa`.
3. In **Signing & Capabilities**, add the **Associated Domains** capability
   and add a domain entry for Universal Links if needed.

If the redirect-back fails on iOS, Google / Apple OAuth will time out.
Users can still sign in with email/password as a fallback.

### Android — intent / deep-link setup

The Capacitor Android WebView runs on `https://localhost`, which the OAuth
redirect chain can navigate back to.  No additional intent filter is
required for the basic OAuth redirect.

For custom deep-link flows (e.g. handling password-reset links):

1. Open `android/app/src/main/AndroidManifest.xml`.
2. Inside the `<activity>` tag, add an intent filter for the custom scheme:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="paleoglossa" />
</intent-filter>
```

### Google OAuth client ID for native

Firebase Auth uses the **Web** OAuth client ID by default, which works with
both `signInWithPopup` and `signInWithRedirect`.  If you add native
Google Sign-In via a Capacitor plugin later, an **iOS** / **Android**
OAuth client ID is required from the Google Cloud Console.

### Apple Sign-In

- **Web:** `signInWithPopup` with `OAuthProvider('apple.com')` works as
  before.
- **iOS native:** For a production iOS build, configure **Sign In with
  Apple** capability in Xcode (requires an Apple Developer account with
  the capability enabled).  Follow the
  [Firebase docs](https://firebase.google.com/docs/auth/ios/apple)
  to set up the service ID and redirect URI.
- **Android:** Apple Sign-In is not available on Android.  Users who
  registered with Apple on another platform should use email/password
  or link a Google account.

### Testing the native auth flow

1. Start the app on an iOS simulator / Android emulator via
   `npx cap run ios` or `npx cap run android`.
2. Tap **Continue with Google** or **Continue with Apple**.
3. On a **simulator**, the WebView navigates to the OAuth consent screen
   (you may need to sign in to a Google/Apple account in the simulator's
   Safari).
4. On a **real device**, the OAuth page opens in the system browser.
   After authenticating, the app should re-activate and complete the
   sign-in.
5. If the redirect-back fails, try email/password sign-in, which works
   without any redirect.

### Known limitations

- `signInWithRedirect` on iOS may not redirect back to the app
  automatically on all devices.  If the auth flow hangs, close and
  reopen the app — the pending result will be picked up by
  `getRedirectResult`.
- Apple Sign-In via OAuth redirect (as opposed to native Apple Sign-In)
  is not available on Android without a third-party plugin.
