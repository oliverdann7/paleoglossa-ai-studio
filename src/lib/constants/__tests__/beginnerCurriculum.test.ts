import { describe, it, expect } from 'vitest';
import {
  getBeginnerCurriculum,
  getCurrentUnit,
  hasBeginnerCurriculum,
  isCurriculumComplete,
} from '../beginnerCurriculum';
import { CorpusDB } from '../../../data/corpus';
import { LANGUAGE_IDS } from '../languages';

describe('beginner curricula', () => {
  it('every supported language has a sequenced curriculum', () => {
    for (const langId of LANGUAGE_IDS) {
      expect(hasBeginnerCurriculum(langId), `curriculum for ${langId}`).toBe(true);
    }
  });

  it('every curriculum unit references a resolvable corpus text', () => {
    for (const langId of LANGUAGE_IDS) {
      const curriculum = getBeginnerCurriculum(langId);
      expect(curriculum, `curriculum for ${langId}`).toBeTruthy();
      for (const unit of curriculum!) {
        const text = CorpusDB.getText(unit.textId);
        expect(text, `${langId}/${unit.id} → missing text "${unit.textId}"`).toBeTruthy();
      }
    }
  });

  it('every curriculum starts at A1 and unit ids are unique', () => {
    for (const langId of LANGUAGE_IDS) {
      const curriculum = getBeginnerCurriculum(langId)!;
      expect(curriculum[0].level, `${langId} first unit level`).toBe('A1');
      const ids = curriculum.map((u) => u.id);
      expect(new Set(ids).size, `${langId} duplicate unit ids`).toBe(ids.length);
    }
  });

  it('getCurrentUnit clamps and isCurriculumComplete flags the end', () => {
    const curriculum = getBeginnerCurriculum('akk')!;
    expect(getCurrentUnit('akk', 0)?.id).toBe(curriculum[0].id);
    expect(getCurrentUnit('akk', 999)?.id).toBe(curriculum[curriculum.length - 1].id);
    expect(isCurriculumComplete('akk', curriculum.length)).toBe(true);
    expect(isCurriculumComplete('akk', curriculum.length - 1)).toBe(false);
  });
});
