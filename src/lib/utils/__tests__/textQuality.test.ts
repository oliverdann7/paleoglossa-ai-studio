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
});
