# Mobile Release Guide

Capacitor-based native iOS/Android build and release guide for
Paleoglossa.

## iOS Release Readiness Improvements

- Updated `UIRequiredDeviceCapabilities` to `arm64` (dropping `armv7` as it is deprecated).
- Restricted iPhone orientation to `Portrait` for a more consistent UX, while maintaining broader support for iPad.
- Implemented `safe-area` CSS adjustments (see below).

## Safe-Area Handling

To properly handle the top notch and bottom home indicator on modern iOS devices, we leverage CSS environment variables.

Ensure the following CSS is applied globally (or at least to the container of your main layout):

```css
/* Avoid content overlap with the notch and home indicator */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* For elements pinned to the bottom (e.g., navigation bars) */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

This ensures that the main content does not get hidden behind the notch or cut off by the home indicator on iPhone X and newer.

---

| Property | Value |
|----------|-------|
| appId | `com.paleoglossa.app` |
| appName | `Paleoglossa` |
| Capacitor | 8.x |
| iOS target | 16+ (inferred from Capacitor 8 defaults) |
| Android minSdk | 24 (Android 7.0) |
| Android targetSdk | 36 (Android 16) |

---

## Prerequisites

- Xcode 16+ (iOS)
- Android Studio (Android)
- Node 22+
- Java 17+ (Android)
- An Apple Developer account ($99/yr) for iOS distribution
- A Google Play Developer account ($25 one-time) for Android distribution

---

## Environment variables

Copy `.env.example` to `.env` and fill in the required values.  Critical
for native builds:

```bash
VITE_API_BASE_URL=https://paleoglossa.com
VITE_FIREBASE_PROJECT_ID=paleoglossa-reader
VITE_FIREBASE_APP_ID=REDACTED_FIREBASE_APP_ID
VITE_FIREBASE_API_KEY=REDACTED_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=paleoglossa-reader.firebaseapp.com
```

Without `VITE_API_BASE_URL`, all `/api/…` requests resolve against the
local file protocol or `capacitor://localhost`, which will fail in native
WebViews.

All env vars are listed in `.env.example`.  Firebase client values are
already baked into `firebase-applet-config.json` for local dev.

---

## Available scripts

```bash
# Build web bundle + sync all platforms
npm run mobile:build

# Sync only (copy web bundle changes)
npm run mobile:sync

# iOS
npm run ios:sync          # build + sync iOS only
npm run ios:open          # open Xcode project

# Android
npm run android:sync      # build + sync Android only
npm run android:open      # open Android Studio project
npm run android:assemble  # build debug APK
npm run android:bundle    # build release AAB (requires signing config)
```

---

## iOS build steps

### 1. Development (simulator)

```bash
npm run ios:sync
npx cap run ios
```

### 2. Release (device / TestFlight)

```bash
# Build the web bundle and sync
npm run ios:sync

# Open Xcode
npx cap open ios
```

In Xcode:

1. Select **Paleoglossa** target.
2. Go to **Signing & Capabilities** and select your Apple Developer team.
3. Change the Bundle Identifier if needed (default: `com.paleoglossa.app`).
4. Choose **Any iOS Device** as the build target.
5. Product → Archive.
6. Once archived, distribute via **TestFlight** or **App Store Connect**.

### Code signing

- Requires an Apple Developer account and a Distribution Certificate.
- Development signing uses your personal team; release signing uses your
  Distribution certificate and App Store Provisioning Profile.
- Do **not** commit signing secrets or provisioning profiles to the repo.

### TestFlight checklist

Before uploading:

- [ ] App icon is set in `ios/App/App/Assets.xcassets/AppIcon.appiconset`.
- [ ] Version and build numbers are set in Xcode target settings.
- [ ] `ITSAppUsesNonExemptEncryption` is `NO` in `Info.plist` (unless the
      app uses custom encryption — it does not).
- [ ] Privacy policy URL is set in App Store Connect.
- [ ] Terms of service URL is set (if applicable).
- [ ] Test user accounts are available for the reviewer.
- [ ] Run through the [QA checklist](mobile-qa-checklist.md).

### TestFlight upload steps

Requires: **Apple Developer account** ($99/yr), an **App Store Connect** record, and
**Xcode 16+**.

1. Build the native production bundle:
   ```bash
   npm run ios:sync:production
   ```
2. Open Xcode:
   ```bash
   npx cap open ios
   ```
3. In Xcode:
   - Select **Paleoglossa** target.
   - Go to **Signing & Capabilities** and select your Apple Developer team.
   - Change the Bundle Identifier if needed (default: `com.paleoglossa.app`).
   - Choose **Any iOS Device** as the build target.
   - **Product → Archive**.
4. After archiving, the Organizer window opens.
5. Click **Distribute App → App Store Connect → Upload**.
6. Select your development team and follow the prompts.
7. Once uploaded, go to [App Store Connect](https://appstoreconnect.apple.com)
   and manage the build under **TestFlight**.

### Google Play Internal Testing upload steps

Requires: **Google Play Developer account** ($25), a **Google Play Console** app record,
a **keystore**, and **Android SDK / Studio**.

1. Configure code signing:
   - Generate a keystore if you don't have one (see [Code signing](#code-signing) below).
   - Create `android/key.properties` with your keystore details.
   - The keystore and `key.properties` must **never** be committed.
2. Build the release AAB:
   ```bash
   npm run android:sync:production
   npm run android:bundle
   # AAB at android/app/build/outputs/bundle/release/app-release.aab
   ```
3. Go to [Google Play Console](https://play.google.com/console).
4. Select your app → **Testing → Internal testing**.
5. Click **Create new release**.
6. Upload the `app-release.aab` file.
7. Fill in the release name and release notes.
8. Click **Save** and then **Review release**.
9. After review, click **Start rollout to Internal testing**.
10. Add tester email addresses under **Testers**.
11. Testers install via the opt-in link.

### What requires Apple / Google / Firebase / secret access

| Step | Requires | Notes |
|------|----------|-------|
| TestFlight upload | Apple Developer account, App Store Connect app record | $99/yr |
| Google Play Internal Testing | Google Play Developer account, app record | $25 one-time |
| Firebase Auth / native config | Firebase Console project, `google-services.json`, `GoogleService-Info.plist` | Download from Firebase Console |
| Android code signing | Keystore file + `android/key.properties` | Never commit |
| iOS code signing | Apple Distribution Certificate + Provisioning Profile | Managed via Xcode |

### Subscription QA (Web-Managed Subscriptions)

Subscriptions in the native app are **web-managed only**:

- Paid plan buttons are disabled on native iOS/Android builds by default.
- The Stripe Billing Portal button is hidden.
- A neutral notice reads: "Subscription management is currently available on the web."
- Existing paid users retain full entitlement access after logging in.
- To enable in-app purchases (future), set `VITE_ENABLE_MOBILE_PURCHASES=true`
  and integrate StoreKit / Google Play Billing.

### Internal testing checklist

Pre-submit checks before uploading to TestFlight or Google Play Internal Testing:

- [ ] Build a debug APK / local iOS build and run through the
      [QA checklist](mobile-qa-checklist.md).
- [ ] Verify subscription notice appears on the pricing page in native builds.
- [ ] Verify existing paid users can access their languages and features.
- [ ] Confirm no external purchase links are shown to native users.

---

## Android Release Readiness Improvements

- **Minification (R8/Proguard)**: Currently `minifyEnabled` is `false` in `android/app/build.gradle`. Enabling it requires thorough testing of native plugins and web-bundle interaction. It is safer to remain disabled for the initial release unless issues arise.
- **Versioning**: Update `versionCode` and `versionName` in `android/app/build.gradle` before every Play Store release.
- **Signing**: Ensure `android/key.properties` exists but is NEVER committed to the repository.

---

### 1. Development (debug APK)

```bash
npm run android:sync
npm run android:assemble
# APK at android/app/build/outputs/apk/debug/app-debug.apk
```

Or run directly on a device/emulator:

```bash
npx cap run android
```

### 2. Release (AAB for Google Play)

1. Create or locate your keystore file (keystore is **not** committed).
2. Set up signing in `android/app/build.gradle` (see signing notes below).
3. Build the release bundle:

```bash
npm run android:sync
npm run android:bundle
# AAB at android/app/build/outputs/bundle/release/app-release.aab
```

### Code signing

1. Generate a keystore (keep it safe, never commit):

```bash
keytool -genkey -v -keystore paleoglossa-release.keystore \
  -alias paleoglossa -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/key.properties` (this file is **not** committed):

```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=paleoglossa
storeFile=../paleoglossa-release.keystore
```

3. Add the signing config to `android/app/build.gradle`:

```groovy
// Inside android { ... }
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        // ...
    }
}
```

4. Build the release bundle: `npm run android:bundle`.

### Google Play internal / closed testing

1. Go to [Google Play Console](https://play.google.com/console).
2. Create a new app or select Paleoglossa.
3. Set up **Internal testing** track.
4. Upload the `app-release.aab`.
5. Add tester email addresses (Google accounts).
6. Publish the internal test.
7. Testers install via the opt-in link.

---

## Firebase setup

### Console

| Setting | Value |
|---------|-------|
| Project ID | `paleoglossa-reader` |
| API Key | Set in `VITE_FIREBASE_API_KEY` or `firebase-applet-config.json` |
| Auth Domains | `paleoglossa-reader.firebaseapp.com`, `paleoglossa-reader.web.app` |
| Authorized domains (Auth settings) | `localhost`, `paleoglossa.com`, `paleoglossa-reader.firebaseapp.com`, `paleoglossa-reader.web.app` |

### google-services.json (Firebase + Android)

> **Required for Android native builds** — Firebase services on Android
> use the native `google-services.json` file, not just the web SDK config.

1. In **Firebase Console > Project Settings > General > Your apps**,
   click **Add app > Android**.
2. Android package name: `com.paleoglossa.app`
3. Download `google-services.json` and place it at
   `android/app/google-services.json`.
4. The `google-services` plugin (`com.google.gms:google-services:4.4.4`)
   is already configured in `android/build.gradle` and `android/app/build.gradle`.
5. The file is **not** committed (it is in `.gitignore`).

### GoogleService-Info.plist (Firebase + iOS)

> **Required for iOS native builds**, even when using the web SDK for auth.

1. In Firebase Console, click **Add app > iOS**.
2. iOS bundle ID: `com.paleoglossa.app`
3. Download `GoogleService-Info.plist` and place it at
   `ios/App/App/GoogleService-Info.plist`.
4. Open `ios/App/App/AppDelegate.swift` and verify the Firebase
   initialization reads the plist (Capacitor template handles this).
5. The file is **not** committed (it is in `.gitignore`).

### Authentication

Detailed auth setup is covered above in the [Firebase Authentication](#firebase-authentication-in-native-builds) section.

---

## Build outputs

| Artifact | Path | Command |
|----------|------|---------|
| Web bundle | `dist/` | `npm run build` |
| iOS app (debug) | `ios/App/build/` | `npx cap run ios` |
| iOS archive (release) | Xcode Organizer | Product → Archive |
| Android debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | `npm run android:assemble` |
| Android release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | `npm run android:bundle` |

---

## Store listings (in-repo source of truth)

Paste-ready store copy lives at:

- iOS — [`store/listings/ios/en-US/metadata.md`](../store/listings/ios/en-US/metadata.md)
- Android — [`store/listings/android/en-US/metadata.md`](../store/listings/android/en-US/metadata.md)
- Release notes — [`store/release-notes/`](../store/release-notes/) (one file per version)

Update these alongside any feature change that materially affects what the
app does or claims to do.

## Version bumps

Use the bump script so iOS `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`
and Android `versionName` / `versionCode` stay in lockstep with
`package.json`:

```bash
npm run mobile:version:patch    # 1.0.0 → 1.0.1, build +1
npm run mobile:version:minor    # 1.0.0 → 1.1.0, build +1
npm run mobile:version:major    # 1.0.0 → 2.0.0, build +1
npm run mobile:version:set 1.2.3
```

Stores require a unique build number per upload, so the script always
increments `CURRENT_PROJECT_VERSION` and `versionCode` even on a `set`
that doesn't change the marketing version.

## Store metadata checklist

- [ ] App name: **Paleoglossa**
- [ ] Subtitle: Learn Ancient Languages
- [ ] Category: Education
- [ ] Privacy policy URL — hosted and accessible
- [ ] Terms of service URL — hosted and accessible
- [ ] Support URL / email
- [ ] Account deletion policy / instructions
- [ ] Screenshots: iPhone 6.7" + iPhone 5.5" + iPad + Android phone + Android tablet
- [ ] App icon: 1024×1024
- [ ] Description text (English + other supported languages)
- [ ] Content rating questionnaire completed

### Privacy policy / terms / support / account deletion

- **Privacy policy**: The app collects only Firebase Auth account data and
  usage analytics via PostHog (opt-out available in Settings).  Host the
  policy at a public URL and link it in App Store Connect / Google Play.
- **Account deletion**: Users can request deletion via the app's Settings
  page or by emailing support.
- **Support**: Provide a support email address in the store listing.
- **Terms of Service**: Link to ToS URL if applicable.

---

## Known not-ready areas

These features are either stubs or not functional in the current build:

- **Syntax trees** (`src/pages/Syntax.tsx`) — UI is present but the API
  endpoint is a stub returning placeholder data.
- **Manuscripts** (`src/components/reader/Manuscripts.tsx`) — UI shell
  only, no real manuscript data.
- **AI pronunciation** — May not work on all devices depending on the
  TTS provider.
- **Push notifications** — Not yet implemented.
- **Offline mode** — Service worker is registered but offline sync is
  limited; the app requires network for most features.
- **Apple Sign-In on iOS** — Requires Apple Developer membership and
  native Sign In with Apple capability in Xcode.
- **In-app purchases** — Disabled by default for native builds to ensure App Store compliance. See [Mobile Subscription Compliance](#mobile-subscription-compliance).

---

## Firebase authentication in native builds

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

---

## API base URL architecture

- `src/lib/services/apiBaseUrl.ts` exports `getApiUrl(path)`.
- The function reads `import.meta.env.VITE_API_BASE_URL` and prepends it
  to every API path.
- Web deployments leave the variable empty so relative `/api/…` routes work
  as before.
- Native builds set `VITE_API_BASE_URL` to the production origin.
- All raw `fetch('/api/…')` calls and the `apiFetch` wrapper use this
  helper, so a single env var controls the base for the whole app.

## Mobile Subscription Compliance

To comply with App Store and Play Store guidelines regarding in-app purchases:

- By default, Stripe checkout is disabled for native iOS/Android builds.
- To enable it, set `VITE_ENABLE_MOBILE_PURCHASES=true` in your production environment variables.
- When disabled (default):
  - Paid plan buttons are disabled.
  - The Stripe Billing Portal button is hidden.
  - A neutral message is shown, directing users to the web for subscription management.
  - Existing paid users retain their entitlement access after logging in.

### Configuration

```bash
VITE_ENABLE_MOBILE_PURCHASES=false
```
