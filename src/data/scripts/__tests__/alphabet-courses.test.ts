import { describe, it, expect } from 'vitest';
import { ALPHABET_COURSES, getAlphabetCourse } from '../alphabet-courses';
import type { ScriptSign } from '../../../types/scripts';
import { AKKADIAN_SIGNS } from '../akkadian-signs';
import { EGYPTIAN_SIGNS } from '../egyptian-signs';
import { HITTITE_SIGNS } from '../hittite-signs';
import { UGARITIC_SIGNS } from '../ugaritic-signs';
import { GREEK_LETTERS } from '../greek-letters';
import { HEBREW_LETTERS } from '../hebrew-letters';
import { LATIN_SCRIPT } from '../latin-script';
import { SYRIAC_LETTERS } from '../syriac-letters';
import { COPTIC_LETTERS } from '../coptic-letters';
import { ARAMAIC_LETTERS } from '../aramaic-letters';
import { SANSKRIT_LETTERS } from '../sanskrit-letters';

// Same mapping ScriptLab uses — the course must draw only from these signs.
const SIGN_MAP: Record<string, ScriptSign[]> = {
  akk: AKKADIAN_SIGNS,
  egy: EGYPTIAN_SIGNS,
  hit: HITTITE_SIGNS,
  uga: UGARITIC_SIGNS,
  grc: GREEK_LETTERS,
  'grc-koine': GREEK_LETTERS,
  hbo: HEBREW_LETTERS,
  lat: LATIN_SCRIPT,
  syr: SYRIAC_LETTERS,
  cop: COPTIC_LETTERS,
  arc: ARAMAIC_LETTERS,
  san: SANSKRIT_LETTERS,
};

describe('alphabet courses', () => {
  it('exists for every language with script data', () => {
    for (const langId of Object.keys(SIGN_MAP)) {
      expect(getAlphabetCourse(langId), `course for ${langId}`).toBeTruthy();
    }
  });

  it('every referenced signId resolves to a real sign of that language', () => {
    for (const [langId, course] of Object.entries(ALPHABET_COURSES)) {
      const signs = SIGN_MAP[langId];
      expect(signs, `sign data for ${langId}`).toBeTruthy();
      const known = new Set(signs.map((s) => s.id));
      for (const lesson of course.lessons) {
        for (const signId of lesson.signIds) {
          expect(
            known.has(signId),
            `${langId}/${lesson.id} references unknown sign "${signId}"`
          ).toBe(true);
        }
      }
    }
  });

  it('lesson ids are unique within a course and every lesson has signs', () => {
    for (const [langId, course] of Object.entries(ALPHABET_COURSES)) {
      const seen = new Set<string>();
      for (const lesson of course.lessons) {
        expect(seen.has(lesson.id), `${langId} duplicate lesson id ${lesson.id}`).toBe(false);
        seen.add(lesson.id);
        expect(lesson.signIds.length, `${langId}/${lesson.id} has no signs`).toBeGreaterThan(0);
      }
      expect(course.lessons.length, `${langId} course has no lessons`).toBeGreaterThan(0);
    }
  });

  it('no sign appears in more than one lesson of the same course', () => {
    for (const [langId, course] of Object.entries(ALPHABET_COURSES)) {
      const seen = new Set<string>();
      for (const lesson of course.lessons) {
        for (const signId of lesson.signIds) {
          expect(seen.has(signId), `${langId}: sign ${signId} taught twice`).toBe(false);
          seen.add(signId);
        }
      }
    }
  });
});
