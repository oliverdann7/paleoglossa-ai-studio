# Store Submission Handoff

The repo is fully prepared for App Store and Play Store submission. This
document covers the last-mile steps that require credentials, devices, or
external accounts and therefore cannot be committed.

Run `npm run release:check` at any time to audit what's done and what's
pending. Every repo-local item passes once `npm run build` has produced
`dist/`; the external items below need your credentials and are by design
not in the repo.

Firestore composite indexes live in `firestore.indexes.json` and are **not**
deployed by CI. After changing that file run:

```bash
firebase deploy --only firestore:indexes --project paleoglossa-reader
```

(The `tokenAnnotations` index was missing in production and the annotations
endpoint returned 500 until it was added.)

---

## 1. Apple Developer enrollment ($99/yr)

1. Enroll at https://developer.apple.com/programs/enroll.
2. Once approved, go to App Store Connect → My Apps → "+" → New App.
3. Use bundle ID `com.paleoglossa.app` (matches `capacitor.config.ts`
   and `ios/App/App.xcodeproj/project.pbxproj`).
4. Use name **Paleoglossa**, SKU `paleoglossa-ios-v1`.

## 2. Google Play Console enrollment ($25 one-time)

1. Enroll at https://play.google.com/console/signup.
2. Create app — package name `com.paleoglossa.app`.
3. Set up Internal testing track first (faster review cycle).

## 3. Firebase native config files

Both files are gitignored on purpose — they include project-scoped keys.

**iOS (optional):** the iOS target does not link the Firebase iOS SDK —
Firebase runs inside the WebView via the JS SDK and native Google Sign-In
reads `VITE_GOOGLE_IOS_CLIENT_ID` from `.env.native-production`. Xcode Cloud
archives and TestFlight builds validate without the plist. Only add it if a
native Firebase plugin is introduced later:

1. Firebase Console → Project Settings → General → "Add app" → iOS.
2. Bundle ID: `com.paleoglossa.app`.
3. Download `GoogleService-Info.plist`.
4. Drop it at `ios/App/App/GoogleService-Info.plist`.

**Android:**

1. Same console → "Add app" → Android.
2. Package name: `com.paleoglossa.app`.
3. Download `google-services.json`.
4. Drop it at `android/app/google-services.json`.

## 4. Android release keystore

```bash
keytool -genkey -v -keystore paleoglossa-release.keystore \
  -alias paleoglossa -keyalg RSA -keysize 2048 -validity 10000
mv paleoglossa-release.keystore android/
cp android/key.properties.example android/key.properties
# Edit android/key.properties with the password you set above.
```

**Never commit the .keystore file or `key.properties`** — both are
gitignored. Back up the keystore somewhere safe (1Password, encrypted
USB); losing it means you can never push another update to the same
Play Console app.

## 5. Device screenshots

App Store Connect requires screenshots at these sizes:

| Device | Resolution |
|--------|-----------|
| iPhone 6.7" (iPhone 16 Pro Max) | 1290×2796 |
| iPhone 5.5" (iPhone 8 Plus) | 1242×2208 |
| iPad Pro 12.9" (6th gen) | 2048×2732 |

Play Console requires:

| Device | Resolution |
|--------|-----------|
| Phone | min 320 dp wide; 1080×1920 typical |
| 7" tablet | 1200×1920 |
| 10" tablet | 1600×2560 |

Capture via Xcode simulator (`Cmd+S`) or Android Studio AVD
(`Cmd+S` in the emulator). At least 3 screenshots per size are required.

## 6. Public legal URLs

The app already serves these routes (see `src/App.tsx`):

- `/privacy` → [Privacy.tsx](../src/pages/legal/Privacy.tsx)
- `/terms` → [Terms.tsx](../src/pages/legal/Terms.tsx)
- `/support` → [Support.tsx](../src/pages/legal/Support.tsx)
- `/refund` → [Refund.tsx](../src/pages/legal/Refund.tsx)

Once the Vercel deployment is live at `paleoglossa.com`, these become
the URLs you paste into store metadata. They are already referenced in
`store/listings/{ios,android}/en-US/metadata.md`.

---

## Submission workflow

After items 1–6 are complete:

```bash
# 1. Bump version (always increments build number)
npm run mobile:version:patch                  # or :minor, :major, :set X.Y.Z

# 2. Verify everything passes
npm run release:check                         # should show 20/20 pass
npm run type-check && npm run lint && npm test
npm run config:check:native                   # checks env vars

# 3. Build production native bundles
npm run mobile:build:production               # web bundle + cap sync both

# 4a. iOS — open Xcode, Archive, upload via Organizer
npm run ios:open

# 4b. Android — produce signed AAB
npm run android:bundle
# Upload android/app/build/outputs/bundle/release/app-release.aab to Play Console.

# 5. Update store/release-notes/<version>.md with what changed
```

## Reference docs

- [docs/mobile-release.md](mobile-release.md) — full Capacitor build guide
- [docs/mobile-metadata-checklist.md](mobile-metadata-checklist.md) — pre-submit checklist
- [docs/mobile-qa-checklist.md](mobile-qa-checklist.md) — pre-submit QA
- [store/listings/ios/en-US/metadata.md](../store/listings/ios/en-US/metadata.md) — paste-ready iOS copy
- [store/listings/android/en-US/metadata.md](../store/listings/android/en-US/metadata.md) — paste-ready Android copy
