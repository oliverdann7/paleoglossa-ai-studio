import { describe, expect, test } from '@jest/globals';
import { 
  getDictionaryEntry, 
  getDictionaryLanguages, 
  searchDictionaryEntries,
  DictionaryEntry
} from '../../data/dictionaryDB';

describe('Dictionary DB', () => {
  test('should return correct Greek entry for ἀγάπη', () => {
    const entry = getDictionaryEntry('ἀγάπη', 'grc');
    expect(entry).not.toBeNull();
    expect(entry?.lemma).toBe('ἀγάπη');
    expect(entry?.languageId).toBe('grc');
    expect(entry?.shortGloss).toContain('love');
  });

  test('should return correct Hebrew entry for אהבה', () => {
    const entry = getDictionaryEntry('אהבה', 'hbo');
    expect(entry).not.toBeNull();
    expect(entry?.lemma).toBe('אהבה');
    expect(entry?.languageId).toBe('hbo');
    expect(entry?.shortGloss).toContain('love');
  });

  test('should return correct Latin entry for amor', () => {
    const entry = getDictionaryEntry('amor', 'lat');
    expect(entry).not.toBeNull();
    expect(entry?.lemma).toBe('amor');
    expect(entry?.languageId).toBe('lat');
    expect(entry?.shortGloss).toContain('love');
  });

  test('should return null for unknown word', () => {
    const entry = getDictionaryEntry('unknownword', 'grc');
    expect(entry).toBeNull();
  });

  test('should find entries by search', () => {
    const results = searchDictionaryEntries('love', undefined, 10);
    expect(results.length).toBeGreaterThan(0);
    // Should find at least our English love entry
    const englishLove = results.find((e: DictionaryEntry) => e.lemma === 'love' && e.languageId === 'en');
    expect(englishLove).not.toBeUndefined();
  });

  test('should search by language', () => {
    const greekResults = searchDictionaryEntries('ἀγάπη', 'grc', 10);
    expect(greekResults.length).toBe(1);
    expect(greekResults[0].lemma).toBe('ἀγάπη');
    
    const hebrewResults = searchDictionaryEntries('אהבה', 'hbo', 10);
    expect(hebrewResults.length).toBe(1);
    expect(hebrewResults[0].lemma).toBe('אהבה');
  });

  test('should return available languages', () => {
    const languages = getDictionaryLanguages();
    expect(languages.length).toBeGreaterThan(0);
    
    const languageIds = languages.map((l: { id: string }) => l.id);
    expect(languageIds).toContain('grc');
    expect(languageIds).toContain('hbo');
    expect(languageIds).toContain('lat');
    expect(languageIds).toContain('en');
  });
});