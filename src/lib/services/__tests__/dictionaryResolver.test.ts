import { describe, expect, test, vi } from 'vitest';

// Mock the network-backed resolvers so the test is deterministic and offline.
vi.mock('../lexiconService', () => ({
  lookupLexicon: vi.fn(async () => ({
    definition: 'LSJ definition',
    source: 'logeion-lsj',
    sourceLabel: 'Liddell-Scott-Jones',
    sourceUrl: 'https://logeion.uchicago.edu/x',
  })),
}));
vi.mock('../wiktionaryService', async (orig) => {
  const actual = await orig<typeof import('../wiktionaryService')>();
  return {
    ...actual,
    lookupWiktionary: vi.fn(async () => ({
      lemma: 'x',
      matchedLanguageName: 'Ancient Greek',
      entries: [
        { partOfSpeech: 'noun', language: 'Ancient Greek', definitions: ['a wiktionary gloss'] },
      ],
      sourceUrl: 'https://en.wiktionary.org/wiki/x',
    })),
  };
});
vi.mock('../aiClient', () => ({
  AIClient: { getWordGloss: vi.fn(async () => 'amor') },
}));

import { resolveMeaning } from '../dictionaryResolver';
import { AIClient } from '../aiClient';

const getWordGloss = vi.mocked(AIClient.getWordGloss);

describe('dictionaryResolver.resolveMeaning', () => {
  test('bundled source resolves an offline definition for a known lemma', async () => {
    const result = await resolveMeaning('ἀγάπη', 'grc', 'paleoglossa');
    expect(result).not.toBeNull();
    expect(result?.sourceId).toBe('paleoglossa');
    expect(result?.definition.toLowerCase()).toContain('love');
  });

  test('external-api source returns the lexicon definition + label', async () => {
    const result = await resolveMeaning('λόγος', 'grc', 'logeion');
    expect(result?.definition).toBe('LSJ definition');
    expect(result?.sourceLabel).toBe('Liddell-Scott-Jones');
  });

  test('wiktionary source summarises the entry', async () => {
    const result = await resolveMeaning('λόγος', 'grc', 'wiktionary');
    expect(result?.definition).toBeTruthy();
    expect(result?.sourceId).toBe('wiktionary');
  });

  test('ai source forwards the target UI language and flags aiGenerated', async () => {
    const result = await resolveMeaning('λόγος', 'grc', 'ai', {
      targetLanguage: 'pt',
      surface: 'λόγον',
    });
    expect(result?.aiGenerated).toBe(true);
    expect(result?.definition).toBe('amor');
    expect(getWordGloss).toHaveBeenCalledWith('grc', 'λόγον', 'λόγος', 'pt');
  });

  test('external-link source has no inline meaning', async () => {
    expect(await resolveMeaning('λόγος', 'grc', 'perseus')).toBeNull();
  });

  test('unknown source id returns null', async () => {
    expect(await resolveMeaning('λόγος', 'grc', 'does-not-exist')).toBeNull();
  });
});
