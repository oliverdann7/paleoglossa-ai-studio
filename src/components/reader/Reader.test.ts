import { describe, it, expect } from 'vitest';
import { CorpusDB, ILIAD_1_1 } from '../../data/corpus.js';
import { WordState, STATE_COLORS } from '../../lib/constants/wordStates.js';
import { getTransliteration } from '../../lib/transliterate.js';

describe('Reader smoke tests', () => {
  it('ancient texts load from CorpusDB', () => {
    const texts = CorpusDB.getTexts();
    expect(texts.length).toBeGreaterThan(0);
  });

  it('Iliad 1.1 loads with tokens', () => {
    const text = ILIAD_1_1;
    expect(text).toBeDefined();
    expect(text.sentences.length).toBeGreaterThan(0);
    expect(text.sentences[0].tokens.length).toBeGreaterThan(0);
  });

  it('tokens have required fields', () => {
    const text = ILIAD_1_1;
    const token = text.sentences[0].tokens[0];
    expect(token).toHaveProperty('surface');
    expect(token).toHaveProperty('lemma');
    expect(token).toHaveProperty('gloss');
    expect(token).toHaveProperty('morphology');
  });

  it('WordState constants have correct shape', () => {
    expect(STATE_COLORS[WordState.NEW]).toBeDefined();
    expect(STATE_COLORS[WordState.KNOWN]).toBeDefined();
    expect(STATE_COLORS[WordState.LEARNING]).toBeDefined();
  });

  it('getTransliteration returns a string for known text', () => {
    const result = getTransliteration('μῆνιν', 'grc');
    expect(typeof result).toBe('string');
  });
});
