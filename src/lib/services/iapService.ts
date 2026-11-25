/**
 * App Store in-app purchase, via RevenueCat. iOS only.
 *
 * The flow: the app buys a subscription through StoreKit (RevenueCat's SDK),
 * then asks our API to sync (`POST /api/iap/sync`). The API reads the user's
 * state straight from RevenueCat and writes the plan to `users/{uid}` — the
 * client never asserts what it bought. Renewals, expirations and refunds
 * arrive later through the RevenueCat webhook and take the same path.
 *
 * The plugin is imported lazily so web bundles and the Android app never load
 * it.
 */
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { isCapacitor, capacitorPlatform } from '../platform.js';
import { features } from '../features.js';
import { apiFetch } from './apiFetch.js';
import {
  IAP_PRODUCT_IDS,
  planForIapProduct,
  type BillingCycle,
  type PaidPlanId,
} from '../constants/iapProducts.js';

/** Public RevenueCat SDK key for the iOS app (starts with `appl_`). */
const IOS_API_KEY: string =
  (import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined) ?? '';

/**
 * Whether this build can sell subscriptions in-app: the iOS app, with
 * purchases switched on and a RevenueCat key baked in. Everywhere else
 * (web → Stripe; Android → no purchase UI yet) this is false.
 */
export function isIapAvailable(): boolean {
  return (
    isCapacitor() &&
    capacitorPlatform() === 'ios' &&
    features.isMobilePurchaseEnabled() &&
    IOS_API_KEY.length > 0
  );
}

/** A plan as the App Store sells it, with the store's own localized price. */
export interface IapOffer {
  planId: PaidPlanId;
  cycle: BillingCycle;
  /** e.g. "$5.99" or "6,99 €" — always show this, never our USD figure. */
  priceString: string;
  pkg: PurchasesPackage;
}

export class IapCancelledError extends Error {
  constructor() {
    super('Purchase cancelled');
    this.name = 'IapCancelledError';
  }
}

let configuredFor: string | null = null;

async function getPurchases(uid: string) {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  if (configuredFor === null) {
    await Purchases.configure({ apiKey: IOS_API_KEY, appUserID: uid });
  } else if (configuredFor !== uid) {
    // A different account signed in on this device.
    await Purchases.logIn({ appUserID: uid });
  }
  configuredFor = uid;
  return Purchases;
}

function isCancellation(err: unknown): boolean {
  const e = err as { userCancelled?: unknown; code?: unknown; message?: unknown } | null;
  return (
    e?.userCancelled === true ||
    e?.code === '1' ||
    e?.code === 1 ||
    /cancel/i.test(String(e?.message ?? ''))
  );
}

/**
 * The plans on sale, keyed `${planId}:${cycle}`. Only products we know are
 * returned; a product missing from App Store Connect or the RevenueCat
 * offering simply has no entry (and so no buy button).
 */
export async function loadIapOffers(uid: string): Promise<Record<string, IapOffer>> {
  const Purchases = await getPurchases(uid);
  const offerings = await Purchases.getOfferings();
  const packages = [
    ...(offerings.current?.availablePackages ?? []),
    ...Object.values(offerings.all ?? {}).flatMap((o) => o.availablePackages ?? []),
  ];
  const offers: Record<string, IapOffer> = {};
  for (const pkg of packages) {
    const match = planForIapProduct(pkg.product?.identifier);
    if (!match) continue;
    const key = `${match.planId}:${match.cycle}`;
    if (!offers[key]) {
      offers[key] = { ...match, priceString: pkg.product.priceString, pkg };
    }
  }
  return offers;
}

/** Ask the server to read the purchase state from RevenueCat and apply it. */
async function syncWithServer(): Promise<string | null> {
  const data = await apiFetch<{ currentPlan: string | null }>('/api/iap/sync', { method: 'POST' });
  return data?.currentPlan ?? null;
}

/**
 * Buy a plan. Resolves with the plan the server now has on record; rejects
 * with `IapCancelledError` when the user dismisses Apple's sheet.
 */
export async function purchaseIapOffer(uid: string, offer: IapOffer): Promise<string | null> {
  const Purchases = await getPurchases(uid);
  try {
    await Purchases.purchasePackage({ aPackage: offer.pkg });
  } catch (err) {
    if (isCancellation(err)) throw new IapCancelledError();
    throw err;
  }
  return syncWithServer();
}

/** "Restore Purchases" (required by App Store review). */
export async function restoreIapPurchases(uid: string): Promise<string | null> {
  const Purchases = await getPurchases(uid);
  await Purchases.restorePurchases();
  return syncWithServer();
}

/** Apple's own subscription management screen. */
export const APPLE_MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export { IAP_PRODUCT_IDS };
