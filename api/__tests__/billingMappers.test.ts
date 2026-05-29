import { describe, it, expect } from 'vitest';
import {
  mapStripeStatusToInternal,
  planIdFromPriceId,
  languagesForPlan,
} from '../_lib/billingMappers';

describe('mapStripeStatusToInternal', () => {
  it('active stays active', () => {
    expect(mapStripeStatusToInternal('active')).toBe('active');
  });

  it('trialing is treated as active (user has full access)', () => {
    expect(mapStripeStatusToInternal('trialing')).toBe('active');
  });

  it('past_due is past_due', () => {
    expect(mapStripeStatusToInternal('past_due')).toBe('past_due');
  });

  it('canceled maps to canceled', () => {
    expect(mapStripeStatusToInternal('canceled')).toBe('canceled');
  });

  it('unpaid maps to canceled (access revoked)', () => {
    expect(mapStripeStatusToInternal('unpaid')).toBe('canceled');
  });

  it('unknown statuses fall back to past_due, not active', () => {
    // Important guarantee: never accidentally treat an unknown future Stripe
    // status as a free pass to all paid features.
    expect(mapStripeStatusToInternal('incomplete')).toBe('past_due');
    expect(mapStripeStatusToInternal('incomplete_expired')).toBe('past_due');
    expect(mapStripeStatusToInternal('paused')).toBe('past_due');
    expect(mapStripeStatusToInternal('')).toBe('past_due');
  });
});

describe('planIdFromPriceId', () => {
  const priceMap = {
    basic_1: { monthly: 'price_basic_m', yearly: 'price_basic_y' },
    duo_2: { monthly: 'price_duo_m', yearly: 'price_duo_y' },
    full_all: { monthly: 'price_full_m', yearly: 'price_full_y' },
  };

  it('resolves a monthly price to its plan', () => {
    expect(planIdFromPriceId('price_duo_m', priceMap)).toBe('duo_2');
  });

  it('resolves a yearly price to its plan', () => {
    expect(planIdFromPriceId('price_full_y', priceMap)).toBe('full_all');
  });

  it('unknown price IDs fall back to basic_1', () => {
    expect(planIdFromPriceId('price_nonexistent', priceMap)).toBe('basic_1');
  });

  it('undefined priceId falls back to basic_1', () => {
    expect(planIdFromPriceId(undefined, priceMap)).toBe('basic_1');
  });

  it('skips plans whose price IDs are undefined (env var unset)', () => {
    const sparseMap = {
      basic_1: { monthly: undefined, yearly: 'price_basic_y' },
      duo_2: { monthly: 'price_duo_m' },
    };
    expect(planIdFromPriceId(undefined, sparseMap)).toBe('basic_1');
    expect(planIdFromPriceId('price_duo_m', sparseMap)).toBe('duo_2');
  });
});

describe('languagesForPlan', () => {
  it('full_all unlocks every supported language', () => {
    const langs = languagesForPlan('full_all');
    expect(langs).toContain('grc');
    expect(langs).toContain('hbo');
    expect(langs).toContain('lat');
    expect(langs.length).toBeGreaterThanOrEqual(11);
  });

  it('paid sub-plans start with Ancient Greek only', () => {
    expect(languagesForPlan('basic_1')).toEqual(['grc']);
    expect(languagesForPlan('duo_2')).toEqual(['grc']);
  });

  it('returns a fresh array each call (caller may mutate)', () => {
    const a = languagesForPlan('full_all');
    const b = languagesForPlan('full_all');
    expect(a).not.toBe(b);
  });
});
