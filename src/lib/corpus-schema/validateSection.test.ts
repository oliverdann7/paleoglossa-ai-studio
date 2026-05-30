import { describe, it, expect } from 'vitest';
import { validateSection, isValidSection } from './validateSection';
import type { TextSection } from '../../types/corpus.js';

const VALID_SECTION: TextSection = {
  id: 'Sample-1',
  textId: 'TEXT_SAMPLE',
  sequence: 1,
  label: 'Sample 1',
  sentences: [
    {
      id: 'Sample-1-1',
      tokens: [
        {
          id: 'Sample-1-1-t0',
          surface: 'λόγος',
          normalized: 'λογος',
          lemma: 'λόγος',
          gloss: 'word',
          morphology: { partOfSpeech: 'noun' },
          punctBefore: '',
          punctAfter: ' ',
        },
      ],
      translation: 'word',
    },
  ],
};

describe('validateSection', () => {
  it('returns no issues for a well-formed section', () => {
    expect(validateSection(VALID_SECTION)).toEqual([]);
    expect(isValidSection(VALID_SECTION)).toBe(true);
  });

  it('flags missing top-level fields', () => {
    const issues = validateSection({ id: 'x', sequence: 1, label: 'l', sentences: [] });
    expect(issues.some((i) => i.path.endsWith('.textId'))).toBe(true);
    expect(issues.some((i) => i.path.endsWith('.sentences'))).toBe(true);
  });

  it('rejects non-object input', () => {
    expect(validateSection(null)).toHaveLength(1);
    expect(validateSection('nope')).toHaveLength(1);
  });

  it('flags duplicate sentence ids', () => {
    const dup: TextSection = {
      ...VALID_SECTION,
      sentences: [VALID_SECTION.sentences[0], VALID_SECTION.sentences[0]],
    };
    const issues = validateSection(dup);
    expect(issues.some((i) => i.message.includes('duplicate'))).toBe(true);
  });

  it('flags sentences with empty token arrays', () => {
    const bad = {
      ...VALID_SECTION,
      sentences: [{ id: 'x', tokens: [] }],
    };
    const issues = validateSection(bad);
    expect(issues.some((i) => i.message.includes('at least one token'))).toBe(true);
  });

  it('flags tokens missing morphology.partOfSpeech', () => {
    const bad = {
      ...VALID_SECTION,
      sentences: [
        {
          id: 's',
          tokens: [
            { ...VALID_SECTION.sentences[0].tokens[0], morphology: {} as { partOfSpeech: string } },
          ],
        },
      ],
    };
    const issues = validateSection(bad);
    expect(issues.some((i) => i.path.endsWith('.morphology.partOfSpeech'))).toBe(true);
  });

  it('flags head when it is not a number', () => {
    const bad = {
      ...VALID_SECTION,
      sentences: [
        {
          id: 's',
          tokens: [{ ...VALID_SECTION.sentences[0].tokens[0], head: 'oops' as unknown as number }],
        },
      ],
    };
    expect(validateSection(bad).some((i) => i.path.endsWith('.head'))).toBe(true);
  });

  it('accepts head when it is a number (including -1 for root)', () => {
    const ok = {
      ...VALID_SECTION,
      sentences: [
        {
          id: 's',
          tokens: [{ ...VALID_SECTION.sentences[0].tokens[0], head: -1 }],
        },
      ],
    };
    expect(validateSection(ok)).toEqual([]);
  });

  it('returns JSON-path-like locators that pinpoint the bad field', () => {
    const bad = {
      ...VALID_SECTION,
      sentences: [
        {
          id: 'x',
          tokens: [{ id: 't', surface: 'a' /* missing required fields */ }],
        },
      ],
    };
    const issues = validateSection(bad, 'root');
    expect(issues[0].path.startsWith('root.sentences[0].tokens[0]')).toBe(true);
  });
});
