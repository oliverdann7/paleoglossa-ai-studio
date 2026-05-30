import { describe, expect, it } from 'vitest';
import {
  canTransition,
  learnerCancelRefund,
  tutorCancelRefund,
} from '../bookingPolicy.js';

describe('booking state machine', () => {
  it('allows the happy path pending → confirmed → completed', () => {
    expect(canTransition('pending_payment', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'completed')).toBe(true);
  });
  it('rejects illegal transitions', () => {
    expect(canTransition('completed', 'pending_payment')).toBe(false);
    expect(canTransition('refunded', 'confirmed')).toBe(false);
    expect(canTransition('pending_payment', 'completed')).toBe(false);
  });
  it('allows cancellations from active states', () => {
    expect(canTransition('confirmed', 'cancelled_by_learner')).toBe(true);
    expect(canTransition('confirmed', 'cancelled_by_tutor')).toBe(true);
    expect(canTransition('pending_payment', 'cancelled_by_learner')).toBe(true);
  });
});

describe('learnerCancelRefund', () => {
  const HR = 60 * 60 * 1000;
  it('refunds in full outside the window', () => {
    const r = learnerCancelRefund({
      startMs: Date.now() + 48 * HR,
      nowMs: Date.now(),
      priceCents: 6000,
      windowHours: 24,
    });
    expect(r.refundCents).toBe(6000);
    expect(r.reason).toBe('outside_window');
  });
  it('zero refund inside the window', () => {
    const r = learnerCancelRefund({
      startMs: Date.now() + 2 * HR,
      nowMs: Date.now(),
      priceCents: 6000,
      windowHours: 24,
    });
    expect(r.refundCents).toBe(0);
    expect(r.reason).toBe('within_window');
  });
});

describe('tutorCancelRefund', () => {
  it('always refunds in full', () => {
    expect(tutorCancelRefund(7500).refundCents).toBe(7500);
  });
});
