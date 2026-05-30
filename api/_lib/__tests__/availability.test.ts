import { describe, expect, it } from 'vitest';
import {
  calculateLessonPriceCents,
  calculatePlatformFeeCents,
  resolveAvailableSlots,
} from '../availability.js';

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

function utcOf(y: number, mo: number, d: number, h = 0, m = 0): number {
  return Date.UTC(y, mo - 1, d, h, m);
}

describe('calculatePlatformFeeCents', () => {
  it('returns 0 for zero or negative inputs', () => {
    expect(calculatePlatformFeeCents(0, 1500)).toBe(0);
    expect(calculatePlatformFeeCents(1000, 0)).toBe(0);
  });
  it('floors basis-points math', () => {
    // 1234 * 0.15 = 185.1 → 185
    expect(calculatePlatformFeeCents(1234, 1500)).toBe(185);
  });
});

describe('calculateLessonPriceCents', () => {
  it('rounds to nearest cent', () => {
    expect(calculateLessonPriceCents(3000, 60)).toBe(3000);
    expect(calculateLessonPriceCents(3000, 30)).toBe(1500);
    expect(calculateLessonPriceCents(3000, 90)).toBe(4500);
  });
});

describe('resolveAvailableSlots', () => {
  // 2024-04-08 is a Monday (weekday=1).
  const monday = utcOf(2024, 4, 8);

  it('expands recurring slots and slices into duration steps', () => {
    const slots = resolveAvailableSlots({
      fromMs: monday,
      toMs: monday + DAY,
      durationMin: 60,
      recurring: { byWeekday: { 1: [{ startMin: 540, endMin: 720 }] } }, // 9:00–12:00 UTC
      exceptionsByDate: {},
      busy: [],
    });
    // 3-hour window, 60-min slots on 15-min grid → 9 slots: 9:00, 9:15, ..., 11:00
    expect(slots).toHaveLength(9);
    expect(new Date(slots[0].startMs).toISOString()).toBe('2024-04-08T09:00:00.000Z');
    expect(new Date(slots[slots.length - 1].startMs).toISOString()).toBe(
      '2024-04-08T11:00:00.000Z'
    );
  });

  it('subtracts busy intervals', () => {
    const slots = resolveAvailableSlots({
      fromMs: monday,
      toMs: monday + DAY,
      durationMin: 60,
      recurring: { byWeekday: { 1: [{ startMin: 540, endMin: 720 }] } },
      exceptionsByDate: {},
      busy: [{ startMs: monday + 600 * MIN, endMs: monday + 660 * MIN }], // 10:00–11:00 busy
    });
    // No 60-min slot can start at 9:15..10:00 since they'd overlap; first half: 9:00 only.
    // Second half from 11:00..12:00 fits one slot at 11:00.
    expect(slots.map((s) => new Date(s.startMs).toISOString())).toEqual([
      '2024-04-08T09:00:00.000Z',
      '2024-04-08T11:00:00.000Z',
    ]);
  });

  it('applies date-keyed exceptions (blocks + extraSlots)', () => {
    const slots = resolveAvailableSlots({
      fromMs: monday,
      toMs: monday + DAY,
      durationMin: 60,
      recurring: { byWeekday: { 1: [{ startMin: 540, endMin: 720 }] } }, // 9–12
      exceptionsByDate: {
        '2024-04-08': {
          date: '2024-04-08',
          blocks: [{ startMin: 600, endMin: 720 }], // block 10–12
          extraSlots: [{ startMin: 780, endMin: 840 }], // add 13–14
        },
      },
      busy: [],
    });
    expect(slots.map((s) => new Date(s.startMs).toISOString())).toEqual([
      '2024-04-08T09:00:00.000Z',
      '2024-04-08T13:00:00.000Z',
    ]);
  });

  it('returns no slots when duration exceeds window', () => {
    const slots = resolveAvailableSlots({
      fromMs: monday,
      toMs: monday + DAY,
      durationMin: 90,
      recurring: { byWeekday: { 1: [{ startMin: 540, endMin: 600 }] } }, // 60-min window
      exceptionsByDate: {},
      busy: [],
    });
    expect(slots).toEqual([]);
  });
});
