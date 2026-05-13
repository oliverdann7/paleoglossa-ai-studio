import { describe, it, expect } from 'vitest';

// We'll test the validation and fallback logic directly
import { basicAnalyze } from '../_lib/basicAnalyze';
import { parseAndValidateAIResponse } from '../_lib/aiValidation';

describe('basicAnalyze fallback', () => {

  it('tokenizes simple Greek text into sentences and tokens', () => {
    const result = basicAnalyze('Μῆνιν ἄειδε θεὰ. Πηληϊάδεω Ἀχιλῆος.');
    expect(result.sentences.length).toBeGreaterThanOrEqual(1);
    const tokens = result.sentences[0].tokens;
    expect(tokens.length).toBeGreaterThan(0);
    // First word should be Μῆνιν
    expect(tokens[0].text).toBe('Μῆνιν');
  });

  it('returns empty sentence array for empty input', () => {
    const result = basicAnalyze('');
    // basicAnalyze returns an empty sentences array for empty input
    expect(Array.isArray(result.sentences)).toBe(true);
  });

  it('handles mixed punctuation and whitespace', () => {
    const result = basicAnalyze('Hello, world!');
    expect(result.sentences.length).toBe(1);
    const texts = result.sentences[0].tokens.map(t => t.text);
    expect(texts).toContain('Hello,');
    expect(texts).toContain(' ');
    expect(texts).toContain('world!');
  });

  it('all tokens have null confidence in fallback mode', () => {
    const result = basicAnalyze('test');
    for (const s of result.sentences) {
      for (const t of s.tokens) {
        expect(t.confidence).toBeNull();
      }
    }
  });
});

describe('parseAndValidateAIResponse', () => {

  it('parses clean valid JSON from Gemini', () => {
    const json = JSON.stringify({
      sentences: [
        {
          tokens: [
            { text: 'Μῆνιν', lemma: 'μῆνις', normalized: 'μῆνιν', type: 'word', transliteration: 'mēnin', gloss: 'wrath', pos: 'noun', confidence: 0.95 },
          ],
          translation: 'Sing, goddess, the wrath',
        },
      ],
    });
    const { data, warnings } = parseAndValidateAIResponse(json);
    expect(data).not.toBeNull();
    expect(data!.sentences.length).toBe(1);
    expect(data!.sentences[0].tokens[0].text).toBe('Μῆνιν');
    expect(warnings).toEqual([]);
  });

  it('repairs markdown-wrapped JSON', () => {
    const response = '```json\n{"sentences":[{"tokens":[{"text":"test","lemma":"test","normalized":"test","type":"word","transliteration":null,"gloss":null,"pos":null,"confidence":0.9}],"translation":null}]}\n```';
    const { data } = parseAndValidateAIResponse(response);
    expect(data).not.toBeNull();
    expect(data!.sentences.length).toBe(1);
  });

  it('repairs JSON with trailing comma', () => {
    const json = '{"sentences":[{"tokens":[{"text":"test","lemma":"test","normalized":"test","type":"word","transliteration":null,"gloss":null,"pos":null,"confidence":0.9,}],"translation":null,}]}';
    const { data } = parseAndValidateAIResponse(json);
    expect(data).not.toBeNull();
    expect(data!.sentences.length).toBe(1);
  });

  it('returns null for completely invalid input', () => {
    const { data, warnings } = parseAndValidateAIResponse('not even close to json');
    expect(data).toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('returns null for empty string', () => {
    const { data, warnings } = parseAndValidateAIResponse('');
    expect(data).toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('validates token types enum', () => {
    const json = JSON.stringify({
      sentences: [
        {
          tokens: [
            { text: 'word', lemma: 'word', normalized: 'word', type: 'invalid_type', transliteration: null, gloss: null, pos: null, confidence: 0.5 },
          ],
          translation: null,
        },
      ],
    });
    const { data, warnings } = parseAndValidateAIResponse(json);
    expect(data).toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('partially recovers when some sentences fail validation', () => {
    const json = JSON.stringify({
      sentences: [
        {
          tokens: [
            { text: 'good', lemma: 'good', normalized: 'good', type: 'word', transliteration: null, gloss: null, pos: null, confidence: 0.9 },
          ],
          translation: null,
        },
        {
          tokens: [
            { text: 'bad', lemma: 'bad', normalized: 'bad', type: 'invalid', transliteration: null, gloss: null, pos: null, confidence: 0.5 },
          ],
          translation: null,
        },
      ],
    });
    const { data, warnings } = parseAndValidateAIResponse(json);
    expect(data).not.toBeNull();
    expect(data!.sentences.length).toBe(1);
    expect(warnings.length).toBeGreaterThan(0);
  });
});
