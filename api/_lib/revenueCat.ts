/**
 * RevenueCat (App Store in-app purchase) → Paleoglossa subscription state.
 *
 * One rule for every entry point (post-purchase sync and webhook): fetch the
 * subscriber's current state from RevenueCat and write what it says. We never
 * interpret individual webhook event types, so replays, reordering and missed
 * deliveries cannot leave a user on the wrong plan.
 */
import type { Firestore } from 'firebase-admin/firestore';
import { bestPlanForIapProducts } from '../../src/lib/constants/iapProducts.js';
import { languagesForPlan } from './billingMappers.js';

/** The subset of RevenueCat's `GET /v1/subscribers/{id}` response we read. */
export interface RevenueCatSubscriber {
  subscriptions?: Record<
    string,
    {
      expires_date?: string | null;
      billing_issues_detected_at?: string | null;
      refunded_at?: string | null;
    }
  >;
}

export interface IapEntitlement {
  planId: 'basic_1' | 'duo_2' | 'full_all';
  status: 'active' | 'past_due';
}

/**
 * The plan a subscriber is currently entitled to, or null. A subscription
 * counts while it has not expired and was not refunded; during Apple's billing
 * grace period it still counts but is flagged `past_due`. Pure.
 */
export function entitlementFromSubscriber(
  subscriber: RevenueCatSubscriber | null | undefined,
  nowMs: number
): IapEntitlement | null {
  const live = Object.entries(subscriber?.subscriptions ?? {}).filter(([, sub]) => {
    if (sub.refunded_at) return false;
    if (!sub.expires_date) return true; // non-expiring grant
    const expires = Date.parse(sub.expires_date);
    return Number.isFinite(expires) && expires > nowMs;
  });
  const planId = bestPlanForIapProducts(live.map(([productId]) => productId));
  if (!planId) return null;
  const billingIssue = live.some(([, sub]) => !!sub.billing_issues_detected_at);
  return { planId, status: billingIssue ? 'past_due' : 'active' };
}

/**
 * The user-document update for a given entitlement, or null for "leave the
 * document alone". Pure.
 *
 * - Entitled: set the plan. Languages are reset to the plan default only when
 *   the plan actually changes, so renewals never clobber the user's choices.
 * - Not entitled: downgrade to free only if the App Store is what granted the
 *   current plan — a web (Stripe) subscriber must not lose access because
 *   they have no App Store purchase.
 */
export function buildIapUserUpdate(
  entitlement: IapEntitlement | null,
  existing: { currentPlan?: string; subscriptionSource?: string } | undefined
): Record<string, unknown> | null {
  if (entitlement) {
    const update: Record<string, unknown> = {
      currentPlan: entitlement.planId,
      subscriptionStatus: entitlement.status,
      subscriptionSource: 'app_store',
    };
    if (existing?.currentPlan !== entitlement.planId) {
      update.selectedLanguageIds = languagesForPlan(entitlement.planId);
    }
    return update;
  }
  if (existing?.subscriptionSource === 'app_store' && existing.currentPlan !== 'free') {
    return { currentPlan: 'free', subscriptionStatus: 'canceled' };
  }
  return null;
}

/** RevenueCat assigns these ids before the app logs the user in; never a uid. */
export function isAnonymousRevenueCatId(id: string): boolean {
  return id.startsWith('$RCAnonymousID:');
}

/**
 * Every Firebase uid a webhook event concerns: the subject, its aliases, and
 * both sides of a TRANSFER. Pure.
 */
export function uidsFromWebhookEvent(event: unknown): string[] {
  const e = (event ?? {}) as Record<string, unknown>;
  const candidates: unknown[] = [
    e.app_user_id,
    e.original_app_user_id,
    ...(Array.isArray(e.aliases) ? e.aliases : []),
    ...(Array.isArray(e.transferred_from) ? e.transferred_from : []),
    ...(Array.isArray(e.transferred_to) ? e.transferred_to : []),
  ];
  const uids = candidates.filter(
    (id): id is string =>
      typeof id === 'string' && id.length > 0 && id.length <= 128 && !isAnonymousRevenueCatId(id)
  );
  return [...new Set(uids)];
}

export async function fetchRevenueCatSubscriber(
  uid: string,
  secretKey: string
): Promise<RevenueCatSubscriber> {
  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(uid)}`,
    { headers: { Authorization: `Bearer ${secretKey}`, Accept: 'application/json' } }
  );
  if (!res.ok) {
    throw new Error(`RevenueCat responded ${res.status}`);
  }
  const body = (await res.json()) as { subscriber?: RevenueCatSubscriber };
  return body.subscriber ?? {};
}

/**
 * Bring `users/{uid}` in line with RevenueCat. Returns the entitlement that
 * was found (null when the user has no live App Store subscription).
 */
export async function syncUserFromRevenueCat(
  adminDb: Firestore,
  uid: string,
  secretKey: string
): Promise<IapEntitlement | null> {
  const subscriber = await fetchRevenueCatSubscriber(uid, secretKey);
  const entitlement = entitlementFromSubscriber(subscriber, Date.now());
  const ref = adminDb.doc(`users/${uid}`);
  const snap = await ref.get();
  // A webhook can name an id that is not one of our users (e.g. a sandbox
  // tester); only ever touch documents that already exist.
  if (!snap.exists) return entitlement;
  const update = buildIapUserUpdate(entitlement, snap.data());
  if (update) {
    const { FieldValue } = await import('firebase-admin/firestore');
    await ref.set({ ...update, subscriptionUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  return entitlement;
}
