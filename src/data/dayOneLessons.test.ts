import { describe, it, expect } from 'vitest';
import { DAY_ONE_LESSONS, getDayOneLesson, hasDayOneLesson } from './dayOneLessons.js';

describe('dayOneLessons', () => {
  it('covers the flagship languages', () => {
    expect(hasDayOneLesson('grc')).toBe(true);
    expect(hasDayOneLesson('grc-koine')).toBe(true);
    expect(hasDayOneLesson('lat')).toBe(true);
    expect(hasDayOneLesson('hbo')).toBe(true);
  });

  it('returns null for languages without a curated lesson', () => {
    expect(getDayOneLesson('syr')).toBeNull();
    expect(getDayOneLesson(undefined)).toBeNull();
    expect(hasDayOneLesson('akk')).toBe(false);
  });

  it('keeps every lesson at A0 scale (2–3 short sentences)', () => {
    for (const lesson of Object.values(DAY_ONE_LESSONS)) {
      expect(lesson.sentences.length).toBeGreaterThanOrEqual(2);
      expect(lesson.sentences.length).toBeLessThanOrEqual(3);
      for (const s of lesson.sentences) {
        expect(s.words.length).toBeGreaterThan(0);
        expect(s.words.length).toBeLessThanOrEqual(5);
        expect(s.translation.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('every word carries a lemma and gloss; ~90% are pre-known (≤1 new per sentence)', () => {
    for (const lesson of Object.values(DAY_ONE_LESSONS)) {
      for (const s of lesson.sentences) {
        const newCount = s.words.filter((w) => w.isNew).length;
        expect(newCount).toBeLessThanOrEqual(1);
        for (const w of s.words) {
          expect(w.lemma.length).toBeGreaterThan(0);
          expect(w.gloss.length).toBeGreaterThan(0);
          expect(w.surface.length).toBeGreaterThan(0);
        }
      }
      // Across the whole lesson, known words must dominate.
      const all = lesson.sentences.flatMap((s) => s.words);
      const known = all.filter((w) => !w.isNew).length;
      expect(known / all.length).toBeGreaterThanOrEqual(0.6);
    }
  });

  it('marks Hebrew right-to-left and Greek/Latin left-to-right', () => {
    expect(DAY_ONE_LESSONS.hbo.direction).toBe('rtl');
    expect(DAY_ONE_LESSONS.grc.direction).toBe('ltr');
    expect(DAY_ONE_LESSONS.lat.direction).toBe('ltr');
  });
});
