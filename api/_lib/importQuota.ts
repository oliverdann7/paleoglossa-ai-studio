import { getPlanById, type PlanId } from '../../src/lib/constants/plans.js';

export interface ImportQuotaEvaluation {
  allowed: boolean;
  used: number;
  limit: number | 'all';
  remaining: number | 'unlimited';
}

/**
 * Evaluate whether a user may create one more import given their effective
 * plan and how many imports they already have. Unknown plan ids fall back to
 * the free plan via `getPlanById`. Pure (no Firestore) so it can be unit-tested.
 */
export function evaluateImportQuota(planId: string, used: number): ImportQuotaEvaluation {
  const limit = getPlanById(planId as PlanId).importLimit;
  if (limit === 'all') {
    return { allowed: true, used, limit, remaining: 'unlimited' };
  }
  return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
}
