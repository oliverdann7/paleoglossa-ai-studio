import { describe, expect, test } from 'vitest';
import {
  getDictionariesForLanguage,
  getDefaultDictionaryId,
  resolvePreferredDictionaryId,
} from '../../data/dictionarySources';

describe('dictionarySources — per-language separation', () => {
  test('Greek lists only Greek-valid sources (no Hebrew/Latin lexica)', () => {
    const ids = getDictionariesForLanguage('grc').map((s) => s.id);
    expect(ids).toContain('paleoglossa');
    expect(ids).toContain('logeion');
    expect(ids).toContain('wiktionary');
    expect(ids).toContain('ai');
    // No cross-language leakage:
    expect(ids).not.toContain('sefaria');
    expect(ids).not.toContain('blueletter');
  });

  test('Hebrew lists Sefaria but never Greek/Latin lexica', () => {
    const ids = getDictionariesForLanguage('hbo').map((s) => s.id);
    expect(ids).toContain('sefaria');
    expect(ids).not.toContain('logeion');
    expect(ids).not.toContain('perseus');
  });

  test('every offered source declares support for the requested language', () => {
    for (const lang of ['grc', 'grc-koine', 'lat', 'hbo', 'syr', 'cop', 'arc', 'san']) {
      for (const src of getDictionariesForLanguage(lang)) {
        const ok = src.languages === 'all' || src.languages.includes(lang);
        expect(ok, `${src.id} should support ${lang}`).toBe(true);
      }
    }
  });

  test('bundled lexicon is the default (offline, free) — never an external link', () => {
    expect(getDefaultDictionaryId('grc')).toBe('paleoglossa');
    expect(getDefaultDictionaryId('hbo')).toBe('paleoglossa');
    const def = getDictionariesForLanguage('lat').find(
      (s) => s.id === getDefaultDictionaryId('lat')
    );
    expect(def?.resolver).not.toBe('external-link');
  });

  test('resolvePreferredDictionaryId honours a valid stored preference', () => {
    expect(resolvePreferredDictionaryId('grc', { grc: 'logeion' })).toBe('logeion');
  });

  test('resolvePreferredDictionaryId rejects a preference from another language', () => {
    // Sefaria is Hebrew-only; selecting it for Greek must fall back to default.
    expect(resolvePreferredDictionaryId('grc', { grc: 'sefaria' })).toBe('paleoglossa');
  });

  test('resolvePreferredDictionaryId never returns a link-only source', () => {
    expect(resolvePreferredDictionaryId('grc', { grc: 'perseus' })).toBe('paleoglossa');
  });

  test('empty language yields no dictionaries', () => {
    expect(getDictionariesForLanguage('')).toEqual([]);
  });

  test('unknown language exposes only language-agnostic sources (no specific lexica)', () => {
    const ids = getDictionariesForLanguage('xx-unknown').map((s) => s.id);
    // Universal sources are fine (corpus index + AI); a specific language's
    // lexicon must never appear for an unrelated language.
    expect(ids).not.toContain('logeion');
    expect(ids).not.toContain('sefaria');
    expect(ids).not.toContain('wiktionary');
    ids.forEach((id) => expect(['paleoglossa', 'ai']).toContain(id));
  });
});
