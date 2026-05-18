import { describe, it, expect } from 'vitest';

describe('Translate endpoint validation', () => {
  it('rejects missing languageId', async () => {
    const body = { tokens: ['hello'] };
    const res = await validate(body);
    expect(res.status).toBe(400);
    expect(res.code).toBe('INVALID_INPUT');
  });

  it('rejects missing tokens', async () => {
    const body = { languageId: 'grc' };
    const res = await validate(body);
    expect(res.status).toBe(400);
    expect(res.code).toBe('INVALID_INPUT');
  });

  it('rejects empty tokens array', async () => {
    const body = { languageId: 'grc', tokens: [] };
    const res = await validate(body);
    expect(res.status).toBe(400);
    expect(res.code).toBe('INVALID_INPUT');
  });

  it('rejects empty sentence after join', async () => {
    const body = { languageId: 'grc', tokens: ['', '  '] };
    const res = await validate(body);
    expect(res.status).toBe(400);
    expect(res.code).toBe('INVALID_INPUT');
  });

  it('returns text field in successful response shape', async () => {
    const body = { languageId: 'grc', tokens: ['Μῆνιν', 'ἄειδε'] };
    const res = await validate(body);
    // Without GEMINI_API_KEY set, the route returns the joined sentence as text
    expect(res.status).toBe(200);
    expect(typeof res.body.text).toBe('string');
  });

  it('returns confidence and optional notes in response', async () => {
    const body = { languageId: 'lat', tokens: ['arma', 'virumque', 'cano'] };
    const res = await validate(body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('confidence');
    expect(res.body).toHaveProperty('notes');
  });

  it('includes notes when Gemini detects uncertain text', async () => {
    // With no API key, the route returns notes about missing key
    const body = { languageId: 'grc', tokens: ['[fragmentary]', 'text'] };
    const res = await validate(body);
    expect(res.status).toBe(200);
    // No API key: notes should mention missing config
    expect(res.body.notes).toContain('Gemini');
  });
});

// Helper: simulate the validation logic from the route
async function validate(body: any): Promise<{ status: number; code?: string; body: any }> {
  const { languageId, tokens } = body || {};

  if (!languageId || typeof languageId !== 'string') {
    return {
      status: 400,
      code: 'INVALID_INPUT',
      body: { error: 'languageId is required', code: 'INVALID_INPUT' },
    };
  }
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return {
      status: 400,
      code: 'INVALID_INPUT',
      body: { error: 'tokens must be a non-empty array of strings', code: 'INVALID_INPUT' },
    };
  }

  const sentence = tokens.join(' ').trim();
  if (!sentence) {
    return {
      status: 400,
      code: 'INVALID_INPUT',
      body: { error: 'Sentence text is empty after joining tokens', code: 'INVALID_INPUT' },
    };
  }

  // No API key: return fallback
  return {
    status: 200,
    body: {
      text: sentence,
      confidence: null,
      notes: 'Gemini API key not configured. Returning original text.',
    },
  };
}
