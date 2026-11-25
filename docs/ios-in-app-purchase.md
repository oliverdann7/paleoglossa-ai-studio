# iOS in-app purchase (RevenueCat)

The iOS app sells the three paid plans as App Store auto-renewable
subscriptions. The web keeps using Stripe. Android has no purchase UI yet.

In-app purchase is **off** until every step below is done and
`VITE_ENABLE_MOBILE_PURCHASES=true` with `VITE_REVENUECAT_IOS_API_KEY` set.
While off, the iOS app shows plans as a feature comparison with no prices.

## How it works

1. `src/pages/Subscription.tsx` loads the offering through
   `src/lib/services/iapService.ts` and shows the **App Store's own localized
   price** on each plan.
2. On purchase (or Restore Purchases) the app calls `POST /api/iap/sync`.
3. The API (`api/_lib/revenueCat.ts`) reads the subscriber from RevenueCat's
   REST API and writes `currentPlan`, `subscriptionStatus` and
   `subscriptionSource: 'app_store'` to `users/{uid}`. The client never
   states what it bought.
4. Renewals, expirations, refunds and billing problems arrive on
   `POST /api/revenuecat/webhook`, which runs the same sync.

The RevenueCat app user id is the Firebase uid.

A plan bought on the web is never sold again in the app, and an expired App
Store subscription never downgrades a Stripe subscriber
(`buildIapUserUpdate`).

## One-time setup

### 1. App Store Connect

- Agreements, Tax, and Banking: the **Paid Apps** agreement must be active.
- Create one subscription group (e.g. "Paleoglossa") with six auto-renewable
  subscriptions. The product IDs must match
  `src/lib/constants/iapProducts.ts` exactly:

  | Plan | Monthly | Yearly |
  |------|---------|--------|
  | Basic | `com.paleoglossa.app.basic.monthly` | `com.paleoglossa.app.basic.yearly` |
  | Duo | `com.paleoglossa.app.duo.monthly` | `com.paleoglossa.app.duo.yearly` |
  | Full Pack | `com.paleoglossa.app.full.monthly` | `com.paleoglossa.app.full.yearly` |

- Order the group's levels Full Pack > Duo > Basic so upgrades and downgrades
  behave correctly.
- Give each product a price, a display name, a description and a review
  screenshot (a capture of the in-app plans page).
- Create an **In-App Purchase key** (Users and Access → Integrations) for
  RevenueCat.
- Create a sandbox tester (Users and Access → Sandbox).

### 2. RevenueCat

- Create a project and add an **App Store** app with bundle id
  `com.paleoglossa.app`; upload the In-App Purchase key.
- Import the six products and attach all six as packages to the **current
  offering** (any package identifiers — the app matches on product id).
- Integrations → Webhooks: URL `https://paleoglossa.com/api/revenuecat/webhook`,
  and an Authorization header value of your choosing.
- Recommended: set "Transfer purchases" behaviour to *transfer to new App
  User ID*, so Restore Purchases works after a user switches accounts.

### 3. Environment variables

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_REVENUECAT_IOS_API_KEY` | `.env.native-production` / Xcode Cloud | RevenueCat public iOS SDK key (`appl_…`) |
| `VITE_ENABLE_MOBILE_PURCHASES` | same | `true` |
| `REVENUECAT_SECRET_API_KEY` | Vercel (server) | RevenueCat secret REST API key (`sk_…`) |
| `REVENUECAT_WEBHOOK_AUTH` | Vercel (server) | the Authorization header value from step 2 |

### 4. Firestore rules

`subscriptionSource` was added to the server-controlled fields. Deploy:

```bash
firebase deploy --only firestore:rules --project paleoglossa-reader
```

## Testing (sandbox, on a real iPhone)

- [ ] Plans page shows App Store prices for all three plans, monthly and yearly.
- [ ] Buy Basic monthly with the sandbox tester → plan becomes active without
      restarting the app.
- [ ] Upgrade to Full Pack → plan changes.
- [ ] Delete and reinstall the app, sign in, tap **Restore Purchases** → plan returns.
- [ ] Cancel in Settings → Apple ID → Subscriptions; after the sandbox period
      ends the account returns to Free (via the webhook).
- [ ] Dismissing Apple's payment sheet shows no error.
- [ ] An account with a web (Stripe) plan sees "already active" and no buy buttons.
- [ ] Signed out: the page asks you to sign in and the buy buttons are disabled.

## App Review notes

- Provide the sandbox-capable demo account in App Review Information.
- The plans page carries the auto-renewal terms and links to Terms of Use and
  Privacy Policy next to the purchase buttons (guideline 3.1.2). Also add the
  Terms of Use link to the App Store description or the EULA field.
- Submit the six subscriptions for review **together with** the app version.
