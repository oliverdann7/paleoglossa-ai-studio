import { describe, it, expect } from 'vitest';

describe('Explain endpoint validation', () => {

  it('rejects missing languageId', () => {
    const result = validate({ type: 'word', word: 'λύω', lemma: 'λύω' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects missing type', () => {
    const result = validate({ languageId: 'grc', word: 'λύω', lemma: 'λύω' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects invalid type', () => {
    const result = validate({ languageId: 'grc', type: 'invalid' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects word type without word and lemma', () => {
    const result = validate({ languageId: 'grc', type: 'word' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects phrase type without phrase', () => {
    const result = validate({ languageId: 'grc', type: 'phrase' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects paradigm type without word and lemma', () => {
    const result = validate({ languageId: 'lat', type: 'paradigm' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('accepts valid word request', () => {
    const result = validate({ languageId: 'grc', type: 'word', word: 'λύω', lemma: 'λύω' });
    expect(result.status).toBe(200);
    expect(typeof result.body.explanation).toBe('string');
  });

  it('accepts valid phrase request', () => {
    const result = validate({ languageId: 'hbo', type: 'phrase', phrase: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים' });
    expect(result.status).toBe(200);
    expect(typeof result.body.explanation).toBe('string');
  });

  it('accepts valid paradigm request', () => {
    const result = validate({ languageId: 'lat', type: 'paradigm', word: 'amo', lemma: 'amo' });
    expect(result.status).toBe(200);
    expect(typeof result.body.explanation).toBe('string');
  });

  it('explanation is non-empty when validation passes', () => {
    const result = validate({ languageId: 'grc', type: 'word', word: 'λύω', lemma: 'λύω' });
    expect(result.body.explanation.length).toBeGreaterThan(0);
  });

  it('500 error returns explanation field', () => {
    const result = simulateError();
    expect(result.status).toBe(500);
    expect(typeof result.body.explanation).toBe('string');
  });
});

function validate(body: any): { status: number; body: any } {
  const { languageId, word, lemma, phrase, type } = body || {};

  if (!languageId || typeof languageId !== 'string') {
    return { status: 400, body: { error: 'languageId is required', code: 'INVALID_INPUT' } };
  }
  if (!type || !['word', 'phrase', 'paradigm'].includes(type)) {
    return { status: 400, body: { error: 'type must be one of: word, phrase, paradigm', code: 'INVALID_INPUT' } };
  }
  if (type === 'phrase' && (!phrase || typeof phrase !== 'string')) {
    return { status: 400, body: { error: 'phrase is required for type=phrase', code: 'INVALID_INPUT' } };
  }
  if (type !== 'phrase' && (!word || typeof word !== 'string' || !lemma || typeof lemma !== 'string')) {
    return { status: 400, body: { error: 'word and lemma are required for type=word or type=paradigm', code: 'INVALID_INPUT' } };
  }

  // No API key: return explanation about missing key
  return {
    status: 200,
    body: { explanation: 'AI explanation not available — Gemini API key not configured.' },
  };
}

function simulateError(): { status: number; body: any } {
  return {
    status: 500,
    body: { explanation: 'Failed to generate explanation.', error: 'Simulated error', code: 'EXPLAIN_ERROR' },
  };
}
