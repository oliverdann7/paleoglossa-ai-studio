import { describe, it, expect } from 'vitest';
import { MorphologyService } from './morphologyService.js';

describe('MorphologyService', () => {
  it('resolves Greek token analysis', () => {
    // an53 = ἀδελφῷ in Anabasis 1.1 (dative singular) — a listed text with
    // full inline morphology. (The old John sample text is no longer listed;
    // Jn-full tokens carry POS-only lexicon morphology.)
    const greek = MorphologyService.getTokenAnalysis('an53');
    expect(greek).toBeTruthy();
    expect(greek?.languageId).toBe('grc');
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
