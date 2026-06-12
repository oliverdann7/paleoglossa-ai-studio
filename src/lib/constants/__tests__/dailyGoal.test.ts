import { describe, it, expect } from 'vitest';
import {
  commitmentToDailyGoalWords,
  MIN_DAILY_GOAL_WORDS,
  MAX_DAILY_GOAL_WORDS,
} from '../dailyGoal.js';

describe('commitmentToDailyGoalWords', () => {
  it('maps the four onboarding commitments to reachable word goals', () => {
    expect(commitmentToDailyGoalWords(5)).toBe(25);
    expect(commitmentToDailyGoalWords(10)).toBe(50);
    expect(commitmentToDailyGoalWords(20)).toBe(100);
    expect(commitmentToDailyGoalWords(60)).toBe(300);
  });

  it('falls back to 50 when the commitment is missing or invalid', () => {
    expect(commitmentToDailyGoalWords(undefined)).toBe(50);
    expect(commitmentToDailyGoalWords(0)).toBe(50);
    expect(commitmentToDailyGoalWords(-5)).toBe(50);
  });

  it('clamps extreme commitments to the goal bounds', () => {
    expect(commitmentToDailyGoalWords(1)).toBe(MIN_DAILY_GOAL_WORDS);
    expect(commitmentToDailyGoalWords(500)).toBe(MAX_DAILY_GOAL_WORDS);
  });
});
