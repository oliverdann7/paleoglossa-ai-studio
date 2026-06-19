import { describe, it, expect, beforeEach } from 'vitest';
import {
  KNOWN_WORD_MILESTONES,
  nextReachedMilestone,
  checkKnownWordMilestone,
  resetKnownWordMilestones,
} from '../milestoneService';

/**
 * Known-word laurels (roadmap § 11, 3.5). These lock in the once-per-language
 * celebration contract: each threshold fires exactly once, big jumps collapse
 * to a single laurel, and re-crossing after a dip stays silent.
 */
describe('nextReachedMilestone (pure)', () => {
  it('returns null below the first threshold', () => {
    expect(nextReachedMilestone(49, 0)).toBeNull();
  });

  it('returns the threshold exactly when reached', () => {
    expect(nextReachedMilestone(50, 0)).toBe(50);
    expect(nextReachedMilestone(100, 50)).toBe(100);
    expect(nextReachedMilestone(1000, 500)).toBe(1000);
  });

  it('returns only the highest crossed when several are jumped at once', () => {
    expect(nextReachedMilestone(1200, 0)).toBe(1000);
    expect(nextReachedMilestone(600, 50)).toBe(500);
  });

  it('returns null when the count has not advanced past what was celebrated', () => {
    expect(nextReachedMilestone(120, 100)).toBeNull();
    expect(nextReachedMilestone(80, 100)).toBeNull();
  });
});

describe('checkKnownWordMilestone (stateful)', () => {
  beforeEach(() => resetKnownWordMilestones());

  it('celebrates a milestone once, then stays silent on re-check', () => {
    expect(checkKnownWordMilestone('grc', 50)).toBe(50);
    expect(checkKnownWordMilestone('grc', 51)).toBeNull();
    expect(checkKnownWordMilestone('grc', 99)).toBeNull();
    expect(checkKnownWordMilestone('grc', 100)).toBe(100);
  });

  it('tracks milestones independently per language', () => {
    expect(checkKnownWordMilestone('grc', 50)).toBe(50);
    expect(checkKnownWordMilestone('lat', 50)).toBe(50);
    expect(checkKnownWordMilestone('grc', 50)).toBeNull();
  });

  it('does not re-fire after the count dips and recovers', () => {
    expect(checkKnownWordMilestone('hbo', 100)).toBe(100);
    expect(checkKnownWordMilestone('hbo', 80)).toBeNull();
    expect(checkKnownWordMilestone('hbo', 120)).toBeNull();
  });

  it('ignores an empty language id', () => {
    expect(checkKnownWordMilestone('', 1000)).toBeNull();
  });

  it('exposes the four documented thresholds', () => {
    expect([...KNOWN_WORD_MILESTONES]).toEqual([50, 100, 500, 1000]);
  });
});
