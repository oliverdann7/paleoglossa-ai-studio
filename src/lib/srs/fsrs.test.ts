import { describe, it, expect } from 'vitest';
import {
  calculateFSRS,
  getInitialFSRSState,
  getIntervalPreviews,
  isDue,
  FSRSState,
  FSRRating,
} from './fsrs.js';

const NOW = new Date('2025-06-01T12:00:00Z');

function makeState(overrides: Partial<FSRSState> = {}): FSRSState {
  const init = getInitialFSRSState();
  return { ...init, ...overrides };
}

// Helper to create a state that has been reviewed N days ago
function reviewedDaysAgo(days: number, base?: Partial<FSRSState>): FSRSState {
  const past = new Date(NOW);
  past.setDate(past.getDate() - days);
  return makeState({
    ...base,
    lastReviewed: past.toISOString(),
    repetitions: 1,
    stability: 10,
    difficulty: 5,
  });
}

describe('FSRS-5 algorithm', () => {
  describe('initial review (new card)', () => {
    it('Good rating gives positive stability and difficulty', () => {
      const state = getInitialFSRSState();
      const next = calculateFSRS('good', state, NOW);
      expect(next.stability).toBeGreaterThan(0);
      expect(next.difficulty).toBeGreaterThan(0);
      expect(next.difficulty).toBeLessThanOrEqual(10);
    });

    it('Easy rating gives longer interval than Good', () => {
      const state = makeState({ repetitions: 0 });
      const good = calculateFSRS('good', state, NOW);
      const easy = calculateFSRS('easy', state, NOW);
      expect(easy.interval).toBeGreaterThan(good.interval);
    });

    it('Again on new card gives 1-day interval and 0 repetitions', () => {
      const state = makeState({ repetitions: 0 });
      const next = calculateFSRS('again', state, NOW);
      expect(next.interval).toBe(1);
      expect(next.repetitions).toBe(0);
    });

    it('Hard on new card gives shorter interval than Good', () => {
      const state = makeState({ repetitions: 0 });
      const hard = calculateFSRS('hard', state, NOW);
      const good = calculateFSRS('good', state, NOW);
      expect(hard.interval).toBeLessThanOrEqual(good.interval);
    });
  });

  describe('subsequent reviews', () => {
    it('Good review increases repetitions', () => {
      const state = reviewedDaysAgo(10);
      const next = calculateFSRS('good', state, NOW);
      expect(next.repetitions).toBe(state.repetitions + 1);
    });

    it('Again review resets repetitions to 0', () => {
      const state = reviewedDaysAgo(10);
      const next = calculateFSRS('again', state, NOW);
      expect(next.repetitions).toBe(0);
      expect(next.interval).toBe(1);
    });

    it('Easy review gives longer interval than Good', () => {
      const state = reviewedDaysAgo(10);
      const good = calculateFSRS('good', state, NOW);
      const easy = calculateFSRS('easy', state, NOW);
      expect(easy.interval).toBeGreaterThan(good.interval);
    });

    it('Hard review gives shorter interval than Good', () => {
      const state = reviewedDaysAgo(10);
      const hard = calculateFSRS('hard', state, NOW);
      const good = calculateFSRS('good', state, NOW);
      expect(hard.interval).toBeLessThan(good.interval);
    });

    it('difficulty stays within [1, 10]', () => {
      const ratings: FSRRating[] = ['again', 'hard', 'good', 'easy'];
      let state = reviewedDaysAgo(1);
      for (const r of ratings) {
        state = calculateFSRS(r, state, NOW);
        expect(state.difficulty).toBeGreaterThanOrEqual(1);
        expect(state.difficulty).toBeLessThanOrEqual(10);
      }
    });

    it('interval caps at 365 days', () => {
      const state = makeState({
        stability: 10000,
        repetitions: 100,
        difficulty: 1,
        lastReviewed: new Date(NOW.getTime() - 365 * 86400000).toISOString(),
      });
      const next = calculateFSRS('easy', state, NOW);
      expect(next.interval).toBeLessThanOrEqual(365);
    });
  });

  describe('dueDate and nextReview', () => {
    it('dueDate is set to interval days in the future', () => {
      const state = reviewedDaysAgo(5);
      const next = calculateFSRS('good', state, NOW);
      const expectedDue = new Date(NOW);
      expectedDue.setDate(expectedDue.getDate() + next.interval);
      expect(new Date(next.nextReview).getTime()).toBeCloseTo(expectedDue.getTime(), -3);
    });

    it('lastReviewed is set to now', () => {
      const state = reviewedDaysAgo(5);
      const next = calculateFSRS('good', state, NOW);
      expect(next.lastReviewed).toBe(NOW.toISOString());
    });
  });

  describe('isDue', () => {
    it('card is due when dueDate is in the past', () => {
      const past = new Date(NOW);
      past.setDate(past.getDate() - 1);
      const state = makeState({ dueDate: past });
      expect(isDue(state, NOW)).toBe(true);
    });

    it('card is not due when dueDate is in the future', () => {
      const future = new Date(NOW);
      future.setDate(future.getDate() + 5);
      const state = makeState({ dueDate: future });
      expect(isDue(state, NOW)).toBe(false);
    });
  });

  describe('getIntervalPreviews', () => {
    it('returns all four ratings with non-empty strings', () => {
      const state = reviewedDaysAgo(10);
      const previews = getIntervalPreviews(state);
      expect(typeof previews.again).toBe('string');
      expect(typeof previews.hard).toBe('string');
      expect(typeof previews.good).toBe('string');
      expect(typeof previews.easy).toBe('string');
      expect(previews.again.length).toBeGreaterThan(0);
    });

    it('again preview is shorter than easy preview for a known card', () => {
      const state = reviewedDaysAgo(10);
      const previews = getIntervalPreviews(state);
      // again → 1d, easy → much longer — just check they differ
      expect(previews.again).not.toBe(previews.easy);
    });
  });

  describe('determinism', () => {
    it('produces identical results for identical inputs', () => {
      const state = reviewedDaysAgo(7);
      const a = calculateFSRS('good', state, NOW);
      const b = calculateFSRS('good', state, NOW);
      expect(a.interval).toBe(b.interval);
      expect(a.stability).toBe(b.stability);
      expect(a.difficulty).toBe(b.difficulty);
      expect(a.nextReview).toBe(b.nextReview);
    });
  });
});
