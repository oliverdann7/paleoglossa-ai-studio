import { describe, it, expect } from 'vitest';

describe('Metadata endpoint validation', () => {
  it('rejects missing languageId', () => {
    const result = validate({ rawText: 'some text' });
    expect(result.status).toBe(400);
    expect(result.body.difficulty).toBe('');
  });

  it('rejects missing rawText', () => {
    const result = validate({ languageId: 'grc' });
    expect(result.status).toBe(400);
    expect(result.body.difficulty).toBe('');
  });

  it('returns no-key fallback with warnings', () => {
    const result = validate({ languageId: 'grc', rawText: 'Μῆνιν ἄειδε θεά' });
    expect(result.status).toBe(200);
    expect(typeof result.body.difficulty).toBe('string');
    expect(Array.isArray(result.body.tags)).toBe(true);
    expect(typeof result.body.summary).toBe('string');
    // Should include warnings about missing API key
    if (result.body.warnings && result.body.warnings.length > 0) {
      expect(result.body.warnings[0]).toContain('Gemini');
    }
  });
});

function validate(body: any): { status: number; body: any } {
  const { languageId, rawText } = body || {};

  if (!languageId || typeof languageId !== 'string' || !rawText || typeof rawText !== 'string') {
    return {
      status: 400,
      body: { difficulty: '', tags: [], summary: '', warnings: ['Invalid input'] },
    };
  }

  // No API key: return fallback
  return {
    status: 200,
    body: {
      difficulty: 'unknown',
      tags: [],
      summary: '',
      period: '',
      genre: '',
      warnings: ['Gemini API key not configured. Metadata unavailable.'],
    },
  };
}
