import { describe, it, expect } from 'vitest';
import { MorphologyService } from './morphologyService.js';

describe('MorphologyService', () => {
  it('resolves Greek token analysis', () => {
    const greek = MorphologyService.getTokenAnalysis('jn2');
    expect(greek).toBeTruthy();
    expect(greek?.languageId).toBe('grc-koine');
    expect(greek?.morphology.case).toBe('dative');
    expect(greek?.morphology.number).toBe('singular');
  });

  it('resolves Hebrew token analysis', () => {
    const hebrew = MorphologyService.getTokenAnalysis('g3');
    expect(hebrew).toBeTruthy();
    expect(hebrew?.languageId).toBe('hbo');
    expect(hebrew?.morphology.partOfSpeech).toBe('verb');
  });

  it('resolves Latin token analysis', () => {
    const latin = MorphologyService.getTokenAnalysis('a1');
    expect(latin).toBeTruthy();
  });
});
