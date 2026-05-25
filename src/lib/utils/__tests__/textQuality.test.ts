import { describe, it, expect } from 'vitest';
import {
  getTextQuality,
  getTextQualityInfo,
  getTextQualityBadgeProps,
  getRecommendedTextAction,
  RECOMMENDED_ACTION_LABELS,
} from '../textQuality';
import type { AnalysisQuality } from '../analysisQuality';

describe('getTextQuality (backward compatibility)', () => {
  it('identifies curated texts', () => {
    const text = { isComplete: true, sourceStatus: 'complete' };
    const status = getTextQuality(text);
    expect(status.quality).toBe('curated');
  });

  it('identifies imported texts', () => {
    const text = { isComplete: false };
    const status = getTextQuality(text, 'paste');
    expect(status.quality).toBe('imported');
  });

  it('identifies raw texts', () => {
    const text = { isComplete: false, sourceStatus: 'raw' };
    const status = getTextQuality(text);
    expect(status.quality).toBe('raw');
  });

  it('identifies analyzed texts', () => {
    const text = { analysisStatus: 'analyzed', analysisQuality: { level: 'full' } as AnalysisQuality };
    const status = getTextQuality(text);
    expect(status.quality).toBe('analyzed');
  });

  it('identifies partial analysis', () => {
    const text = { analysisStatus: 'analyzed', analysisQuality: { level: 'partial' } as AnalysisQuality };
    const status = getTextQuality(text);
    expect(status.quality).toBe('partial');
  });

  it('identifies needs_ai texts', () => {
    const text = { analysisStatus: 'needs_ai' };
    const status = getTextQuality(text);
    expect(status.quality).toBe('needs_ai');
  });

  it('identifies sample texts', () => {
    const text = { isSample: true };
    const status = getTextQuality(text);
    expect(status.quality).toBe('sample');
  });

  it('returns label and color for every quality state', () => {
    const scenarios = [
      { text: { isComplete: true, sourceStatus: 'complete' }, expected: 'curated' },
      { text: { isComplete: false }, sourceType: 'paste' as const, expected: 'imported' },
      { text: { sourceStatus: 'raw', isComplete: false }, expected: 'raw' },
      { text: { analysisStatus: 'analyzed', analysisQuality: { level: 'full' } as AnalysisQuality }, expected: 'analyzed' },
      { text: { analysisStatus: 'analyzed', analysisQuality: { level: 'partial' } as AnalysisQuality }, expected: 'partial' },
      { text: { analysisStatus: 'needs_ai' }, expected: 'needs_ai' },
      { text: { isSample: true }, expected: 'sample' },
    ];
    for (const s of scenarios) {
      const result = getTextQuality(s.text as any, s.sourceType);
      expect(result.quality).toBe(s.expected);
      expect(result.label).toBeTruthy();
      expect(result.color).toBeTruthy();
    }
  });
});

describe('getTextQualityInfo', () => {
  it('returns high trust and ready_to_read for curated text', () => {
    const info = getTextQualityInfo({ isComplete: true, sourceStatus: 'complete' });
    expect(info.trustLevel).toBe('high');
    expect(info.recommendedAction).toBe('ready_to_read');
    expect(info.sourceQuality).toBe('curated');
    expect(info.coverage.overall).toBe(0);
  });

  it('returns medium trust and ready_to_read for full analyzed import', () => {
    const aq: AnalysisQuality = { level: 'full', glossCoverage: 100, morphologyCoverage: 95, averageConfidence: 0.92 };
    const info = getTextQualityInfo({ analysisStatus: 'analyzed', analysisQuality: aq });
    expect(info.trustLevel).toBe('medium');
    expect(info.recommendedAction).toBe('ready_to_read');
    expect(info.sourceQuality).toBe('ai_analyzed');
    expect(info.coverage.gloss).toBe(100);
    expect(info.coverage.morphology).toBe(95);
    expect(info.coverage.overall).toBe(98);
  });

  it('returns low trust and run_ai_analysis for raw import', () => {
    const info = getTextQualityInfo({ analysisStatus: 'raw' }, 'paste');
    expect(info.recommendedAction).toBe('run_ai_analysis');
    expect(info.trustLevel).toBe('low');
    expect(info.sourceQuality).toBe('imported');
  });

  it('returns low trust and needs_morphology for partial analysis with low morph', () => {
    const aq: AnalysisQuality = { level: 'partial', glossCoverage: 90, morphologyCoverage: 30 };
    const info = getTextQualityInfo({ analysisStatus: 'analyzed', analysisQuality: aq });
    expect(info.trustLevel).toBe('low');
    expect(info.recommendedAction).toBe('needs_morphology');
  });

  it('returns low trust and review_tokens for partial analysis with low gloss', () => {
    const aq: AnalysisQuality = { level: 'partial', glossCoverage: 40, morphologyCoverage: 85 };
    const info = getTextQualityInfo({ analysisStatus: 'analyzed', analysisQuality: aq });
    expect(info.recommendedAction).toBe('review_tokens');
  });

  it('returns limited_support for sample text', () => {
    const info = getTextQualityInfo({ isSample: true });
    expect(info.recommendedAction).toBe('limited_support');
    expect(info.trustLevel).toBe('low');
    expect(info.sourceQuality).toBe('sample');
  });

  it('returns untrusted and run_ai_analysis for needs_ai', () => {
    const info = getTextQualityInfo({ analysisStatus: 'needs_ai' });
    expect(info.recommendedAction).toBe('run_ai_analysis');
    expect(info.trustLevel).toBe('untrusted');
    expect(info.sourceQuality).toBe('raw');
  });

  it('handles missing analysisQuality gracefully', () => {
    const info = getTextQualityInfo({ analysisStatus: 'analyzed' });
    expect(info.coverage.gloss).toBe(0);
    expect(info.coverage.morphology).toBe(0);
    expect(info.coverage.overall).toBe(0);
    expect(info.quality).toBe('analyzed');
    expect(info.trustLevel).toBe('medium');
    expect(info.recommendedAction).toBe('ready_to_read');
  });

  it('returns medium trust for partial corpus text (curated but incomplete)', () => {
    const info = getTextQualityInfo({ sourceStatus: 'partial', isComplete: false });
    expect(info.quality).toBe('partial');
    expect(info.recommendedAction).toBe('ready_to_read');
    expect(info.trustLevel).toBe('medium');
    expect(info.sourceQuality).toBe('curated');
  });

  it('handles legacy/unknown statuses without error', () => {
    const info = getTextQualityInfo({ sourceStatus: 'stub' });
    expect(info.quality).toBe('raw');
    expect(info.recommendedAction).toBe('run_ai_analysis');
    expect(info.trustLevel).toBe('untrusted');
  });

  it('handles empty input without error', () => {
    const info = getTextQualityInfo({});
    expect(info.quality).toBe('raw');
    expect(info.sourceQuality).toBe('raw');
    expect(info.coverage.overall).toBe(0);
  });
});

describe('getTextQualityBadgeProps', () => {
  it('delegates to getTextQuality and returns correct props', () => {
    const props = getTextQualityBadgeProps({ isComplete: true, sourceStatus: 'complete' });
    expect(props.quality).toBe('curated');
    expect(props.label).toBe('Curated');
    expect(props.color).toContain('bg-blue-100');
  });
});

describe('getRecommendedTextAction', () => {
  it('returns ready_to_read for curated texts', () => {
    const result = getRecommendedTextAction({ isComplete: true, sourceStatus: 'complete' });
    expect(result.action).toBe('ready_to_read');
    expect(result.label).toBe('Ready to read');
  });

  it('returns run_ai_analysis for raw texts', () => {
    const result = getRecommendedTextAction({ sourceStatus: 'raw', isComplete: false });
    expect(result.action).toBe('run_ai_analysis');
    expect(result.label).toBe('Run AI analysis');
  });

  it('returns run_ai_analysis for needs_ai texts', () => {
    const result = getRecommendedTextAction({ analysisStatus: 'needs_ai' });
    expect(result.action).toBe('run_ai_analysis');
  });

  it('returns limited_support for sample texts', () => {
    const result = getRecommendedTextAction({ isSample: true });
    expect(result.action).toBe('limited_support');
  });

  it('returns ready_to_read for full analyzed texts', () => {
    const aq: AnalysisQuality = { level: 'full', glossCoverage: 100, morphologyCoverage: 100 };
    const result = getRecommendedTextAction({ analysisStatus: 'analyzed', analysisQuality: aq });
    expect(result.action).toBe('ready_to_read');
  });

  it('every RecommendedAction has a label in RECOMMENDED_ACTION_LABELS', () => {
    const actions = ['ready_to_read', 'run_ai_analysis', 'review_tokens', 'needs_morphology', 'limited_support'] as const;
    for (const action of actions) {
      expect(RECOMMENDED_ACTION_LABELS[action]).toBeTruthy();
    }
  });
});
