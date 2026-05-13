import { describe, it, expect } from 'vitest';
import { canAccessLanguage, canAddLanguage, getPlanById } from '../plans';
import type { PlanId } from '../plans';

describe('Plan language limits', () => {

  it('free user can access one selected language', () => {
    const selected = ['grc'];
    expect(canAccessLanguage('free', 'grc', selected)).toBe(true);
    expect(canAccessLanguage('free', 'hbo', selected)).toBe(false);
    expect(canAccessLanguage('free', 'lat', selected)).toBe(false);
  });

  it('basic_1 user can access one selected language', () => {
    const selected = ['lat'];
    expect(canAccessLanguage('basic_1', 'lat', selected)).toBe(true);
    expect(canAccessLanguage('basic_1', 'grc', selected)).toBe(false);
    expect(canAccessLanguage('basic_1', 'hbo', selected)).toBe(false);
  });

  it('duo_2 user can access two selected languages', () => {
    const selected = ['grc', 'hbo'];
    expect(canAccessLanguage('duo_2', 'grc', selected)).toBe(true);
    expect(canAccessLanguage('duo_2', 'hbo', selected)).toBe(true);
    expect(canAccessLanguage('duo_2', 'lat', selected)).toBe(false);
  });

  it('full_all user can access all languages', () => {
    const selected = ['grc', 'hbo', 'lat'];
    expect(canAccessLanguage('full_all', 'grc', selected)).toBe(true);
    expect(canAccessLanguage('full_all', 'hbo', selected)).toBe(true);
    expect(canAccessLanguage('full_all', 'lat', selected)).toBe(true);
    expect(canAccessLanguage('full_all', 'san', selected)).toBe(true);
    expect(canAccessLanguage('full_all', 'egy', selected)).toBe(true);
    expect(canAccessLanguage('full_all', 'akk', selected)).toBe(true);
  });

  it('admin bypass (represented by full_all plan with all languages)', () => {
    // Admin is handled at the SubscriptionContext level via hasTrialAccess.
    // The plan function itself works on plan rules — admin gets full_all semantics.
    const selected = ['grc'];
    expect(canAccessLanguage('full_all', 'hbo', selected)).toBe(true);
    expect(canAccessLanguage('full_all', 'lat', selected)).toBe(true);
  });
});

describe('canAddLanguage', () => {

  it('free user cannot add beyond 1 language', () => {
    expect(canAddLanguage('free', ['grc'])).toBe(false);
    expect(canAddLanguage('free', [])).toBe(true);
  });

  it('basic_1 user cannot add beyond 1 language', () => {
    expect(canAddLanguage('basic_1', ['grc'])).toBe(false);
    expect(canAddLanguage('basic_1', [])).toBe(true);
  });

  it('duo_2 user can add up to 2 languages', () => {
    expect(canAddLanguage('duo_2', ['grc'])).toBe(true);
    expect(canAddLanguage('duo_2', ['grc', 'hbo'])).toBe(false);
    expect(canAddLanguage('duo_2', [])).toBe(true);
  });

  it('full_all user can always add languages', () => {
    expect(canAddLanguage('full_all', ['grc', 'hbo', 'lat', 'san'])).toBe(true);
    expect(canAddLanguage('full_all', [])).toBe(true);
  });
});

describe('getPlanById', () => {

  it('returns plan for all valid PlanId values', () => {
    const ids: PlanId[] = ['free', 'basic_1', 'duo_2', 'full_all'];
    for (const id of ids) {
      const plan = getPlanById(id);
      expect(plan.id).toBe(id);
      expect(plan.name).toBeTruthy();
    }
  });

  it('defaults to free for unknown plan IDs', () => {
    const plan = getPlanById('unknown' as PlanId);
    expect(plan.id).toBe('free');
  });
});
