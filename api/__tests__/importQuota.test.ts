import { describe, it, expect } from 'vitest';
import { evaluateImportQuota } from '../_lib/importQuota.js';

describe('evaluateImportQuota', () => {
  it('allows free users under the 5-import limit', () => {
    expect(evaluateImportQuota('free', 0)).toEqual({
      allowed: true,
      used: 0,
      limit: 5,
      remaining: 5,
    });
    expect(evaluateImportQuota('free', 4)).toEqual({
      allowed: true,
      used: 4,
      limit: 5,
      remaining: 1,
    });
  });

  it('blocks free users at the limit', () => {
    expect(evaluateImportQuota('free', 5)).toEqual({
      allowed: false,
      used: 5,
      limit: 5,
      remaining: 0,
    });
  });

  it('blocks users over the limit with remaining clamped to 0', () => {
    expect(evaluateImportQuota('free', 12)).toEqual({
      allowed: false,
      used: 12,
      limit: 5,
      remaining: 0,
    });
  });

  it('enforces paid-tier limits (basic 50, duo 200)', () => {
    expect(evaluateImportQuota('basic_1', 49).allowed).toBe(true);
    expect(evaluateImportQuota('basic_1', 50).allowed).toBe(false);
    expect(evaluateImportQuota('duo_2', 199).allowed).toBe(true);
    expect(evaluateImportQuota('duo_2', 200).allowed).toBe(false);
  });

  it('never blocks the unlimited plan', () => {
    expect(evaluateImportQuota('full_all', 10_000)).toEqual({
      allowed: true,
      used: 10_000,
      limit: 'all',
      remaining: 'unlimited',
    });
  });

  it('treats unknown plan ids as free', () => {
    expect(evaluateImportQuota('hacked_plan', 5).allowed).toBe(false);
    expect(evaluateImportQuota('', 0).limit).toBe(5);
  });
});
