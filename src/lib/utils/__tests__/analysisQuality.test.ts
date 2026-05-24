import { describe, it, expect } from 'vitest';
import { computeAnalysisQuality } from '../analysisQuality';

describe('computeAnalysisQuality', () => {
  it('returns full for analyzed text with 100% gloss and morphology coverage', () => {
    const result = computeAnalysisQuality(
      [
        {
          tokens: [
            { type: 'word', gloss: 'love', pos: 'noun', confidence: 0.95 },
            { type: 'word', gloss: 'word', pos: 'noun', confidence: 0.9 },
            { type: 'punctuation', gloss: null, pos: null },
          ],
        },
      ],
      'analyzed'
    );
    expect(result.level).toBe('full');
    expect(result.glossCoverage).toBe(100);
    expect(result.morphologyCoverage).toBe(100);
    expect(result.averageConfidence).toBeCloseTo(0.925);
    expect(result.warnings).toBeUndefined();
  });

  it('returns raw for basic tokenization with no gloss or pos', () => {
    const result = computeAnalysisQuality(
      [
        {
          tokens: [
            { type: 'word', gloss: null, pos: null, confidence: null },
            { type: 'word', gloss: null, pos: null, confidence: null },
          ],
        },
      ],
      'raw'
    );
    expect(result.level).toBe('raw');
    expect(result.glossCoverage).toBe(0);
    expect(result.morphologyCoverage).toBe(0);
    expect(result.averageConfidence).toBeNull();
    expect(result.warnings).toBeDefined();
    expect(result.warnings![0]).toContain('not linguistically analyzed');
  });

  it('does not pretend raw tokens have meanings', () => {
    const result = computeAnalysisQuality(
      [
        {
          tokens: [
            { type: 'word', gloss: null, pos: null },
            { type: 'word', gloss: null, pos: null },
          ],
        },
      ],
      'raw'
    );
    expect(result.level).toBe('raw');
    expect(result.glossCoverage).toBe(0);
  });

  it('returns partial for analyzed text with incomplete coverage', () => {
    const result = computeAnalysisQuality(
      [
        {
          tokens: [
            { type: 'word', gloss: 'love', pos: null, confidence: 0.8 },
            { type: 'word', gloss: null, pos: 'verb', confidence: null },
          ],
        },
      ],
      'analyzed'
    );
    expect(result.level).toBe('partial');
    expect(result.glossCoverage).toBe(50);
    expect(result.morphologyCoverage).toBe(50);
  });

  it('handles empty token array', () => {
    const result = computeAnalysisQuality([{ tokens: [] }], 'analyzed');
    expect(result.level).toBe('raw');
    expect(result.glossCoverage).toBe(0);
    expect(result.morphologyCoverage).toBe(0);
  });

  it('excludes non-word tokens from coverage calculation', () => {
    const result = computeAnalysisQuality(
      [
        {
          tokens: [
            { type: 'word', gloss: 'love', pos: 'noun' },
            { type: 'punctuation', gloss: null, pos: null },
            { type: 'word', gloss: 'word', pos: 'noun' },
          ],
        },
      ],
      'analyzed'
    );
    expect(result.level).toBe('full');
    expect(result.glossCoverage).toBe(100);
    expect(result.morphologyCoverage).toBe(100);
  });
});
