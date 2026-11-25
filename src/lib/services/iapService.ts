/**
 * In-app purchase via RevenueCat: the App Store on iOS, Google Play on Android.
 *
 * The flow: the app buys a subscription through the platform's store
 * (StoreKit / Play Billing, behind RevenueCat's SDK),
 * then asks our API to sync (`POST /api/iap/sync`). The API reads the user's
 * state straight from RevenueCat and writes the plan to `users/{uid}` — the
 * client never asserts what it bought. Renewals, expirations and refunds
 * arrive later through the RevenueCat webhook and take the same path.
 *
 * The plugin is imported lazily so web bundles never load it.
 */
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { isCapacitor, capacitorPlatform } from '../platform.js';
import { features } from '../features.js';
import { apiFetch } from './apiFetch.js';
import {
  IAP_PRODUCT_IDS,
  baseIapProductId,
  planForIapProduct,
  type BillingCycle,
  type PaidPlanId,
} from '../constants/iapProducts.js';

/** Public RevenueCat SDK keys: iOS starts with `appl_`, Android with `goog_`. */
const IOS_API_KEY: string =
  (import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined) ?? '';
const ANDROID_API_KEY: string =
  (import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY as string | undefined) ?? '';

export type IapStore = 'app_store' | 'play_store';

/** The store this build sells through, or null on the web. */
export function iapStore(): IapStore | null {
  if (!isCapacitor()) return null;
  const platform = capacitorPlatform();
  if (platform === 'ios') return 'app_store';
  if (platform === 'android') return 'play_store';
  return null;
}

function apiKey(): string {
  const store = iapStore();
  return store === 'app_store' ? IOS_API_KEY : store === 'play_store' ? ANDROID_API_KEY : '';
}

/**
 * Whether this build can sell subscriptions in-app: a native app, with
 * purchases switched on and that platform's RevenueCat key baked in. Each
 * platform turns on independently, by its own key. On the web (Stripe) this
 * is always false.
 */
export function isIapAvailable(): boolean {
  return features.isMobilePurchaseEnabled() && apiKey().length > 0;
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
    await Purchases.configure({ apiKey: apiKey(), appUserID: uid });
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
 * On Google Play each plan is its own subscription, so buying a second one
 * would leave the user paying for both. Find the subscription they already
 * hold (if any) so the purchase replaces it instead. The App Store does this
 * itself through the subscription group.
 */
async function currentPlayProductId(
  Purchases: Awaited<ReturnType<typeof getPurchases>>,
  buying: string
): Promise<string | null> {
  const { customerInfo } = await Purchases.getCustomerInfo();
  const held = (customerInfo.activeSubscriptions ?? [])
    .filter((id) => planForIapProduct(id))
    .map(baseIapProductId)
    .find((id) => id !== baseIapProductId(buying));
  return held ?? null;
}

/**
 * Buy a plan. Resolves with the plan the server now has on record; rejects
 * with `IapCancelledError` when the user dismisses the store's payment sheet.
 */
export async function purchaseIapOffer(uid: string, offer: IapOffer): Promise<string | null> {
  const Purchases = await getPurchases(uid);
  try {
    const replacing =
      iapStore() === 'play_store'
        ? await currentPlayProductId(Purchases, offer.pkg.product.identifier)
        : null;
    await Purchases.purchasePackage({
      aPackage: offer.pkg,
      ...(replacing ? { storeProductChangeInfo: { oldProductIdentifier: replacing } } : {}),
    });
  } catch (err) {
    if (isCancellation(err)) throw new IapCancelledError();
    throw err;
  }
  return syncWithServer();
}

/** "Restore Purchases" (required by App Store review; useful on Play too). */
export async function restoreIapPurchases(uid: string): Promise<string | null> {
  const Purchases = await getPurchases(uid);
  await Purchases.restorePurchases();
  return syncWithServer();
}

/** The store's own subscription management screen for this platform. */
export function manageSubscriptionsUrl(): string {
  return iapStore() === 'play_store'
    ? 'https://play.google.com/store/account/subscriptions?package=com.paleoglossa.app'
    : 'https://apps.apple.com/account/subscriptions';
}

export { IAP_PRODUCT_IDS };
