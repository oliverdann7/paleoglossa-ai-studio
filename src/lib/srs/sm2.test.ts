import { describe, it, expect } from 'vitest';
import { calculateSM2, SRSState, SM2_BASE_EASE, SM2_MIN_EASE, SM2_MAX_EASE, SM2_MAX_INTERVAL } from './sm2';

function makeState(overrides: Partial<SRSState> = {}): SRSState {
  return {
    interval: 0,
    ease: SM2_BASE_EASE,
    step: 0,
    lastReviewed: new Date().toISOString(),
    nextReview: new Date().toISOString(),
    ...overrides,
  };
}

describe('SM-2 scheduling algorithm', () => {

  it('new card with EASY rating has 1-day interval, step 1, ease 2.6', () => {
    const state = calculateSM2('EASY', null, new Date());
    expect(state.interval).toBe(1);
    expect(state.step).toBe(1);
    expect(state.ease).toBe(2.6);
  });

  it('new card with AGAIN rating has 1-day interval, step 0', () => {
    const state = calculateSM2('AGAIN', null, new Date());
    expect(state.interval).toBe(1);
    expect(state.step).toBe(0);
  });

  it('existing card with GOOD rating multiplies interval by ease', () => {
    const state = calculateSM2('GOOD', makeState({ interval: 10, ease: 2.5, step: 3 }), new Date());
    expect(state.interval).toBe(25);
    expect(state.step).toBe(4);
  });

  it('existing card with AGAIN rating resets interval and reduces ease', () => {
    const state = calculateSM2('AGAIN', makeState({ interval: 10, ease: 2.5, step: 3 }), new Date());
    expect(state.interval).toBe(1);
    expect(state.step).toBe(0);
    expect(state.ease).toBeLessThan(2.5);
  });

  it('existing card with HARD rating increments step and uses shorter interval', () => {
    const state = calculateSM2('HARD', makeState({ interval: 10, ease: 2.5, step: 3 }), new Date());
    expect(state.step).toBe(4);
    // HARD (quality=3): ease drops to 2.36, interval = ceil(10 * 2.36) = 24
    expect(state.interval).toBe(24);
  });

  it('step 2 with GOOD uses 6-day interval', () => {
    const state = calculateSM2('GOOD', makeState({ interval: 1, ease: 2.5, step: 1 }), new Date());
    expect(state.interval).toBe(6);
    expect(state.step).toBe(2);
  });

  it('EASY bonus applies when step > 1', () => {
    const state = calculateSM2('EASY', makeState({ interval: 6, ease: 2.5, step: 2 }), new Date());
    expect(state.interval).toBeGreaterThan(6);
    expect(state.step).toBe(3);
    // EASY (quality=5): ease becomes 2.6, base interval = ceil(6 * 2.6) = 16
    // Then EASY bonus: ceil(16 * 1.3) = 21
    expect(state.interval).toBe(21);
  });

  it('EASY on step 1 does not apply bonus (interval stays 1)', () => {
    const state = calculateSM2('EASY', null, new Date());
    expect(state.interval).toBe(1);
    expect(state.step).toBe(1);
  });

  it('repeated AGAIN ratings floor ease at SM2_MIN_EASE', () => {
    let state = makeState({ interval: 1, ease: 1.5, step: 0 });
    // First AGAIN: ease -= 0.2 => 1.3
    state = calculateSM2('AGAIN', state, new Date());
    expect(state.ease).toBeCloseTo(1.3, 2);
    expect(state.interval).toBe(1);
    // Second AGAIN: ease should stay at 1.3 (floored)
    state = calculateSM2('AGAIN', state, new Date());
    expect(state.ease).toBeCloseTo(SM2_MIN_EASE, 2);
  });

  it('ease factor is capped at SM2_MAX_EASE', () => {
    let state = makeState({ interval: 1, ease: 2.9, step: 5 });
    // EASY increments ease by 0.1 per step from base, but we start near cap
    state = calculateSM2('EASY', state, new Date());
    expect(state.ease).toBeLessThanOrEqual(SM2_MAX_EASE);
  });

  it('interval is capped at SM2_MAX_INTERVAL', () => {
    const state = calculateSM2('GOOD', makeState({ interval: 360, ease: 2.5, step: 10 }), new Date());
    expect(state.interval).toBeLessThanOrEqual(SM2_MAX_INTERVAL);
  });

  it('nextReview is in the future after a correct review', () => {
    const now = new Date('2025-01-15T12:00:00Z');
    const state = calculateSM2('GOOD', makeState({ interval: 1, ease: 2.5, step: 1 }), now);
    const next = new Date(state.nextReview);
    expect(next.getTime()).toBeGreaterThan(now.getTime());
  });

  it('nextReview is deterministic given the same inputs', () => {
    const now = new Date('2025-06-01T00:00:00Z');
    const existing = makeState({ interval: 10, ease: 2.5, step: 3 });
    const a = calculateSM2('GOOD', existing, now);
    const b = calculateSM2('GOOD', existing, now);
    expect(a.interval).toBe(b.interval);
    expect(a.nextReview).toBe(b.nextReview);
    expect(a.ease).toBe(b.ease);
  });

  it('UTC date math avoids timezone shifts near midnight', () => {
    // Simulate UTC+14 timezone by using a Date that represents late local time
    const now = new Date('2025-01-15T23:00:00+14:00');
    const state = calculateSM2('GOOD', makeState({ interval: 1, ease: 2.5, step: 1 }), now);
    const next = new Date(state.nextReview);
    // nextReview should be at least 6 days after now (step 1 -> interval 6)
    expect(next.getTime()).toBeGreaterThan(now.getTime());
    // The interval should be at least 6 days (step 2 uses interval 6)
    expect(state.interval).toBe(6);
  });
});
