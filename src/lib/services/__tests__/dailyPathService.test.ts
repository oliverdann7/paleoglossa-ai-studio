import { describe, it, expect } from 'vitest';
import { buildDailyPath, isReadToday } from '../dailyPathService.js';
import type { DailyPathInput } from '../dailyPathService.js';

const BASE: DailyPathInput = {
  languageId: 'grc',
  languageName: 'Ancient Greek',
  writingSystem: 'Greek Alphabet',
  hasScriptLearning: true,
  dailyCommitment: 15,
  tierId: 'know-nothing',
  scriptOpened: false,
  dueReviewCount: 0,
  recommendedTextId: 'Jn-1',
  recommendedTextTitle: 'John 1',
  readToday: false,
};

describe('buildDailyPath', () => {
  it('returns empty array when languageId is empty', () => {
    const result = buildDailyPath({ ...BASE, languageId: '' });
    expect(result).toHaveLength(0);
  });

  it('includes script drill when hasScriptLearning and scriptOpened is false', () => {
    const result = buildDailyPath({ ...BASE, hasScriptLearning: true, scriptOpened: false });
    const script = result.find((i) => i.type === 'script');
    expect(script).toBeDefined();
    expect(script!.done).toBe(false);
    expect(script!.link).toBe('/app/language/grc/script-lab');
    expect(script!.title).toContain('Greek Alphabet');
  });

  it('omits script drill when scriptOpened is true', () => {
    const result = buildDailyPath({ ...BASE, scriptOpened: true });
    expect(result.find((i) => i.type === 'script')).toBeUndefined();
  });

  it('omits script drill when hasScriptLearning is false', () => {
    const result = buildDailyPath({ ...BASE, hasScriptLearning: false, scriptOpened: false });
    expect(result.find((i) => i.type === 'script')).toBeUndefined();
  });

  it('includes reading bite when recommendedTextId is set', () => {
    const result = buildDailyPath(BASE);
    const reading = result.find((i) => i.type === 'reading');
    expect(reading).toBeDefined();
    expect(reading!.title).toBe('John 1');
    expect(reading!.link).toBe('/app/reader/Jn-1');
  });

  it('reading bite is done when readToday is true', () => {
    const result = buildDailyPath({ ...BASE, readToday: true });
    const reading = result.find((i) => i.type === 'reading');
    expect(reading!.done).toBe(true);
  });

  it('omits reading bite when recommendedTextId is null', () => {
    const result = buildDailyPath({ ...BASE, recommendedTextId: null, recommendedTextTitle: null });
    expect(result.find((i) => i.type === 'reading')).toBeUndefined();
  });

  it('includes review item when dueReviewCount > 0', () => {
    const result = buildDailyPath({ ...BASE, dueReviewCount: 10 });
    const review = result.find((i) => i.type === 'review');
    expect(review).toBeDefined();
    expect(review!.title).toContain('10');
    expect(review!.link).toBe('/app/review');
    expect(review!.done).toBe(false);
  });

  it('omits review item when dueReviewCount is 0', () => {
    const result = buildDailyPath({ ...BASE, dueReviewCount: 0 });
    expect(result.find((i) => i.type === 'review')).toBeUndefined();
  });

  it('orders items: script → reading → review', () => {
    const result = buildDailyPath({ ...BASE, dueReviewCount: 5 });
    const types = result.map((i) => i.type);
    const scriptIdx = types.indexOf('script');
    const readingIdx = types.indexOf('reading');
    const reviewIdx = types.indexOf('review');
    expect(scriptIdx).toBeLessThan(readingIdx);
    expect(readingIdx).toBeLessThan(reviewIdx);
  });

  it('with all milestones done and no reviews, returns only reading item', () => {
    const result = buildDailyPath({
      ...BASE,
      scriptOpened: true,
      dueReviewCount: 0,
      readToday: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('reading');
    expect(result[0].done).toBe(true);
  });

  it('beginner tier with script + reading + reviews — all three items present', () => {
    const result = buildDailyPath({ ...BASE, dueReviewCount: 8, tierId: 'know-nothing' });
    const types = result.map((i) => i.type);
    expect(types).toContain('script');
    expect(types).toContain('reading');
    expect(types).toContain('review');
  });

  it('intermediate tier — no script learning lang shows only reading and review', () => {
    const result = buildDailyPath({
      ...BASE,
      hasScriptLearning: false,
      dueReviewCount: 5,
      tierId: 'read-slowly',
    });
    const types = result.map((i) => i.type);
    expect(types).not.toContain('script');
    expect(types).toContain('reading');
    expect(types).toContain('review');
  });

  it('review minutes are capped at 40% of commitment', () => {
    // 100 cards × 0.5 min = 50 min, but commitment is 15 so cap is 6 min
    const result = buildDailyPath({ ...BASE, dailyCommitment: 15, dueReviewCount: 100 });
    const review = result.find((i) => i.type === 'review');
    expect(review!.estimatedMinutes).toBeLessThanOrEqual(Math.floor(15 * 0.4) + 1); // small rounding tolerance
  });

  it('small commitment (5 min) still produces valid minutes', () => {
    const result = buildDailyPath({ ...BASE, dailyCommitment: 5, dueReviewCount: 0 });
    for (const item of result) {
      expect(item.estimatedMinutes).toBeGreaterThanOrEqual(1);
    }
  });

  it('large commitment (60 min) gives reading bite plenty of time', () => {
    const result = buildDailyPath({
      ...BASE,
      dailyCommitment: 60,
      scriptOpened: true,
      dueReviewCount: 10,
    });
    const reading = result.find((i) => i.type === 'reading');
    expect(reading!.estimatedMinutes).toBeGreaterThanOrEqual(5);
  });

  it('uses fallback title when recommendedTextTitle is null', () => {
    const result = buildDailyPath({ ...BASE, recommendedTextTitle: null });
    const reading = result.find((i) => i.type === 'reading');
    expect(reading!.title).toBe('Read a text');
  });

  it('singular "card" label for exactly 1 due review', () => {
    const result = buildDailyPath({ ...BASE, dueReviewCount: 1 });
    const review = result.find((i) => i.type === 'review');
    expect(review!.title).toBe('1 card due');
  });

  it('plural "cards" label for 2+ due reviews', () => {
    const result = buildDailyPath({ ...BASE, dueReviewCount: 3 });
    const review = result.find((i) => i.type === 'review');
    expect(review!.title).toBe('3 cards due');
  });
});

describe('isReadToday', () => {
  it('returns false for null', () => {
    expect(isReadToday(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isReadToday(undefined)).toBe(false);
  });

  it('returns true for today ISO string', () => {
    const todayIso = new Date().toISOString();
    expect(isReadToday(todayIso)).toBe(true);
  });

  it('returns false for yesterday ISO string', () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    expect(isReadToday(yesterday)).toBe(false);
  });
});
