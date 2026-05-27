import { describe, it, expect } from 'vitest';
import { computeReviewForecast, countDueToday } from '../forecastService.js';
import type { KnowledgeMap } from '../vocabularyService.js';

// Fixed "now" so tests are deterministic
const NOW = new Date('2026-05-27T09:00:00Z');

function makeKnowledge(entries: { state: string; nextReview?: string }[]): KnowledgeMap {
  const map: KnowledgeMap = {};
  entries.forEach((e, i) => {
    map[`term${i}`] = {
      state: e.state as any,
      srs: e.nextReview
        ? { nextReview: e.nextReview, interval: 1, ease: 2.5, step: 0, lastReviewed: null }
        : undefined,
      addedAt: '2026-01-01T00:00:00Z',
    };
  });
  return map;
}

// Helper — local date for offset from NOW
function localDate(offsetDays: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

describe('computeReviewForecast', () => {
  it('returns 7 days by default', () => {
    const result = computeReviewForecast({}, 7, NOW);
    expect(result).toHaveLength(7);
  });

  it('respects custom days parameter', () => {
    const result = computeReviewForecast({}, 14, NOW);
    expect(result).toHaveLength(14);
  });

  it('first entry is Today and second is Tomorrow', () => {
    const result = computeReviewForecast({}, 7, NOW);
    expect(result[0].label).toBe('Today');
    expect(result[0].isToday).toBe(true);
    expect(result[1].label).toBe('Tomorrow');
    expect(result[1].isToday).toBe(false);
  });

  it('all counts are 0 for empty knowledge', () => {
    const result = computeReviewForecast({}, 7, NOW);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it('counts LEARNING word due today', () => {
    const km = makeKnowledge([{ state: 'LEARNING', nextReview: localDate(0) + 'T00:00:00Z' }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result[0].count).toBe(1);
  });

  it('counts SEEN word due today', () => {
    const km = makeKnowledge([{ state: 'SEEN', nextReview: localDate(0) + 'T00:00:00Z' }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result[0].count).toBe(1);
  });

  it('counts FAMILIAR word due tomorrow', () => {
    const km = makeKnowledge([{ state: 'FAMILIAR', nextReview: localDate(1) + 'T00:00:00Z' }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result[1].count).toBe(1);
  });

  it('KNOWN words are excluded from forecast', () => {
    const km = makeKnowledge([{ state: 'KNOWN', nextReview: localDate(0) + 'T00:00:00Z' }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result[0].count).toBe(0);
  });

  it('NEW words without nextReview are excluded', () => {
    const km = makeKnowledge([{ state: 'NEW' }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it('overdue words (nextReview in past) appear in Today bucket', () => {
    const yesterday = localDate(-1) + 'T00:00:00Z';
    const km = makeKnowledge([{ state: 'LEARNING', nextReview: yesterday }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result[0].count).toBe(1);
  });

  it('words due beyond the window are excluded', () => {
    const beyond = localDate(8) + 'T00:00:00Z';
    const km = makeKnowledge([{ state: 'LEARNING', nextReview: beyond }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it('words without srs data are excluded', () => {
    const km = makeKnowledge([{ state: 'LEARNING' }]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it('correctly distributes multiple words across different days', () => {
    const km = makeKnowledge([
      { state: 'LEARNING', nextReview: localDate(0) + 'T00:00:00Z' },
      { state: 'LEARNING', nextReview: localDate(0) + 'T12:00:00Z' },
      { state: 'FAMILIAR', nextReview: localDate(2) + 'T00:00:00Z' },
      { state: 'KNOWN',    nextReview: localDate(1) + 'T00:00:00Z' }, // excluded
    ]);
    const result = computeReviewForecast(km, 7, NOW);
    expect(result[0].count).toBe(2); // today
    expect(result[1].count).toBe(0); // tomorrow (KNOWN excluded)
    expect(result[2].count).toBe(1); // day+2
  });

  it('isToday flag is only true on day 0', () => {
    const result = computeReviewForecast({}, 7, NOW);
    result.forEach((d, i) => {
      if (i === 0) expect(d.isToday).toBe(true);
      else expect(d.isToday).toBe(false);
    });
  });

  it('dates are in YYYY-MM-DD format and increment correctly', () => {
    const result = computeReviewForecast({}, 4, NOW);
    for (let i = 0; i < 4; i++) {
      expect(result[i].date).toBe(localDate(i));
    }
  });
});

describe('countDueToday', () => {
  it('returns 0 for empty knowledge', () => {
    expect(countDueToday({}, NOW)).toBe(0);
  });

  it('counts overdue and today-due words', () => {
    const km = makeKnowledge([
      { state: 'LEARNING', nextReview: localDate(-2) + 'T00:00:00Z' }, // overdue
      { state: 'LEARNING', nextReview: localDate(0) + 'T00:00:00Z' },  // today
      { state: 'LEARNING', nextReview: localDate(1) + 'T00:00:00Z' },  // tomorrow
    ]);
    expect(countDueToday(km, NOW)).toBe(2);
  });
});
