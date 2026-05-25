import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { lookupWiktionary, summarizeWiktionary } from '../wiktionaryService';

describe('wiktionaryService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Clear module-level cache between tests by re-importing — but since
    // cache lives in the module, use unique lemmas per test instead.
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns null when the language is unsupported', async () => {
    global.fetch = vi.fn();
    const result = await lookupWiktionary('foo', 'klingon');
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns null when Wiktionary 404s', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) });
    const result = await lookupWiktionary('nonexistent-lemma-xyz123', 'lat');
    expect(result).toBeNull();
  });

  it('parses a matching language entry and strips HTML from definitions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          la: [
            {
              partOfSpeech: 'Verb',
              language: 'Latin',
              definitions: [
                { definition: 'to <a href="/wiki/love" title="love">love</a>' },
                { definition: 'to <b>cherish</b>' },
              ],
            },
          ],
        }),
    });
    const result = await lookupWiktionary('amare-test-1', 'lat');
    expect(result).not.toBeNull();
    expect(result!.matchedLanguageName).toBe('Latin');
    expect(result!.entries).toHaveLength(1);
    expect(result!.entries[0].definitions[0]).toBe('to love');
    expect(result!.entries[0].definitions[1]).toBe('to cherish');
    expect(summarizeWiktionary(result!)).toBe('to love');
  });

  it('finds entries regardless of the API key — matches on language name', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          other: [
            {
              partOfSpeech: 'Noun',
              language: 'Ancient Greek',
              definitions: [{ definition: 'word, reason, speech' }],
            },
          ],
        }),
    });
    const result = await lookupWiktionary('logos-test-1', 'grc');
    expect(result).not.toBeNull();
    expect(result!.matchedLanguageName).toBe('Ancient Greek');
    expect(summarizeWiktionary(result!)).toBe('word, reason, speech');
  });

  it('skips entries whose language does not match the requested ID', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          en: [
            {
              partOfSpeech: 'Noun',
              language: 'English',
              definitions: [{ definition: 'an English word' }],
            },
          ],
        }),
    });
    const result = await lookupWiktionary('english-only-test-1', 'lat');
    expect(result).toBeNull();
  });

  it('falls back to a secondary language candidate (Aramaic → Syriac)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          arc: [
            {
              partOfSpeech: 'Noun',
              language: 'Aramaic',
              definitions: [{ definition: 'a Syriac noun' }],
            },
          ],
        }),
    });
    const result = await lookupWiktionary('syriac-fallback-test-1', 'syr');
    expect(result).not.toBeNull();
    expect(result!.matchedLanguageName).toBe('Aramaic');
  });
});
