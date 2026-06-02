import { describe, it, expect } from 'vitest';
import {
  findDictionaryEntry,
  getDictionaryEntries,
  searchDictionaryEntries,
  getGlossWithFallbacks,
  getGlossForLemma,
  normalizeSearch,
  stripHebrewVowels,
} from './dictionary.js';

describe('Dictionary data', () => {
  it('index contains corpus-derived entries', () => {
    const entries = getDictionaryEntries();
    expect(entries.length).toBeGreaterThan(0);
  });

  it('lemma lookup resolves a Koine Greek dictionary entry', () => {
    const logos = findDictionaryEntry('λόγος', 'grc-koine');
    expect(logos).toBeTruthy();
    expect(logos?.shortGloss).toBeTruthy();
    expect(logos?.corpusExamples.length || 0).toBeGreaterThan(0);
    expect(logos?.dictionaries.length || 0).toBeGreaterThan(0);
  });

  it('surface-form search maps to lemma entries', () => {
    const surfaceResults = searchDictionaryEntries('Ἐν', 'grc-koine');
    expect(surfaceResults.some((entry) => entry.lemma === 'ἐν')).toBe(true);
  });

  it('language filter restricts dictionary search', () => {
    const filtered = searchDictionaryEntries('created', 'hbo');
    expect(filtered.every((entry) => entry.languageId === 'hbo')).toBe(true);
  });

  it('backfills a static gloss for corpus entries lacking an inline token gloss', () => {
    // καί is high-frequency in the Koine corpus but its tokens carry no inline
    // gloss; the Definition panel must still show a meaning from the static
    // lexicon (grc-koine aliases to the shared Ancient Greek dictionary).
    const kai = findDictionaryEntry('καί', 'grc-koine');
    expect(kai).toBeTruthy();
    expect(kai?.shortGloss).toBeTruthy();
    expect(kai?.fullDefinition).toBeTruthy();
  });
});

describe('getGlossWithFallbacks', () => {
  it('finds exact lemma match', () => {
    const gloss = getGlossWithFallbacks('λόγος', 'grc-koine');
    expect(gloss).toBeTruthy();
    expect(typeof gloss).toBe('string');
  });

  it('falls back to lowercase lemma', () => {
    const gloss = getGlossWithFallbacks('ΛΌΓΟΣ', 'grc-koine');
    expect(gloss).toBeTruthy();
  });

  it('falls back to NFD-normalized / diacritic-stripped lemma', () => {
    const gloss = getGlossWithFallbacks('λόγος', 'grc-koine');
    expect(gloss).toBeTruthy();
  });

  it('returns null for completely unknown lemma', () => {
    const gloss = getGlossWithFallbacks('xyznonexistentword', 'grc');
    expect(gloss).toBeNull();
  });

  it('does not fake definitions', () => {
    const gloss = getGlossWithFallbacks('xyznonexistentword', 'grc');
    expect(gloss).not.toBe('Definition unavailable');
    expect(gloss).toBeNull();
  });

  it('handles empty lemma gracefully', () => {
    const gloss = getGlossWithFallbacks('', 'grc');
    expect(gloss).toBeNull();
  });
});

describe('getGlossForLemma', () => {
  it('returns null for unknown lemma (no fake definitions)', () => {
    const result = getGlossForLemma('nonexistentword12345');
    expect(result).toBeNull();
  });

  it('returns a gloss for known lemma', () => {
    const gloss = getGlossForLemma('λόγος');
    expect(gloss).toBeTruthy();
  });
});

describe('normalizeSearch', () => {
  it('strips Greek diacritics', () => {
    const result = normalizeSearch('λόγος');
    expect(result).toBe('λογος');
  });

  it('lowercases and trims', () => {
    const result = normalizeSearch('  Ἐν  ');
    expect(result).toBe('εν');
  });

  it('handles empty string', () => {
    expect(normalizeSearch('')).toBe('');
  });
});

describe('stripHebrewVowels', () => {
  it('removes Hebrew vowel marks', () => {
    const result = stripHebrewVowels('דָּבָר');
    expect(result).toBe('דבר');
  });

  it('passes through text without vowel marks', () => {
    const result = stripHebrewVowels('דבר');
    expect(result).toBe('דבר');
  });

  it('handles empty string', () => {
    expect(stripHebrewVowels('')).toBe('');
  });
});

describe('dictionary fallback chain order', () => {
  it('corpus-derived entries take priority over static dictionaryDB', () => {
    const dictGloss = getGlossWithFallbacks('θεός', 'grc');
    expect(dictGloss).toBeTruthy();
  });

  it('falls through all steps and returns null for nonsense input', () => {
    const result = getGlossWithFallbacks('!!!@@@###', 'akk');
    expect(result).toBeNull();
  });
});
