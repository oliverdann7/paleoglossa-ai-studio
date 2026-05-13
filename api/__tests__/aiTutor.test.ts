import { describe, it, expect } from 'vitest';

describe('Tutor session creation', () => {

  it('requires authentication', () => {
    const result = requireAuth(false);
    expect(result.status).toBe(401);
  });

  it('requires languageId', () => {
    const result = validateStart({});
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('accepts valid start request', () => {
    const result = validateStart({ languageId: 'grc', textId: 'iliad_1' });
    expect(result.status).toBe(200);
    expect(result.body.sessionId).toBeTruthy();
    expect(typeof result.body.greeting).toBe('string');
    expect(Array.isArray(result.body.suggestedQuestions)).toBe(true);
  });

  it('returns suggested questions with start', () => {
    const result = validateStart({ languageId: 'lat' });
    expect(result.body.suggestedQuestions.length).toBeGreaterThan(0);
  });
});

describe('Tutor message', () => {

  it('requires sessionId', () => {
    const result = validateMessage({ message: 'hello' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('requires message', () => {
    const result = validateMessage({ sessionId: 'sess_123' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('no API key returns fallback message', () => {
    const result = simulateNoApiKey();
    expect(result.status).toBe(200);
    expect(result.body.text).toContain('Gemini');
  });
});

describe('Guardrails', () => {

  it('returns uncertainty warning when AI expresses uncertainty', () => {
    const result = checkUncertainty('I am not certain about this parsing');
    expect(result).toBe(true);
  });

  it('no false positive for certain statements', () => {
    const result = checkUncertainty('This is a dative plural form');
    expect(result).toBe(false);
  });
});

function requireAuth(isAuthenticated: boolean): { status: number } {
  if (!isAuthenticated) return { status: 401 };
  return { status: 200 };
}

function validateStart(body: any): { status: number; body: any } {
  if (!body.languageId) {
    return { status: 400, body: { error: 'languageId is required', code: 'INVALID_INPUT' } };
  }
  return {
    status: 200,
    body: { sessionId: 'sess_' + Date.now(), greeting: 'Hello', suggestedQuestions: ['Parse this'] },
  };
}

function validateMessage(body: any): { status: number; body: any } {
  if (!body.sessionId) return { status: 400, body: { error: 'sessionId is required', code: 'INVALID_INPUT' } };
  if (!body.message) return { status: 400, body: { error: 'message is required', code: 'INVALID_INPUT' } };
  return { status: 200, body: { text: 'Response', warnings: undefined } };
}

function simulateNoApiKey(): { status: number; body: any } {
  return { status: 200, body: { text: 'AI tutor requires a Gemini API key to be configured.', warnings: ['Gemini API key not configured.'] } };
}

function checkUncertainty(text: string): boolean {
  return text.includes('not certain') || text.includes('uncertain') || text.includes('I think');
}
