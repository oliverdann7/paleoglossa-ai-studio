import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { shouldSuppressError, reportBouncedError, clearRecentErrors } from '../saveErrorBouncer.js';

describe('saveErrorBouncer', () => {
  beforeEach(() => {
    clearRecentErrors();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not suppress first error in a category', () => {
    const result = reportBouncedError('vocabulary', new Error('First failure'));
    expect(result.suppressed).toBe(false);
    expect(result.info.code).toBe('UNKNOWN');
  });

  it('suppresses repeated errors in same category within throttle window', () => {
    reportBouncedError('vocabulary', new Error('First failure'));
    const result = reportBouncedError('vocabulary', new Error('Second failure'));
    expect(result.suppressed).toBe(true);
  });

  it('does not suppress errors in different categories', () => {
    reportBouncedError('vocabulary', new Error('Vocab failure'));
    const result = reportBouncedError('stats', new Error('Stats failure'));
    expect(result.suppressed).toBe(false);
  });

  it('allows errors after throttle window expires', () => {
    reportBouncedError('vocabulary', new Error('First failure'));
    vi.advanceTimersByTime(8001);
    const result = reportBouncedError('vocabulary', new Error('Later failure'));
    expect(result.suppressed).toBe(false);
  });

  it('returns last message for suppressed errors', () => {
    reportBouncedError('vocabulary', new Error('First failure'));
    const result = reportBouncedError('vocabulary', new Error('Second failure'));
    expect(result.suppressed).toBe(true);
    expect(result.info.userMessage).toBe('Could not save to cloud.');
  });

  it('classifies error code in bounce result', () => {
    const err = { code: 'permission-denied', message: 'No permission' };
    const result = reportBouncedError('import', err);
    expect(result.info.code).toBe('PERMISSION_DENIED');
    expect(result.suppressed).toBe(false);
  });

  it('shouldSuppressError returns false for unreported category', () => {
    expect(shouldSuppressError('review')).toBe(false);
  });

  it('shouldSuppressError returns true for recently errored category', () => {
    reportBouncedError('settings', new Error('Failure'));
    expect(shouldSuppressError('settings')).toBe(true);
  });

  it('clearRecentErrors clears a specific category', () => {
    reportBouncedError('vocabulary', new Error('Failure'));
    reportBouncedError('stats', new Error('Failure'));
    clearRecentErrors('vocabulary');
    expect(shouldSuppressError('vocabulary')).toBe(false);
    expect(shouldSuppressError('stats')).toBe(true);
  });

  it('clearRecentErrors clears all categories', () => {
    reportBouncedError('vocabulary', new Error('Failure'));
    reportBouncedError('stats', new Error('Failure'));
    clearRecentErrors();
    expect(shouldSuppressError('vocabulary')).toBe(false);
    expect(shouldSuppressError('stats')).toBe(false);
  });
});
