import { describe, it, expect } from 'vitest';
import { getSourceTrust } from '../sourceTrust';

describe('getSourceTrust', () => {
  it('maps user_gloss to high trust with green styling', () => {
    const result = getSourceTrust('user_gloss');
    expect(result.trust).toBe('high');
    expect(result.label).toBe('Your Gloss');
    expect(result.dotColor).toBe('#10B981');
    expect(result.textColor).toBe('text-green-700');
  });

  it('maps corpus_derived to high trust with blue styling', () => {
    const result = getSourceTrust('corpus_derived');
    expect(result.trust).toBe('high');
    expect(result.label).toBe('Dictionary');
    expect(result.dotColor).toBe('#3B82F6');
  });

  it('maps static_dictionary to high trust with blue styling', () => {
    const result = getSourceTrust('static_dictionary');
    expect(result.trust).toBe('high');
    expect(result.label).toBe('Dictionary');
  });

  it('maps token_gloss to medium trust with amber styling', () => {
    const result = getSourceTrust('token_gloss');
    expect(result.trust).toBe('medium');
    expect(result.label).toBe('Token gloss');
    expect(result.dotColor).toBe('#D97706');
  });

  it('maps corpus_global to medium trust with amber styling', () => {
    const result = getSourceTrust('corpus_global');
    expect(result.trust).toBe('medium');
    expect(result.label).toBe('Corpus');
    expect(result.dotColor).toBe('#D97706');
  });

  it('maps wiktionary to medium trust with purple styling', () => {
    const result = getSourceTrust('wiktionary');
    expect(result.trust).toBe('medium');
    expect(result.label).toBe('Wiktionary');
    expect(result.dotColor).toBe('#8B5CF6');
  });

  it('maps ai_explanation to low trust with amber styling', () => {
    const result = getSourceTrust('ai_explanation');
    expect(result.trust).toBe('low');
    expect(result.label).toBe('AI Suggestion');
    expect(result.dotColor).toBe('#D97706');
  });

  it('maps ai_fallback to low trust with amber styling', () => {
    const result = getSourceTrust('ai_fallback');
    expect(result.trust).toBe('low');
    expect(result.label).toBe('AI Suggestion');
    expect(result.dotColor).toBe('#D97706');
  });

  it('maps metadata to low trust with gray styling', () => {
    const result = getSourceTrust('metadata');
    expect(result.trust).toBe('low');
    expect(result.label).toBe('Token metadata');
    expect(result.dotColor).toBe('#9CA3AF');
  });

  it('maps unavailable to unknown trust with gray styling', () => {
    const result = getSourceTrust('unavailable');
    expect(result.trust).toBe('unknown');
    expect(result.label).toBe('Unavailable');
    expect(result.dotColor).toBe('#9CA3AF');
  });

  it('does not crash on unknown source', () => {
    const result = getSourceTrust('nonexistent_source');
    expect(result.trust).toBe('unknown');
    expect(result.label).toBe('Unknown');
    expect(result.dotColor).toBe('#9CA3AF');
  });

  it('does not crash on empty string', () => {
    const result = getSourceTrust('');
    expect(result.trust).toBe('unknown');
    expect(result.label).toBe('Unknown');
  });

  it('all returned values have all required fields', () => {
    for (const source of [
      'user_gloss',
      'corpus_derived',
      'static_dictionary',
      'corpus_global',
      'token_gloss',
      'ai_explanation',
      'wiktionary',
      'ai_fallback',
      'metadata',
      'unavailable',
      'bogus',
    ]) {
      const result = getSourceTrust(source);
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('trust');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('dotColor');
      expect(result).toHaveProperty('textColor');
      expect(['high', 'medium', 'low', 'unknown']).toContain(result.trust);
    }
  });
});
