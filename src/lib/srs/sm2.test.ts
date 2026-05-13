import { describe, it, expect } from 'vitest';
import { calculateSM2, SRSState } from './sm2';

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
    const existing: SRSState = {
      interval: 10, ease: 2.5, step: 3,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
    };
    const state = calculateSM2('GOOD', existing, new Date());
    expect(state.interval).toBe(25);
    expect(state.step).toBe(4);
  });

  it('existing card with AGAIN rating resets interval and reduces ease', () => {
    const existing: SRSState = {
      interval: 10, ease: 2.5, step: 3,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
    };
    const state = calculateSM2('AGAIN', existing, new Date());
    expect(state.interval).toBe(1);
    expect(state.step).toBe(0);
    expect(state.ease).toBeLessThan(2.5);
  });
});
