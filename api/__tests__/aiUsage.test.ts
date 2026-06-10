import { describe, it, expect } from 'vitest';
import { checkAndIncrementUsage, getPlanAILimit, resolveEffectivePlan } from '../_lib/aiUsage';

describe('getPlanAILimit (real export)', () => {
  it('free plan has limit of 20', () => {
    expect(getPlanAILimit('free')).toBe(20);
  });

  it('basic_1 has limit of 200', () => {
    expect(getPlanAILimit('basic_1')).toBe(200);
  });

  it('duo_2 has limit of 1000', () => {
    expect(getPlanAILimit('duo_2')).toBe(1000);
  });

  it('full_all has unlimited AI', () => {
    expect(getPlanAILimit('full_all')).toBe('all');
  });

  it('unknown plan defaults to 20', () => {
    expect(getPlanAILimit('unknown')).toBe(20);
  });
});

describe('resolveEffectivePlan — plan-spoofing guard', () => {
  const ACTIVE = 'active';
  const SUB = 'sub_123';

  it('honors a paid plan with active status + a stripe subscription id', () => {
    expect(resolveEffectivePlan('basic_1', ACTIVE, SUB)).toBe('basic_1');
    expect(resolveEffectivePlan('duo_2', ACTIVE, SUB)).toBe('duo_2');
    expect(resolveEffectivePlan('full_all', ACTIVE, SUB)).toBe('full_all');
  });

  it('downgrades a paid plan to free when status is not active', () => {
    expect(resolveEffectivePlan('full_all', 'past_due', SUB)).toBe('free');
    expect(resolveEffectivePlan('full_all', 'canceled', SUB)).toBe('free');
    expect(resolveEffectivePlan('basic_1', undefined, SUB)).toBe('free');
  });

  it('downgrades a paid plan to free when no stripe subscription id is present', () => {
    // The core spoofing case: a user doc with currentPlan: 'full_all' but no
    // real Stripe subscription backing it must not unlock unlimited AI.
    expect(resolveEffectivePlan('full_all', ACTIVE, undefined)).toBe('free');
    expect(resolveEffectivePlan('full_all', ACTIVE, '')).toBe('free');
    expect(resolveEffectivePlan('duo_2', ACTIVE, undefined)).toBe('free');
  });

  it('leaves the free plan as free regardless of other fields', () => {
    expect(resolveEffectivePlan('free', ACTIVE, SUB)).toBe('free');
    expect(resolveEffectivePlan('free', undefined, undefined)).toBe('free');
  });

  it('treats unknown / legacy plan ids as free', () => {
    expect(resolveEffectivePlan('mystery_plan', ACTIVE, SUB)).toBe('free');
    expect(resolveEffectivePlan(undefined, ACTIVE, SUB)).toBe('free');
  });
});

describe('Quota check logic', () => {
  // Simulate the quota check logic without Firestore
  function checkQuota(
    currentCount: number | undefined,
    limit: number | 'all'
  ): { allowed: boolean; remaining: number | 'unlimited' } {
    if (limit === 'all') {
      return { allowed: true, remaining: 'unlimited' };
    }
    const count = currentCount || 0;
    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: limit - count };
  }

  it('allows request when under free limit', () => {
    const result = checkQuota(5, 20);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(15);
  });

  it('allows request at exactly the limit boundary', () => {
    // count is the number already used; if count=19 and limit=20, one more is allowed
    const result = checkQuota(19, 20);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('blocks request when exactly at limit', () => {
    const result = checkQuota(20, 20);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('blocks request when over limit', () => {
    const result = checkQuota(25, 20);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('always allows for unlimited plan', () => {
    const result = checkQuota(9999, 'all');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe('unlimited');
  });

  it('allows first request for any plan', () => {
    const result = checkQuota(0, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1000);
  });

  it('allows when no prior usage', () => {
    const result = checkQuota(undefined, 20);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(20);
  });
});

/**
 * These exercise the real `checkAndIncrementUsage` against the actual
 * `getAdminDb` helper, which returns `null` in the test environment because
 * `FIREBASE_SERVICE_ACCOUNT_JSON` is not set. That hits the documented
 * fallback path in aiUsage.ts: "Admin DB not available (dev mode), allow".
 *
 * Per CLAUDE.md these quota-exceeded fallback paths previously had no
 * coverage — these tests pin them.
 */
describe('checkAndIncrementUsage — fallback paths', () => {
  it('returns allowed when admin DB is unavailable (dev mode)', async () => {
    const result = await checkAndIncrementUsage('user-abc', 'free', 'analyze', 100);
    expect(result.allowed).toBe(true);
    expect(result.planLimit).toBe(20);
    expect(result.remaining).toBe(20);
    expect(typeof result.resetDate).toBe('string');
  });

  it('reports plan limit reflecting the requested plan', async () => {
    const basic = await checkAndIncrementUsage('user-abc', 'basic_1', 'analyze', 100);
    expect(basic.planLimit).toBe(200);

    const duo = await checkAndIncrementUsage('user-abc', 'duo_2', 'analyze', 100);
    expect(duo.planLimit).toBe(1000);
  });

  it('unlimited plan reports "unlimited" remaining', async () => {
    const result = await checkAndIncrementUsage('user-abc', 'full_all', 'analyze', 100);
    expect(result.allowed).toBe(true);
    expect(result.planLimit).toBe('all');
    expect(result.remaining).toBe('unlimited');
  });

  it('unknown plan IDs are treated as free tier', async () => {
    const result = await checkAndIncrementUsage('user-abc', 'mystery_plan', 'analyze', 100);
    expect(result.allowed).toBe(true);
    expect(result.planLimit).toBe(20);
  });

  it('resetDate is always a future UTC midnight', async () => {
    const result = await checkAndIncrementUsage('user-abc', 'free', 'analyze', 100);
    const reset = new Date(result.resetDate);
    expect(reset.getTime()).toBeGreaterThan(Date.now());
    expect(reset.getUTCHours()).toBe(0);
    expect(reset.getUTCMinutes()).toBe(0);
  });
});
