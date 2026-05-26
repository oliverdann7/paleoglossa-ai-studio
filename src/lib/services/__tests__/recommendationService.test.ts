import { describe, it, expect } from 'vitest';
import {
  computeRecommendations,
  getTopRecommendation,
  pickDashboardRecommendation,
} from '../recommendationService';
import type { LibraryText } from '../libraryService';
import type { KnowledgeMap } from '../vocabularyService';

function makeText(overrides: Partial<LibraryText> & { id: string }): LibraryText {
  return {
    title: overrides.id,
    author: 'Author',
    language: 'grc',
    level: 'B1',
    totalWords: 200,
    sourceType: 'corpus',
    availableTools: { morphology: true, translation: true, audio: false, syntax: false },
    percentKnown: 80,
    percentKnownUnique: 80,
    ...overrides,
  } as LibraryText;
}

function makeKnowledge(entries: Array<{ key: string; lang: string; state: string }>): KnowledgeMap {
  const map: KnowledgeMap = {};
  for (const e of entries) {
    map[e.key] = { state: e.state as any, languageId: e.lang, addedAt: '2026-01-01' };
  }
  return map;
}

describe('computeRecommendations', () => {
  it('returns texts in the coverage sweet spot', () => {
    const texts = [
      makeText({ id: 'too-easy', percentKnownUnique: 99 }),
      makeText({ id: 'sweet', percentKnownUnique: 90 }),
      makeText({ id: 'too-hard', percentKnownUnique: 50 }),
    ];
    const knowledge = makeKnowledge([{ key: 'λόγος', lang: 'grc', state: 'KNOWN' }]);
    const result = computeRecommendations(texts, knowledge);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('sweet');
  });

  it('excludes finished texts', () => {
    const texts = [
      makeText({ id: 'finished', percentKnownUnique: 90 }),
      makeText({ id: 'fresh', percentKnownUnique: 90 }),
    ];
    const knowledge = makeKnowledge([]);
    const result = computeRecommendations(texts, knowledge, {
      readingProgress: [{ textId: 'finished', lastPosition: 100 }],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fresh');
  });

  it('prefers active language', () => {
    const texts = [
      makeText({ id: 'greek', language: 'grc', percentKnownUnique: 90 }),
      makeText({ id: 'latin', language: 'lat', percentKnownUnique: 90 }),
    ];
    const knowledge = makeKnowledge([]);
    const result = computeRecommendations(texts, knowledge, { activeLanguageId: 'lat' });
    expect(result[0].id).toBe('latin');
  });

  it('includes recommendation reason', () => {
    const texts = [makeText({ id: 'text1', percentKnownUnique: 91 })];
    const knowledge = makeKnowledge([]);
    const result = computeRecommendations(texts, knowledge);
    expect(result[0].reason).toBeTruthy();
    expect(result[0].difficultyLabel).toBe('justRight');
  });

  it('limits results', () => {
    const texts = Array.from({ length: 10 }, (_, i) =>
      makeText({ id: `text-${i}`, percentKnownUnique: 88 + (i % 5) })
    );
    const knowledge = makeKnowledge([]);
    const result = computeRecommendations(texts, knowledge, { limit: 3 });
    expect(result).toHaveLength(3);
  });

  it('returns difficulty labels correctly', () => {
    const texts = [
      makeText({ id: 'easy', percentKnownUnique: 96 }),
      makeText({ id: 'right', percentKnownUnique: 90 }),
      makeText({ id: 'stretch', percentKnownUnique: 78 }),
    ];
    const knowledge = makeKnowledge([]);
    const result = computeRecommendations(texts, knowledge);
    const labels = new Map(result.map((r) => [r.id, r.difficultyLabel]));
    expect(labels.get('easy')).toBe('easy');
    expect(labels.get('right')).toBe('justRight');
    expect(labels.get('stretch')).toBe('stretch');
  });
});

describe('getTopRecommendation', () => {
  it('returns null when no texts match', () => {
    const result = getTopRecommendation([], makeKnowledge([]));
    expect(result).toBeNull();
  });

  it('returns the best single recommendation', () => {
    const texts = [
      makeText({ id: 'good', percentKnownUnique: 90, language: 'grc' }),
      makeText({ id: 'ok', percentKnownUnique: 85, language: 'grc' }),
    ];
    const knowledge = makeKnowledge([{ key: 'test', lang: 'grc', state: 'KNOWN' }]);
    const result = getTopRecommendation(texts, knowledge, { activeLanguageId: 'grc' });
    expect(result).not.toBeNull();
    expect(result!.id).toBe('good');
  });
});

describe('pickDashboardRecommendation', () => {
  it('picks the text closest to the sweet spot', () => {
    const texts = [
      { id: 't1', title: 'Text 1', language: 'grc', sectionsPreview: [] },
      { id: 't2', title: 'Text 2', language: 'grc', sectionsPreview: [] },
    ];
    const knowledge = makeKnowledge(
      Array.from({ length: 90 }, (_, i) => ({
        key: `word${i}`,
        lang: 'grc',
        state: 'KNOWN',
      }))
    );

    const getTokens = (text: any) => {
      if (text.id === 't1') {
        return Array.from({ length: 100 }, (_, i) => ({
          lemma: `word${i}`,
          text: `word${i}`,
        }));
      }
      return Array.from({ length: 100 }, (_, i) => ({
        lemma: `rare${i}`,
        text: `rare${i}`,
      }));
    };

    const result = pickDashboardRecommendation(
      texts,
      knowledge,
      'grc',
      new Set(),
      getTokens
    );
    expect(result).not.toBeNull();
    expect(result!.id).toBe('t1');
    expect(result!.percentKnown).toBe(90);
  });

  it('skips started texts', () => {
    const texts = [
      { id: 'started', title: 'Started', language: 'grc', sectionsPreview: [] },
    ];
    const knowledge = makeKnowledge([]);
    const result = pickDashboardRecommendation(
      texts,
      knowledge,
      'grc',
      new Set(['started']),
      () => Array.from({ length: 10 }, (_, i) => ({ lemma: `w${i}`, text: `w${i}` }))
    );
    expect(result).toBeNull();
  });
});
