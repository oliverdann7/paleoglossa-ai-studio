import { describe, it, expect } from 'vitest';
import {
  entitlementFromSubscriber,
  buildIapUserUpdate,
  uidsFromWebhookEvent,
} from '../revenueCat.js';
import {
  IAP_PRODUCT_IDS,
  planForIapProduct,
  bestPlanForIapProducts,
} from '../../../src/lib/constants/iapProducts.js';

const NOW = Date.parse('2026-12-01T00:00:00Z');
const future = '2027-01-01T00:00:00Z';
const past = '2026-11-01T00:00:00Z';

describe('IAP product ids', () => {
  it('maps every product back to its plan and cycle, and nothing else', () => {
    expect(planForIapProduct(IAP_PRODUCT_IDS.duo_2.yearly)).toEqual({
      planId: 'duo_2',
      cycle: 'yearly',
    });
    expect(planForIapProduct('com.someone.else.product')).toBeNull();
    expect(planForIapProduct(undefined)).toBeNull();
    const all = Object.values(IAP_PRODUCT_IDS).flatMap((c) => Object.values(c));
    expect(new Set(all).size).toBe(6);
  });

  it('picks the highest plan when two products are live (mid plan change)', () => {
    expect(
      bestPlanForIapProducts([IAP_PRODUCT_IDS.basic_1.monthly, IAP_PRODUCT_IDS.full_all.yearly])
    ).toBe('full_all');
    expect(bestPlanForIapProducts([])).toBeNull();
  });
});

describe('entitlementFromSubscriber', () => {
  it('grants the plan of an unexpired subscription', () => {
    expect(
      entitlementFromSubscriber(
        { subscriptions: { [IAP_PRODUCT_IDS.basic_1.monthly]: { expires_date: future } } },
        NOW
      )
    ).toEqual({ planId: 'basic_1', status: 'active' });
  });

  it('grants nothing once expired, refunded, or for unknown products', () => {
    expect(
      entitlementFromSubscriber(
        { subscriptions: { [IAP_PRODUCT_IDS.full_all.yearly]: { expires_date: past } } },
        NOW
      )
    ).toBeNull();
    expect(
      entitlementFromSubscriber(
        {
          subscriptions: {
            [IAP_PRODUCT_IDS.full_all.yearly]: { expires_date: future, refunded_at: past },
          },
        },
        NOW
      )
    ).toBeNull();
    expect(
      entitlementFromSubscriber({ subscriptions: { 'other.product': { expires_date: future } } }, NOW)
    ).toBeNull();
    expect(entitlementFromSubscriber({}, NOW)).toBeNull();
    expect(entitlementFromSubscriber(null, NOW)).toBeNull();
  });

  it('keeps access but flags past_due during a billing grace period', () => {
    expect(
      entitlementFromSubscriber(
        {
          subscriptions: {
            [IAP_PRODUCT_IDS.duo_2.monthly]: {
              expires_date: future,
              billing_issues_detected_at: past,
            },
          },
        },
        NOW
      )
    ).toEqual({ planId: 'duo_2', status: 'past_due' });
  });

  it('ignores an expired lower plan next to a live higher one', () => {
    expect(
      entitlementFromSubscriber(
        {
          subscriptions: {
            [IAP_PRODUCT_IDS.full_all.monthly]: { expires_date: past },
            [IAP_PRODUCT_IDS.basic_1.yearly]: { expires_date: future },
          },
        },
        NOW
      )
    ).toEqual({ planId: 'basic_1', status: 'active' });
  });
});

describe('buildIapUserUpdate', () => {
  const active = { planId: 'duo_2', status: 'active' } as const;

  it('sets the plan and default languages on a new plan', () => {
    expect(buildIapUserUpdate(active, { currentPlan: 'free' })).toEqual({
      currentPlan: 'duo_2',
      subscriptionStatus: 'active',
      subscriptionSource: 'app_store',
      selectedLanguageIds: ['grc'],
    });
  });

  it('does not reset chosen languages on a renewal of the same plan', () => {
    const update = buildIapUserUpdate(active, {
      currentPlan: 'duo_2',
      subscriptionSource: 'app_store',
    });
    expect(update).not.toHaveProperty('selectedLanguageIds');
    expect(update).toMatchObject({ currentPlan: 'duo_2', subscriptionStatus: 'active' });
  });

  it('downgrades an App Store subscriber whose subscription ended', () => {
    expect(
      buildIapUserUpdate(null, { currentPlan: 'duo_2', subscriptionSource: 'app_store' })
    ).toEqual({ currentPlan: 'free', subscriptionStatus: 'canceled' });
  });

  it('never downgrades a web (Stripe) subscriber for lacking an App Store purchase', () => {
    expect(buildIapUserUpdate(null, { currentPlan: 'full_all' })).toBeNull();
    expect(
      buildIapUserUpdate(null, { currentPlan: 'full_all', subscriptionSource: 'stripe' })
    ).toBeNull();
    expect(buildIapUserUpdate(null, undefined)).toBeNull();
  });
});

describe('uidsFromWebhookEvent', () => {
  it('collects real uids and drops anonymous ids and junk', () => {
    expect(
      uidsFromWebhookEvent({
        app_user_id: 'uidA',
        original_app_user_id: '$RCAnonymousID:abc',
        aliases: ['uidA', '$RCAnonymousID:abc', 42],
      })
    ).toEqual(['uidA']);
  });

  it('covers both sides of a transfer', () => {
    expect(
      uidsFromWebhookEvent({ type: 'TRANSFER', transferred_from: ['old'], transferred_to: ['new'] })
    ).toEqual(['old', 'new']);
  });

  it('is empty for a malformed body', () => {
    expect(uidsFromWebhookEvent(undefined)).toEqual([]);
    expect(uidsFromWebhookEvent({})).toEqual([]);
  });
});
