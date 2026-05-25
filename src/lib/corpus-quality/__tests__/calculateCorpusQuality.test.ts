import { describe, it, expect } from 'vitest';
import { calculateCorpusQuality } from '../calculateCorpusQuality.js';

describe('calculateCorpusQuality', () => {
  const report = calculateCorpusQuality();

  it('returns a valid report structure', () => {
    expect(report).toBeDefined();
    expect(typeof report.generatedAt).toBe('string');
    expect(report.totalLanguages).toBeGreaterThan(0);
    expect(report.totalTexts).toBeGreaterThan(0);
    expect(report.totalTokens).toBeGreaterThan(0);
  });

  it('has at least one language', () => {
    expect(report.languages.length).toBeGreaterThan(0);
    expect(report.totalLanguages).toBe(report.languages.length);
  });

  it('every language has valid metrics', () => {
    for (const lang of report.languages) {
      expect(typeof lang.language).toBe('string');
      expect(lang.language.length).toBeGreaterThan(0);
      expect(lang.metrics.texts).toBeGreaterThanOrEqual(0);
      expect(lang.metrics.tokens).toBeGreaterThanOrEqual(0);
      expect(typeof lang.glossCoverage).toBe('number');
      expect(typeof lang.posCoverage).toBe('number');
      expect(typeof lang.lemmaCoverage).toBe('number');
      expect(typeof lang.morphCoverage).toBe('number');
      expect(['good', 'needs_work', 'poor']).toContain(lang.status);
    }
  });

  it('coverage percentages are between 0 and 100', () => {
    for (const lang of report.languages) {
      expect(lang.glossCoverage).toBeGreaterThanOrEqual(0);
      expect(lang.glossCoverage).toBeLessThanOrEqual(100);
      expect(lang.posCoverage).toBeGreaterThanOrEqual(0);
      expect(lang.posCoverage).toBeLessThanOrEqual(100);
      expect(lang.lemmaCoverage).toBeGreaterThanOrEqual(0);
      expect(lang.lemmaCoverage).toBeLessThanOrEqual(100);
      expect(lang.morphCoverage).toBeGreaterThanOrEqual(0);
      expect(lang.morphCoverage).toBeLessThanOrEqual(100);
    }
  });

  it('topMissingLemmas is an array', () => {
    expect(Array.isArray(report.topMissingLemmas)).toBe(true);
    for (const m of report.topMissingLemmas) {
      expect(typeof m.lemma).toBe('string');
      expect(typeof m.count).toBe('number');
      expect(m.count).toBeGreaterThan(0);
      expect(typeof m.language).toBe('string');
    }
  });

  it('topProblemLanguages has at most 5 entries', () => {
    expect(report.topProblemLanguages.length).toBeLessThanOrEqual(5);
  });

  it('needsAttention only contains non-good languages', () => {
    for (const lang of report.needsAttention) {
      expect(lang.status).not.toBe('good');
    }
  });

  it('generatedAt is a valid ISO date', () => {
    const parsed = new Date(report.generatedAt);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it('sections and sentences counts are consistent', () => {
    expect(report.totalSections).toBeGreaterThanOrEqual(0);
    expect(report.totalSentences).toBeGreaterThanOrEqual(0);
    const sectionSum = report.languages.reduce((s, l) => s + l.metrics.sections, 0);
    expect(sectionSum).toBe(report.totalSections);
  });
});
