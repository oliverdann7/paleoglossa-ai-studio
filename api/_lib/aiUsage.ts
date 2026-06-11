import { getAdminDb } from './firebaseAdmin.js';

const PLAN_AI_LIMITS: Record<string, number | 'all'> = {
  free: 20,
  basic_1: 200,
  duo_2: 1000,
  full_all: 'all',
};

export interface QuotaResult {
  allowed: boolean;
  remaining: number | 'unlimited';
  resetDate: string;
  planLimit: number | 'all';
}

function getDateKey(date?: Date): string {
  const d = date || new Date();
  return d.toISOString().split('T')[0];
}

function getNextResetDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Returns the daily AI analysis limit for a given plan.
 */
export function getPlanAILimit(planId: string): number | 'all' {
  return PLAN_AI_LIMITS[planId] || 20;
}

/** Paid plans that grant AI quota above the free tier. */
const PAID_PLANS = new Set(['basic_1', 'duo_2', 'full_all']);

/**
 * Resolve the plan a user is actually entitled to for quota purposes.
 *
 * A user document can claim any `currentPlan` — if it were trusted blindly, a
 * spoofed or stale `currentPlan: 'full_all'` would unlock unlimited Gemini
 * usage. So a paid plan is only honored when the subscription is genuinely
 * active: `subscriptionStatus === 'active'` AND a non-empty
 * `stripeSubscriptionId` is present (proof a real Stripe subscription backs
 * it). Anything else — free plan, unknown plan, past_due/canceled status, or a
 * missing subscription id — collapses to `'free'`.
 *
 * Pure (no Firestore) so it can be unit-tested. The caller is expected to log a
 * warning when the resolved plan differs from the claimed one.
 */
export function resolveEffectivePlan(
  rawPlan: string | undefined,
  subscriptionStatus: string | undefined,
  stripeSubscriptionId: string | undefined
): string {
  const plan = rawPlan || 'free';
  if (!PAID_PLANS.has(plan)) return 'free';
  const hasActiveSub =
    subscriptionStatus === 'active' &&
    typeof stripeSubscriptionId === 'string' &&
    stripeSubscriptionId.length > 0;
  return hasActiveSub ? plan : 'free';
}

/**
 * Look up a user's effective plan from Firestore, honoring a paid plan only
 * when backed by an active Stripe subscription (see `resolveEffectivePlan`).
 * Falls back to `'free'` when the Admin DB is unavailable or the lookup fails.
 */
export async function lookupEffectivePlan(uid: string): Promise<string> {
  try {
    const adminDb_ = getAdminDb();
    if (!adminDb_) return 'free';
    const snap = await adminDb_.doc('users/' + uid).get();
    if (!snap.exists) return 'free';
    const data = snap.data();
    const rawPlan = (data?.currentPlan as string) || 'free';
    const effective = resolveEffectivePlan(
      rawPlan,
      data?.subscriptionStatus as string | undefined,
      data?.stripeSubscriptionId as string | undefined
    );
    if (effective !== rawPlan) {
      console.warn(
        `[plan] user ${uid} claims plan "${rawPlan}" but subscription is not active ` +
          `(status=${data?.subscriptionStatus ?? 'none'}, hasSubId=${Boolean(data?.stripeSubscriptionId)}); ` +
          `granting "${effective}" quota instead`
      );
    }
    return effective;
  } catch {
    return 'free';
  }
}

/**
 * Checks whether the user has quota remaining for AI analysis today,
 * and increments the counter if quota exists.
 *
 * @param uid - The user's Firebase UID.
 * @param planId - The user's current plan ID (e.g. 'free', 'basic_1').
 * @param endpoint - The AI endpoint being called (e.g. 'analyze', 'translate', 'explain').
 * @param inputLength - Approximate length of the input text for estimation.
 * @param units - Quota units this request consumes (default 1). Size-based
 *   endpoints (e.g. file parsing) charge more units for larger inputs.
 * @returns QuotaResult with allowed/remaining/resetDate/planLimit.
 */
export async function checkAndIncrementUsage(
  uid: string,
  planId: string,
  endpoint: string,
  inputLength: number,
  units: number = 1
): Promise<QuotaResult> {
  const limit = getPlanAILimit(planId);
  const resetDate = getNextResetDate();

  // Unlimited plan — track count but always allow
  if (limit === 'all') {
    // Still increment for analytics
    await incrementUsage(uid, endpoint, inputLength);
    return { allowed: true, remaining: 'unlimited', resetDate, planLimit: 'all' };
  }

  const adminDb_ = getAdminDb();
  if (!adminDb_) {
    // Admin DB not available (dev mode), allow
    return { allowed: true, remaining: limit, resetDate, planLimit: limit };
  }

  const dateKey = getDateKey();
  const docId = `${uid}_${dateKey}`;

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const docRef = adminDb_.doc('aiUsage/' + docId);
    const snap = await docRef.get();

    const currentCount: number = snap.exists ? snap.data()?.count || 0 : 0;
    const newCount = currentCount + units;

    if (newCount > limit) {
      return {
        allowed: false,
        remaining: Math.max(0, limit - currentCount),
        resetDate,
        planLimit: limit,
      };
    }

    // Increment
    await docRef.set(
      {
        count: newCount,
        endpoints: {
          ...(snap.exists ? snap.data()?.endpoints || {} : {}),
          [endpoint]: ((snap.exists ? snap.data()?.endpoints || {} : {})[endpoint] || 0) + units,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      allowed: true,
      remaining: limit - newCount,
      resetDate,
      planLimit: limit,
    };
  } catch (err) {
    console.error('[aiUsage] Error checking quota:', err);
    // On error, allow the request to proceed
    return { allowed: true, remaining: limit, resetDate, planLimit: limit };
  }
}

/**
 * Quota units a file-parse request consumes, scaled by upload size:
 * 1 unit per started megabyte (a 10 MB PDF costs 10 units). Pure for testing.
 */
export function computeParseUnits(sizeBytes: number): number {
  return Math.max(1, Math.ceil(sizeBytes / 1_000_000));
}

/**
 * One-call quota enforcement for authenticated requests: resolves the user's
 * effective plan, then checks and increments usage. Same fail-open semantics
 * as `checkAndIncrementUsage` (errors and missing Admin DB allow the request).
 */
export async function enforceAiQuota(
  uid: string,
  endpoint: string,
  inputLength: number,
  units: number = 1
): Promise<QuotaResult> {
  const planId = await lookupEffectivePlan(uid);
  return checkAndIncrementUsage(uid, planId, endpoint, inputLength, units);
}

async function incrementUsage(uid: string, endpoint: string, inputLength: number): Promise<void> {
  const adminDb_ = getAdminDb();
  if (!adminDb_) return;

  const dateKey = getDateKey();
  const docId = `${uid}_${dateKey}`;

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const docRef = adminDb_.doc('aiUsage/' + docId);
    const snap = await docRef.get();

    await docRef.set(
      {
        count: (snap.exists ? snap.data()?.count || 0 : 0) + 1,
        totalInputLength: (snap.exists ? snap.data()?.totalInputLength || 0 : 0) + inputLength,
        endpoints: {
          ...(snap.exists ? snap.data()?.endpoints || {} : {}),
          [endpoint]: ((snap.exists ? snap.data()?.endpoints || {} : {})[endpoint] || 0) + 1,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Silent fail for analytics-only tracking
  }
}
