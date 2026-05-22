import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  lookupStepBible,
  summarizeStepBible,
  _resetStepBibleCache,
} from '../stepBibleService';

const GREEK_FIXTURE = {
  λογος: [
    {
      eStrong: 'G3056',
      uStrong: 'G3056',
      lemma: 'λόγος',
      transliteration: 'logos',
      morphCode: 'G:N-M',
      gloss: 'word',
      definition: 'word, reason, speech',
    },
  ],
  θεος: [
    {
      eStrong: 'G2316',
      uStrong: 'G2316',
      lemma: 'θεός',
      transliteration: 'theos',
      morphCode: 'G:N-M/F',
      gloss: 'God',
      definition: 'God, deity',
    },
  ],
};

const HEBREW_FIXTURE = {
  אב: [
    {
      eStrong: 'H0001',
      uStrong: 'H0001G',
      lemma: 'אָב',
      transliteration: 'av',
      morphCode: 'H:N-M',
      gloss: 'father',
      definition: '1) father of an individual 2) of God',
    },
  ],
};

describe('stepBibleService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    _resetStepBibleCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns null for unsupported languages', async () => {
    global.fetch = vi.fn();
    const result = await lookupStepBible('lupus', 'lat');
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('looks up Greek lemmas with diacritics stripped and case-folded', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(GREEK_FIXTURE),
    });
    const result = await lookupStepBible('Λόγος', 'grc');
    expect(result).not.toBeNull();
    expect(result!.entries[0].gloss).toBe('word');
    expect(result!.source).toBe('stepbible-greek');
    expect(summarizeStepBible(result!)).toBe('word');
  });

  it('falls back to Greek file for grc-koine', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(GREEK_FIXTURE),
    });
    const result = await lookupStepBible('θεός', 'grc-koine');
    expect(result).not.toBeNull();
    expect(result!.entries[0].gloss).toBe('God');
  });

  it('strips Hebrew niqqud (vowel pointing) from lookup keys', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(HEBREW_FIXTURE),
    });
    const result = await lookupStepBible('אָב', 'hbo');
    expect(result).not.toBeNull();
    expect(result!.entries[0].lemma).toBe('אָב');
    expect(result!.source).toBe('stepbible-hebrew');
  });

  it('returns null when lemma is absent from the dataset', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(GREEK_FIXTURE),
    });
    const result = await lookupStepBible('completelymadeup', 'grc');
    expect(result).toBeNull();
  });

  it('caches the index after first fetch — subsequent lookups do not refetch', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(GREEK_FIXTURE),
    });
    global.fetch = fetchSpy;
    await lookupStepBible('λόγος', 'grc');
    await lookupStepBible('θεός', 'grc');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('returns null when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    const result = await lookupStepBible('λόγος', 'grc');
    expect(result).toBeNull();
  });
});
