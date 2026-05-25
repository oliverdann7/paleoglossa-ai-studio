import { describe, it, expect } from 'vitest';
import { getTextQuality } from '../textQuality';

describe('getTextQuality', () => {
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
    const text = { analysisStatus: 'analyzed', analysisQuality: { level: 'full' } as any };
    const status = getTextQuality(text);
    expect(status.quality).toBe('analyzed');
  });

  it('identifies partial analysis', () => {
    const text = { analysisStatus: 'analyzed', analysisQuality: { level: 'partial' } as any };
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
});
