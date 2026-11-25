/**
 * App Store subscription products, shared by the iOS client and the API.
 *
 * These identifiers must exist verbatim in App Store Connect (one
 * subscription group, six auto-renewable products) and be attached to the
 * current offering in RevenueCat. Changing one here without changing it there
 * makes that plan unpurchasable.
 */
import type { PlanId } from './plans.js';

export type PaidPlanId = Exclude<PlanId, 'free'>;
export type BillingCycle = 'monthly' | 'yearly';

export const IAP_PRODUCT_IDS: Record<PaidPlanId, Record<BillingCycle, string>> = {
  basic_1: {
    monthly: 'com.paleoglossa.app.basic.monthly',
    yearly: 'com.paleoglossa.app.basic.yearly',
  },
  duo_2: {
    monthly: 'com.paleoglossa.app.duo.monthly',
    yearly: 'com.paleoglossa.app.duo.yearly',
  },
  full_all: {
    monthly: 'com.paleoglossa.app.full.monthly',
    yearly: 'com.paleoglossa.app.full.yearly',
  },
};

/** Higher rank wins when a user briefly holds two products (plan change). */
const PLAN_RANK: Record<PaidPlanId, number> = { basic_1: 1, duo_2: 2, full_all: 3 };

export function planForIapProduct(
  productId: string | null | undefined
): { planId: PaidPlanId; cycle: BillingCycle } | null {
  if (!productId) return null;
  for (const planId of Object.keys(IAP_PRODUCT_IDS) as PaidPlanId[]) {
    for (const cycle of ['monthly', 'yearly'] as const) {
      if (IAP_PRODUCT_IDS[planId][cycle] === productId) return { planId, cycle };
    }
  }
  return null;
}

/** The best plan among a set of product ids, or null when none is ours. */
export function bestPlanForIapProducts(productIds: Iterable<string>): PaidPlanId | null {
  let best: PaidPlanId | null = null;
  for (const id of productIds) {
    const match = planForIapProduct(id);
    if (match && (!best || PLAN_RANK[match.planId] > PLAN_RANK[best])) best = match.planId;
  }
  return best;
}
