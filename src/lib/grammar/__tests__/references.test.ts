import { describe, it, expect } from 'vitest';
import {
  getGrammarReference,
  listGrammarReferences,
  getGrammarReferencesForLanguage,
  formatGrammarEntry,
} from '../references';

describe('Grammar reference service', () => {

  describe('getGrammarReference', () => {
    it('returns explanation for a known part of speech tag', () => {
      const ref = getGrammarReference('noun');
      expect(ref).not.toBeNull();
      expect(ref!.category).toBe('partOfSpeech');
      expect(ref!.short).toContain('person');
    });

    it('returns explanation for a known case tag', () => {
      const ref = getGrammarReference('nominative');
      expect(ref).not.toBeNull();
      expect(ref!.category).toBe('case');
    });

    it('returns explanation for a known tense tag', () => {
      const ref = getGrammarReference('aorist');
      expect(ref).not.toBeNull();
      expect(ref!.category).toBe('tense');
      expect(ref!.long).toBeDefined();
    });

    it('returns null for an unknown tag', () => {
      const ref = getGrammarReference('nonexistent_tag');
      expect(ref).toBeNull();
    });

    it('is case-insensitive', () => {
      const ref = getGrammarReference('NOMINATIVE');
      expect(ref).not.toBeNull();
      expect(ref!.tag).toBe('nominative');
    });

    it('handles empty string', () => {
      const ref = getGrammarReference('');
      expect(ref).toBeNull();
    });

    it('handles nullish input string', () => {
      const ref = getGrammarReference('  ');
      expect(ref).toBeNull();
    });
  });

  describe('listGrammarReferences', () => {
    it('returns all references when no category is given', () => {
      const all = listGrammarReferences();
      expect(all.length).toBeGreaterThan(40);
    });

    it('filters by category', () => {
      const cases = listGrammarReferences('case');
      expect(cases.length).toBeGreaterThanOrEqual(5);
      cases.forEach(c => expect(c.category).toBe('case'));
    });

    it('returns empty array for non-existent category', () => {
      const refs = listGrammarReferences('nonexistent');
      expect(refs).toEqual([]);
    });
  });

  describe('getGrammarReferencesForLanguage', () => {
    it('returns case, gender, tense, voice, mood references for Ancient Greek', () => {
      const refs = getGrammarReferencesForLanguage('grc');
      const categories = new Set(refs.map(r => r.category));
      expect(categories.has('case')).toBe(true);
      expect(categories.has('tense')).toBe(true);
      expect(categories.has('voice')).toBe(true);
      expect(categories.has('mood')).toBe(true);
    });

    it('returns stem and state references for Hebrew', () => {
      const refs = getGrammarReferencesForLanguage('hbo');
      const categories = new Set(refs.map(r => r.category));
      expect(categories.has('state')).toBe(true);
      expect(categories.has('stem')).toBe(true);
    });

    it('always returns partOfSpeech and person references', () => {
      const refs = getGrammarReferencesForLanguage('akk');
      const categories = new Set(refs.map(r => r.category));
      expect(categories.has('partOfSpeech')).toBe(true);
      expect(categories.has('person')).toBe(true);
    });
  });

  describe('formatGrammarEntry', () => {
    it('returns a formatted entry for a known tag', () => {
      const entry = formatGrammarEntry('dative');
      expect(entry).not.toBeNull();
      expect(entry!.tag).toBe('dative');
      expect(entry!.category).toBe('case');
      expect(entry!.explanation).toBeDefined();
    });

    it('uses long explanation when available', () => {
      const entry = formatGrammarEntry('genitive');
      expect(entry).not.toBeNull();
      expect(entry!.explanation.length).toBeGreaterThan(20);
    });

    it('falls back to short explanation when long is absent', () => {
      const entry = formatGrammarEntry('singular');
      expect(entry).not.toBeNull();
      expect(entry!.explanation).toBe('One item');
    });

    it('returns null for unknown tag', () => {
      const entry = formatGrammarEntry('bogus');
      expect(entry).toBeNull();
    });
  });
});
