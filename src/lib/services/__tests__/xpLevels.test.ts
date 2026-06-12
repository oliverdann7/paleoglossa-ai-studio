/**
 * XP level ladder — the first level-up must be reachable in session one
 * (roadmap § 11, 1.5).
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  increment: vi.fn(),
}));

import { getLevelForXP, getNextLevel, XP_LEVELS, XP_REWARDS } from '../xpService.js';

describe('XP levels', () => {
  it('keeps thresholds strictly increasing from zero', () => {
    expect(XP_LEVELS[0].threshold).toBe(0);
    for (let i = 1; i < XP_LEVELS.length; i++) {
      expect(XP_LEVELS[i].threshold).toBeGreaterThan(XP_LEVELS[i - 1].threshold);
    }
  });

  it('resolves the level boundaries around the first level-up', () => {
    expect(getLevelForXP(0).name).toBe('Novice');
    expect(getLevelForXP(99).name).toBe('Novice');
    expect(getLevelForXP(100).name).toBe('Initiate');
    expect(getLevelForXP(499).name).toBe('Initiate');
    expect(getLevelForXP(500).name).toBe('Apprentice');
  });

  it('makes the first level-up reachable within one modest session', () => {
    // A 50-word read plus ten review cards must cross the first threshold.
    const sessionXP = 50 * XP_REWARDS.wordRead + 10 * XP_REWARDS.reviewCard;
    const firstThreshold = XP_LEVELS[1].threshold;
    expect(sessionXP).toBeGreaterThanOrEqual(firstThreshold);
  });

  it('reports the next level from the new tier correctly', () => {
    const initiate = getLevelForXP(150);
    expect(getNextLevel(initiate.index)?.name).toBe('Apprentice');
  });
});
