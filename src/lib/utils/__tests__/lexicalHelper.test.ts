import { describe, it, expect } from 'vitest';
import { isUsefulGloss, sentLex } from '../lexicalHelper.js';

describe('isUsefulGloss', () => {
  it('rejects null and undefined', () => {
    expect(isUsefulGloss(null)).toBe(false);
    expect(isUsefulGloss(undefined)).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isUsefulGloss('')).toBe(false);
    expect(isUsefulGloss('   ')).toBe(false);
  });

  it('rejects known error messages', () => {
    expect(isUsefulGloss('unknown word')).toBe(false);
    expect(isUsefulGloss('Unknown')).toBe(false);
    expect(isUsefulGloss('unknown word: foo')).toBe(false);
    expect(isUsefulGloss('no explanation available')).toBe(false);
    expect(isUsefulGloss('failed to fetch gloss')).toBe(false);
    expect(isUsefulGloss('ai explanation not available')).toBe(false);
    expect(isUsefulGloss('Gemini API key not configured')).toBe(false);
    expect(isUsefulGloss('ai service error')).toBe(false);
    expect(isUsefulGloss('request timed out')).toBe(false);
  });

  it('accepts valid gloss strings', () => {
    expect(isUsefulGloss('love')).toBe(true);
    expect(isUsefulGloss('to walk')).toBe(true);
    expect(isUsefulGloss('great, large')).toBe(true);
    expect(isUsefulGloss('man, human')).toBe(true);
  });
});

describe('sentLex', () => {
  const lexicon = {
    λόγος: { lemma: 'λόγος', gloss: 'word', partOfSpeech: 'noun' },
    ἐν: { lemma: 'ἐν', gloss: 'in', partOfSpeech: 'preposition' },
  };

  it('creates tokens with hints when available', () => {
    const sentence = sentLex('test-1', ['λόγος', 'ἐν'], 'Word in.', lexicon);
    expect(sentence.id).toBe('test-1');
    expect(sentence.tokens).toHaveLength(2);

    expect(sentence.tokens[0].lemma).toBe('λόγος');
    expect(sentence.tokens[0].gloss).toBe('word');
    expect(sentence.tokens[0].morphology.partOfSpeech).toBe('noun');

    expect(sentence.tokens[1].lemma).toBe('ἐν');
    expect(sentence.tokens[1].gloss).toBe('in');
    expect(sentence.tokens[1].morphology.partOfSpeech).toBe('preposition');
  });

  it('defaults to empty gloss and unknown pos when no hint', () => {
    const sentence = sentLex('test-2', ['ἄγνωστος'], 'Unknown.', lexicon);
    expect(sentence.tokens[0].lemma).toBe('αγνωστος');
    expect(sentence.tokens[0].gloss).toBe('');
    expect(sentence.tokens[0].morphology.partOfSpeech).toBe('unknown');
  });

  it('adds ids, punctBefore, and punctAfter', () => {
    const sentence = sentLex('test-3', ['λόγος,'], 'Word.', lexicon);
    expect(sentence.tokens[0].id).toBe('test-3-t0');
    expect(sentence.tokens[0].surface).toBe('λόγος,');
    expect(sentence.tokens[0].punctBefore).toBe('');
    expect(sentence.tokens[0].punctAfter).toBe(', ');
  });
});
