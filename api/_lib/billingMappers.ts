/**
 * Pure mapping helpers for Stripe webhook handling. Extracted so they can
 * be unit-tested without spinning up Stripe or Firestore.
 */

export type InternalSubscriptionStatus = 'active' | 'past_due' | 'canceled';

/**
 * Map a Stripe subscription `status` to the smaller set of statuses we
 * persist on the user document. Unknown statuses fall back to `past_due`
 * (conservative: keep access flagged, do not silently treat as active).
 */
export function mapStripeStatusToInternal(stripeStatus: string): InternalSubscriptionStatus {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active';
  if (stripeStatus === 'canceled' || stripeStatus === 'unpaid') return 'canceled';
  return 'past_due';
}

/**
 * Resolve a Stripe price ID back to a Paleoglossa planId.
 * `priceMap` is `{ planId -> { monthly?, yearly? } }` — usually the
 * PRICE_IDS constant from billing.ts. Falls back to `'basic_1'` to match
 * the existing webhook behavior.
 */
export function planIdFromPriceId(
  priceId: string | undefined,
  priceMap: Record<string, { monthly?: string; yearly?: string }>
): string {
  if (!priceId) return 'basic_1';
  for (const [planId, prices] of Object.entries(priceMap)) {
    if (prices.monthly === priceId || prices.yearly === priceId) return planId;
  }
  return 'basic_1';
}

/**
 * Languages unlocked for a given paid plan. `full_all` opens every
 * language we currently support; everything else starts with Ancient Greek.
 */
export function languagesForPlan(planId: string): string[] {
  if (planId === 'full_all') {
    return ['grc', 'grc-koine', 'hbo', 'lat', 'syr', 'cop', 'arc', 'akk', 'san', 'egy', 'hit'];
  }
  return ['grc'];
}

/**
 * Result of interpreting a subscription-bearing Stripe webhook event.
 * `byUid` events (checkout completion) address a user document directly by
 * uid; `byCustomer` events (subscription updates/deletions) must look the
 * user up by their stored `stripeCustomerId`. The `update` payload is the
 * field set to merge — the caller is expected to add a server-side
 * `subscriptionUpdatedAt` timestamp before writing.
 */
export type SubscriptionWrite =
  | { kind: 'byUid'; uid: string; update: Record<string, unknown> }
  | { kind: 'byCustomer'; customerId: string; update: Record<string, unknown> }
  | null;

/**
 * Translate one of the three subscription-lifecycle Stripe events into a
 * plain write descriptor. Pure (no Stripe/Firestore), so the webhook routing
 * logic can be unit-tested. Returns `null` for events we don't act on or that
 * are missing the identifiers we need to target a user.
 */
export function buildSubscriptionWrite(
  event: { type: string; data: { object: any } },
  priceMap: Record<string, { monthly?: string; yearly?: string }>
): SubscriptionWrite {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const uid = session.client_reference_id || session.metadata?.userId;
      if (!uid) return null;
      const planId = session.metadata?.planId || 'basic_1';
      return {
        kind: 'byUid',
        uid,
        update: {
          currentPlan: planId,
          subscriptionStatus: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          selectedLanguageIds: languagesForPlan(planId),
        },
      };
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      if (!customerId) return null;
      const priceId = subscription.items?.data?.[0]?.price?.id;
      return {
        kind: 'byCustomer',
        customerId,
        update: {
          currentPlan: planIdFromPriceId(priceId, priceMap),
          subscriptionStatus: mapStripeStatusToInternal(subscription.status),
        },
      };
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      if (!customerId) return null;
      return {
        kind: 'byCustomer',
        customerId,
        update: {
          currentPlan: 'free',
          subscriptionStatus: 'canceled',
        },
      };
    }

    default:
      return null;
  }
}
