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
