import { describe, it, expect } from 'vitest';
import {
  findDictionaryEntry,
  getDictionaryEntries,
  searchDictionaryEntries,
} from './dictionary';

describe('Dictionary data', () => {

  it('index contains corpus-derived entries', () => {
    const entries = getDictionaryEntries();
    expect(entries.length).toBeGreaterThan(0);
  });

  it('lemma lookup resolves a Koine Greek dictionary entry', () => {
    const logos = findDictionaryEntry('λόγος', 'grc-koine');
    expect(logos).toBeTruthy();
    expect(logos?.shortGloss).not.toBe('Definition unavailable');
    expect((logos?.corpusExamples.length || 0)).toBeGreaterThan(0);
    expect((logos?.dictionaries.length || 0)).toBeGreaterThan(0);
  });

  it('surface-form search maps to lemma entries', () => {
    const surfaceResults = searchDictionaryEntries('Ἐν', 'grc-koine');
    expect(surfaceResults.some(entry => entry.lemma === 'ἐν')).toBe(true);
  });

  it('language filter restricts dictionary search', () => {
    const filtered = searchDictionaryEntries('created', 'hbo');
    expect(filtered.every(entry => entry.languageId === 'hbo')).toBe(true);
  });
});
