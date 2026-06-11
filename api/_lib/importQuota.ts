import { getPlanById, type PlanId } from '../../src/lib/constants/plans.js';
import { getAdminDb } from './firebaseAdmin.js';
import { lookupEffectivePlan } from './aiUsage.js';

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

/**
 * Resolve the user's effective plan and count their imports, then evaluate
 * the quota. Returns `null` when the check cannot be performed (Admin DB
 * unavailable or the lookup fails) — callers must fail open on `null` so a
 * degraded quota check never blocks importing.
 */
export async function checkImportQuotaForUser(
  uid: string
): Promise<(ImportQuotaEvaluation & { planId: string }) | null> {
  try {
    const adminDb_ = getAdminDb();
    if (!adminDb_) return null;
    const planId = await lookupEffectivePlan(uid);
    const countSnap = await adminDb_.collection(`users/${uid}/imports`).count().get();
    return { ...evaluateImportQuota(planId, countSnap.data().count), planId };
  } catch (err) {
    console.error('[importQuota] quota check failed:', err);
    return null;
  }
}
