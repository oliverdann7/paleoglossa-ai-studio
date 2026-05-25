import { describe, it, expect } from 'vitest';
import { sanitizeEventProperties, ANALYTICS_EVENTS } from '../analytics.js';

// ─── sanitizeEventProperties ──────────────────────────────────────────────────

describe('sanitizeEventProperties', () => {
  it('strips known unsafe field names', () => {
    const input = {
      languageId: 'grc',
      textId: 'plato-apology',
      wordCount: 42,
      fullText: 'Οὐκ οἶδα',
      rawContent: 'sensitive import content',
      notes: 'my private note',
      aiPrompt: 'analyze this text',
      aiResponse: 'some ai output',
      manuscriptContent: 'secret manuscript',
      password: 'hunter2',
      apiKey: 'sk-1234',
    };

    const result = sanitizeEventProperties(input);

    expect(result.languageId).toBe('grc');
    expect(result.textId).toBe('plato-apology');
    expect(result.wordCount).toBe(42);

    // Strip unsafe
    expect(result.fullText).toBeUndefined();
    expect(result.rawContent).toBeUndefined();
    expect(result.notes).toBeUndefined();
    expect(result.aiPrompt).toBeUndefined();
    expect(result.aiResponse).toBeUndefined();
    expect(result.manuscriptContent).toBeUndefined();
    expect(result.password).toBeUndefined();
    expect(result.apiKey).toBeUndefined();
  });

  it('strips string values longer than 500 chars', () => {
    const longString = 'x'.repeat(501);
    const input = {
      languageId: 'lat',
      description: longString,
      wordCount: 10,
    };

    const result = sanitizeEventProperties(input);

    expect(result.languageId).toBe('lat');
    expect(result.description).toBeUndefined();
    expect(result.wordCount).toBe(10);
  });

  it('preserves safe fields', () => {
    const input = {
      languageId: 'hbo',
      textId: 'psalms-1',
      sourceKind: 'complete',
      analysisStatus: 'analyzed',
      wordCount: 500,
      knownPercent: 42,
      lemmaLength: 5,
      hasGloss: true,
      hasMorphology: false,
      currentState: 'KNOWN',
      fromState: 'LEARNING',
      toState: 'KNOWN',
      cardCount: 20,
      cardsReviewed: 20,
      correctCount: 15,
      accuracyPercent: 75,
      durationMs: 120000,
      sourceType: 'paste',
      totalWords: 1000,
      uniqueWords: 400,
      generationType: 'short-gloss',
      cacheType: 'short-gloss',
      success: true,
      textFilterActive: false,
    };

    const result = sanitizeEventProperties(input);

    for (const [key, value] of Object.entries(input)) {
      expect(result[key]).toBe(value);
    }
  });

  it('strips keys starting with raw or user_', () => {
    const input = {
      languageId: 'grc',
      rawText: 'some raw text',
      raw_output: 'raw output',
      user_gloss: 'my gloss',
      user_input: 'user typed this',
    };

    const result = sanitizeEventProperties(input);

    expect(result.languageId).toBe('grc');
    expect(result.rawText).toBeUndefined();
    expect(result.raw_output).toBeUndefined();
    expect(result.user_gloss).toBeUndefined();
    expect(result.user_input).toBeUndefined();
  });
});

// ─── ANALYTICS_EVENTS are defined ─────────────────────────────────────────────

describe('ANALYTICS_EVENTS', () => {
  it('has all expected event names', () => {
    expect(ANALYTICS_EVENTS.READER_OPENED).toBe('reader_opened');
    expect(ANALYTICS_EVENTS.WORD_CLICKED).toBe('word_clicked');
    expect(ANALYTICS_EVENTS.WORD_GLOSS_SAVED).toBe('word_gloss_saved');
    expect(ANALYTICS_EVENTS.WORD_STATE_CHANGED).toBe('word_state_changed');
    expect(ANALYTICS_EVENTS.REVIEW_STARTED).toBe('review_started');
    expect(ANALYTICS_EVENTS.REVIEW_COMPLETED).toBe('review_completed');
    expect(ANALYTICS_EVENTS.IMPORT_STARTED).toBe('import_started');
    expect(ANALYTICS_EVENTS.IMPORT_COMPLETED).toBe('import_completed');
    expect(ANALYTICS_EVENTS.AI_GLOSS_CACHE_HIT).toBe('ai_gloss_cache_hit');
    expect(ANALYTICS_EVENTS.AI_GLOSS_CACHE_MISS).toBe('ai_gloss_cache_miss');
    expect(ANALYTICS_EVENTS.AI_GLOSS_GENERATED).toBe('ai_gloss_generated');
  });
});

// ─── toSafeError tests ────────────────────────────────────────────────────────

describe('toSafeError', () => {
  it('handles ApiError-shaped objects', async () => {
    const { toSafeError } = await import('../../../api/_lib/observability.js');
    const err = {
      message: 'Not found',
      status: 404,
      code: 'NOT_FOUND',
      body: { details: 'missing document' },
    };
    const result = toSafeError(err, 'corr-123');
    expect(result.message).toBe('Not found');
    expect(result.code).toBe('NOT_FOUND');
    expect(result.correlationId).toBe('corr-123');
    expect(result.status).toBe(404);
  });

  it('handles Error instances', async () => {
    const { toSafeError } = await import('../../../api/_lib/observability.js');
    const err = new Error('Database connection refused');
    const result = toSafeError(err, 'corr-456');
    expect(result.message).toBe('Database connection refused');
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.correlationId).toBe('corr-456');
  });

  it('handles unknown values', async () => {
    const { toSafeError } = await import('../../../api/_lib/observability.js');
    const result = toSafeError('some string', 'corr-789');
    expect(result.message).toBe('Unknown error');
    expect(result.code).toBe('UNKNOWN');
    expect(result.correlationId).toBe('corr-789');
  });
});
