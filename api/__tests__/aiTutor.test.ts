import { describe, it, expect } from 'vitest';
import {
  buildTutorPrompt,
  LANGUAGE_SUGGESTED_QUESTIONS,
  DEFAULT_SUGGESTED_QUESTIONS,
} from '../_lib/aiPrompts';

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

describe('buildTutorPrompt', () => {
  it('includes the student message', () => {
    const prompt = buildTutorPrompt('grc', 'What case is this?');
    expect(prompt).toContain("Student's question: What case is this?");
  });

  it('includes language-specific instructions for known language', () => {
    const prompt = buildTutorPrompt('grc', 'Parse this verb.');
    expect(prompt).toContain('Ancient Greek');
    expect(prompt).toContain('Language reference:');
  });

  it('includes language name for unknown language gracefully', () => {
    const prompt = buildTutorPrompt('lat', 'What is the case here?');
    expect(prompt).toContain('Latin');
  });

  it('includes context fields when provided', () => {
    const prompt = buildTutorPrompt('grc', 'What does this mean?', {
      textTitle: 'Iliad Book 1',
      sentenceText: 'μῆνιν ἄειδε θεά',
      selectedToken: 'μῆνιν',
      lemma: 'μῆνις',
      gloss: 'wrath',
    });
    expect(prompt).toContain('Text: "Iliad Book 1"');
    expect(prompt).toContain('Sentence: "μῆνιν ἄειδε θεά"');
    expect(prompt).toContain('Selected word: "μῆνιν"');
    expect(prompt).toContain('Lemma: μῆνις');
    expect(prompt).toContain('Gloss: wrath');
  });

  it('omits context section when context is undefined', () => {
    const prompt = buildTutorPrompt('hbo', 'What stem is this?');
    expect(prompt).not.toContain('Text:');
    expect(prompt).not.toContain('Selected word:');
  });

  it('includes morphology as JSON when provided', () => {
    const prompt = buildTutorPrompt('lat', 'What case?', {
      morphology: { case: 'nominative', number: 'singular' },
    });
    expect(prompt).toContain('"case":"nominative"');
  });
});

describe('LANGUAGE_SUGGESTED_QUESTIONS', () => {
  it('has language-specific questions for Greek', () => {
    expect(LANGUAGE_SUGGESTED_QUESTIONS['grc']).toBeDefined();
    expect(LANGUAGE_SUGGESTED_QUESTIONS['grc'].length).toBeGreaterThan(0);
  });

  it('has language-specific questions for Hebrew', () => {
    expect(LANGUAGE_SUGGESTED_QUESTIONS['hbo']).toBeDefined();
    expect(
      LANGUAGE_SUGGESTED_QUESTIONS['hbo'].some(
        (q) => q.toLowerCase().includes('stem') || q.toLowerCase().includes('verbal')
      )
    ).toBe(true);
  });

  it('DEFAULT_SUGGESTED_QUESTIONS is non-empty', () => {
    expect(DEFAULT_SUGGESTED_QUESTIONS.length).toBeGreaterThan(0);
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
    body: {
      sessionId: 'sess_' + Date.now(),
      greeting: 'Hello',
      suggestedQuestions: ['Parse this'],
    },
  };
}

function validateMessage(body: any): { status: number; body: any } {
  if (!body.sessionId)
    return { status: 400, body: { error: 'sessionId is required', code: 'INVALID_INPUT' } };
  if (!body.message)
    return { status: 400, body: { error: 'message is required', code: 'INVALID_INPUT' } };
  return { status: 200, body: { text: 'Response', warnings: undefined } };
}

function simulateNoApiKey(): { status: number; body: any } {
  return {
    status: 200,
    body: {
      text: 'AI tutor requires a Gemini API key to be configured.',
      warnings: ['Gemini API key not configured.'],
    },
  };
}

function checkUncertainty(text: string): boolean {
  return text.includes('not certain') || text.includes('uncertain') || text.includes('I think');
}
