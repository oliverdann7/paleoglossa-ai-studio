# In-app purchase (App Store + Google Play, via RevenueCat)

The iOS and Android apps sell the three paid plans as auto-renewable
subscriptions through their own store. The web keeps using Stripe.

In-app purchase is **off** on each platform until the setup below is done,
`VITE_ENABLE_MOBILE_PURCHASES=true`, and that platform's RevenueCat key is
set. While off, the app shows plans as a feature comparison with no prices.
The two platforms turn on independently.

## How it works

1. `src/pages/Subscription.tsx` loads the offering through
   `src/lib/services/iapService.ts` and shows the **store's own localized
   price** on each plan.
2. On purchase (or Restore Purchases) the app calls `POST /api/iap/sync`.
3. The API (`api/_lib/revenueCat.ts`) reads the subscriber from RevenueCat's
   REST API and writes `currentPlan`, `subscriptionStatus` and
   `subscriptionSource` (`app_store` or `play_store`) to `users/{uid}`. The
   client never states what it bought.
4. Renewals, expirations, refunds and billing problems arrive on
   `POST /api/revenuecat/webhook`, which runs the same sync.

The RevenueCat app user id is the Firebase uid.

Rules enforced in `buildIapUserUpdate` and the plans page:

- A plan bought on the web, or in the other store, is shown as "already
  active" and never sold a second time.
- An expired in-app subscription never downgrades a Stripe subscriber.

## Product IDs

The same six IDs are used in both stores and must match
`src/lib/constants/iapProducts.ts` exactly:

| Plan | Monthly | Yearly |
|------|---------|--------|
| Basic | `com.paleoglossa.app.basic.monthly` | `com.paleoglossa.app.basic.yearly` |
| Duo | `com.paleoglossa.app.duo.monthly` | `com.paleoglossa.app.duo.yearly` |
| Full Pack | `com.paleoglossa.app.full.monthly` | `com.paleoglossa.app.full.yearly` |

## One-time setup

### 1. App Store Connect (iOS)

- Agreements, Tax, and Banking: the **Paid Apps** agreement must be active.
- Create one subscription group (e.g. "Paleoglossa") with the six
  auto-renewable subscriptions above.
- Order the group's levels Full Pack > Duo > Basic so upgrades and downgrades
  behave correctly.
- Give each product a price, a display name, a description and a review
  screenshot (a capture of the in-app plans page).
- Create an **In-App Purchase key** (Users and Access → Integrations) for
  RevenueCat.
- Create a sandbox tester (Users and Access → Sandbox).

### 2. Google Play Console (Android)

- Set up a payments profile (Play Console → Setup → Payments profile).
- Upload a build that contains this code to at least the **Internal testing**
  track — Play only lets you create subscriptions once a build with the
  billing permission has been uploaded. The permission comes from the
  RevenueCat plugin; nothing needs adding to `AndroidManifest.xml`.
- Monetize → Subscriptions: create **six subscriptions**, one per ID above,
  each with **one** auto-renewing base plan (base plan id of your choice, e.g.
  `monthly` / `yearly`) and its price. Activate each base plan.

  The app relies on this one-subscription-per-plan layout: when a subscriber
  picks a different plan it tells Play which subscription to replace
  (`currentPlayProductId` in `iapService.ts`), so they are not billed twice.
- Create a **service account** with access to financial data and manage
  orders/subscriptions, and give its JSON key to RevenueCat. It can take up
  to a day or two before Google accepts the new credentials.
- Enable **Real-time developer notifications** using the Pub/Sub topic
  RevenueCat gives you, so cancellations and renewals arrive promptly.
- Add your testers under Setup → License testing.

### 3. RevenueCat

- Create a project. Add an **App Store** app (bundle id
  `com.paleoglossa.app`, upload the In-App Purchase key) and a **Play Store**
  app (package `com.paleoglossa.app`, upload the service-account JSON).
- Import the products from both stores and attach all of them as packages to
  the **current offering** (any package identifiers — the app matches on
  product id). A package can hold the iOS and the Android product together.
- Integrations → Webhooks: URL `https://paleoglossa.com/api/revenuecat/webhook`,
  and an Authorization header value of your choosing.
- Recommended: set "Transfer purchases" behaviour to *transfer to new App
  User ID*, so Restore Purchases works after a user switches accounts.

### 4. Environment variables

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_ENABLE_MOBILE_PURCHASES` | `.env.native-production` / Xcode Cloud | `true` |
| `VITE_REVENUECAT_IOS_API_KEY` | same | RevenueCat public iOS SDK key (`appl_…`) |
| `VITE_REVENUECAT_ANDROID_API_KEY` | `.env.native-production` | RevenueCat public Android SDK key (`goog_…`) |
| `REVENUECAT_SECRET_API_KEY` | Vercel (server) | RevenueCat secret REST API key (`sk_…`) |
| `REVENUECAT_WEBHOOK_AUTH` | Vercel (server) | the Authorization header value from step 3 |

To launch one platform first, leave the other platform's key empty.

### 5. Firestore rules

`subscriptionSource` was added to the server-controlled fields. Deploy:

```bash
firebase deploy --only firestore:rules --project paleoglossa-reader
```

## Android activity launch mode

`MainActivity` uses `android:launchMode="singleTop"` instead of Capacitor's
default `singleTask`. RevenueCat requires `standard` or `singleTop`: with
`singleTask`, a purchase is cancelled if Google Play sends the user to another
app mid-purchase (for example a banking app for payment verification) and
they return to Paleoglossa.

The launch mode also governs how `paleoglossa://` deep links re-enter the
app, and the change was made without a device to test on. Check both on a
real Android device:

- [ ] A purchase that requires bank verification completes after returning
      to the app.
- [ ] A password-reset link opens the already-running app on the right
      screen, without starting a second copy of it.

## Testing

Use a sandbox tester on a real iPhone and a license tester on a real Android
device (installed from the internal testing track). Run the list on each.

- [ ] Plans page shows the store's prices for all three plans, monthly and yearly.
- [ ] Buy Basic monthly → plan becomes active without restarting the app.
- [ ] Change to Full Pack → plan changes, and the store shows **one**
      subscription, not two (on Android this exercises the replacement path).
- [ ] Reinstall the app, sign in, tap **Restore Purchases** → plan returns.
- [ ] Cancel in the store's subscription settings; after the test period ends
      the account returns to Free (via the webhook).
- [ ] Dismissing the payment sheet shows no error.
- [ ] An account with a web (Stripe) plan sees "already active" and no buy buttons.
- [ ] An account subscribed in the *other* store sees "already active" too.
- [ ] Signed out: the page asks you to sign in and the buy buttons are disabled.
- [ ] The terms under the buttons name the right store (Apple ID / Google Play).

## Store review notes

- **Apple:** provide a demo account in App Review Information. The plans page
  carries the auto-renewal terms and Terms/Privacy links next to the purchase
  buttons (guideline 3.1.2); also add the Terms of Use link to the App Store
  description or the EULA field. Submit the six subscriptions for review
  together with the app version.
- **Google:** declare purchase history in the Data safety form, and give
  reviewers a test account under App content → App access.
- **Both:** add purchase history to the privacy answers (and to
  `ios/App/App/PrivacyInfo.xcprivacy`) before switching purchases on.
