import { describe, it, expect, vi, afterEach } from 'vitest';
import { logSilentFailure } from '../logSilent';

describe('logSilentFailure', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs an Error message with the [silent] prefix and context', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logSilentFailure('Review.awardXP', new Error('network down'));
    expect(spy).toHaveBeenCalledWith('[silent] Review.awardXP:', 'network down');
  });

  it('stringifies non-Error values', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logSilentFailure('ctx', 'plain string');
    expect(spy).toHaveBeenCalledWith('[silent] ctx:', 'plain string');
  });

  it('does not throw on null/undefined', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => logSilentFailure('ctx', undefined)).not.toThrow();
    expect(() => logSilentFailure('ctx', null)).not.toThrow();
  });
});
