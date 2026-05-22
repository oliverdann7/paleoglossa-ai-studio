import { describe, it, expect } from 'vitest';
import {
  canAccessLanguage,
  canAddLanguage,
  getPlanById,
  FREE_LANGUAGE_WORD_LIMIT,
  isTrackedWordState,
  hasVocabLimit,
  isLanguageUnlocked,
  hasVocabLimitForLanguage,
} from '../plans';
import type { PlanId } from '../plans';

describe('canAccessLanguage', () => {
  it('always returns true — all languages are accessible on every plan', () => {
    expect(canAccessLanguage()).toBe(true);
  });
});

describe('isLanguageUnlocked', () => {
  it('free plan: no language is unlocked (no unlimited-save slots)', () => {
    expect(isLanguageUnlocked('free', [], 'grc')).toBe(false);
    expect(isLanguageUnlocked('free', ['grc'], 'grc')).toBe(false);
  });

  it('basic_1: selected language is unlocked, others are not', () => {
    expect(isLanguageUnlocked('basic_1', ['lat'], 'lat')).toBe(true);
    expect(isLanguageUnlocked('basic_1', ['lat'], 'grc')).toBe(false);
  });

  it('duo_2: both selected languages are unlocked', () => {
    expect(isLanguageUnlocked('duo_2', ['grc', 'hbo'], 'grc')).toBe(true);
    expect(isLanguageUnlocked('duo_2', ['grc', 'hbo'], 'hbo')).toBe(true);
    expect(isLanguageUnlocked('duo_2', ['grc', 'hbo'], 'lat')).toBe(false);
  });

  it('full_all: every language is unlocked', () => {
    expect(isLanguageUnlocked('full_all', [], 'grc')).toBe(true);
    expect(isLanguageUnlocked('full_all', [], 'san')).toBe(true);
    expect(isLanguageUnlocked('full_all', [], 'egy')).toBe(true);
  });
});

describe('hasVocabLimitForLanguage', () => {
  it('is the inverse of isLanguageUnlocked', () => {
    expect(hasVocabLimitForLanguage('free', [], 'grc')).toBe(true);
    expect(hasVocabLimitForLanguage('basic_1', ['lat'], 'lat')).toBe(false);
    expect(hasVocabLimitForLanguage('basic_1', ['lat'], 'grc')).toBe(true);
    expect(hasVocabLimitForLanguage('full_all', [], 'grc')).toBe(false);
  });
});

describe('canAddLanguage', () => {
  it('free user cannot add any language (limit is 0 unlock slots)', () => {
    expect(canAddLanguage('free', [])).toBe(false);
    expect(canAddLanguage('free', ['grc'])).toBe(false);
  });

  it('basic_1 user can add one language, then no more', () => {
    expect(canAddLanguage('basic_1', [])).toBe(true);
    expect(canAddLanguage('basic_1', ['grc'])).toBe(false);
  });

  it('duo_2 user can add up to 2 languages', () => {
    expect(canAddLanguage('duo_2', [])).toBe(true);
    expect(canAddLanguage('duo_2', ['grc'])).toBe(true);
    expect(canAddLanguage('duo_2', ['grc', 'hbo'])).toBe(false);
  });

  it('full_all user can always add languages', () => {
    expect(canAddLanguage('full_all', ['grc', 'hbo', 'lat', 'san'])).toBe(true);
    expect(canAddLanguage('full_all', [])).toBe(true);
  });
});

describe('getPlanById', () => {
  it('returns plan for all valid PlanId values', () => {
    const ids: PlanId[] = ['free', 'basic_1', 'duo_2', 'full_all'];
    for (const id of ids) {
      const plan = getPlanById(id);
      expect(plan.id).toBe(id);
      expect(plan.name).toBeTruthy();
    }
  });

  it('defaults to free for unknown plan IDs', () => {
    const plan = getPlanById('unknown' as PlanId);
    expect(plan.id).toBe('free');
  });
});

describe('FREE_LANGUAGE_WORD_LIMIT', () => {
  it('equals 25', () => {
    expect(FREE_LANGUAGE_WORD_LIMIT).toBe(25);
  });
});

describe('isTrackedWordState', () => {
  it('returns true for SEEN, LEARNING, FAMILIAR, KNOWN', () => {
    expect(isTrackedWordState('SEEN')).toBe(true);
    expect(isTrackedWordState('LEARNING')).toBe(true);
    expect(isTrackedWordState('FAMILIAR')).toBe(true);
    expect(isTrackedWordState('KNOWN')).toBe(true);
  });

  it('returns false for NEW and IGNORED', () => {
    expect(isTrackedWordState('NEW')).toBe(false);
    expect(isTrackedWordState('IGNORED')).toBe(false);
  });

  it('returns false for null, undefined, and empty string', () => {
    expect(isTrackedWordState(null)).toBe(false);
    expect(isTrackedWordState(undefined)).toBe(false);
    expect(isTrackedWordState('')).toBe(false);
  });

  it('returns false for unknown values', () => {
    expect(isTrackedWordState('unknown')).toBe(false);
    expect(isTrackedWordState(42)).toBe(false);
  });
});

describe('hasVocabLimit', () => {
  it('returns false only for full_all — all other plans have per-language word caps', () => {
    expect(hasVocabLimit('free')).toBe(true);
    expect(hasVocabLimit('basic_1')).toBe(true);
    expect(hasVocabLimit('duo_2')).toBe(true);
    expect(hasVocabLimit('full_all')).toBe(false);
  });
});
