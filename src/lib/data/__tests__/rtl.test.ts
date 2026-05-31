import { describe, it, expect } from 'vitest';
import { getLanguageDirection, isRtlLanguage } from '../languages';
import { CorpusDB } from '../../../data/corpus';

/**
 * RTL rendering hinges on language direction being reported correctly for the
 * right-to-left scripts (Hebrew, Aramaic, Syriac). These were previously
 * untested — a regression here silently breaks reader/transcription layout.
 */
describe('right-to-left language direction', () => {
  const RTL = ['hbo', 'arc', 'syr'];
  const LTR = ['grc', 'grc-koine', 'lat', 'cop', 'egy', 'akk', 'san', 'hit', 'uga'];

  it.each(RTL)('treats %s as right-to-left', (id) => {
    expect(getLanguageDirection(id)).toBe('rtl');
    expect(isRtlLanguage(id)).toBe(true);
  });

  it.each(LTR)('treats %s as left-to-right', (id) => {
    expect(getLanguageDirection(id)).toBe('ltr');
    expect(isRtlLanguage(id)).toBe(false);
  });

  it('defaults unknown languages to ltr', () => {
    expect(getLanguageDirection('xx-unknown')).toBe('ltr');
    expect(isRtlLanguage('xx-unknown')).toBe(false);
  });

  it('keeps every corpus text consistent with its language direction', () => {
    const mismatches = CorpusDB.getTexts()
      .filter((t) => t.direction && t.direction !== getLanguageDirection(t.language))
      .map(
        (t) =>
          `${t.id}: direction=${t.direction} but ${t.language} is ${getLanguageDirection(t.language)}`
      );
    expect(mismatches).toEqual([]);
  });
});
