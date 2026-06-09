import { describe, it, expect } from 'vitest';
import { validateImport } from '../validate';
import type { NormalizedText, NormalizedSection } from '../types';

/**
 * The import pipeline's validation step had no coverage. These lock in the
 * contract the reader relies on: structurally broken imports must be rejected,
 * thin-but-valid imports must pass with warnings, and token counts must be
 * reported accurately.
 */

function text(overrides: Partial<NormalizedText> = {}): NormalizedText {
  return { id: 'T1', corpusId: 'C1', title: 'Test', language: 'lat', ...overrides };
}

function section(overrides: Partial<NormalizedSection> = {}): NormalizedSection {
  return {
    id: 'T1-1',
    textId: 'T1',
    sequence: 1,
    label: 'Section 1',
    sentences: [
      {
        id: 'T1-1-1',
        tokens: [
          {
            id: 'T1-1-1-t0',
            surface: 'arma',
            normalized: 'arma',
            lemma: 'arma',
            gloss: 'arms',
          } as any,
          {
            id: 'T1-1-1-t1',
            surface: 'virumque',
            normalized: 'virumque',
            lemma: 'vir',
            gloss: 'man',
          } as any,
        ],
      },
    ],
    ...overrides,
  };
}

describe('validateImport', () => {
  it('accepts a well-formed import and counts tokens', () => {
    const result = validateImport({ text: text(), sections: [section()] });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.sectionCount).toBe(1);
    expect(result.tokenCount).toBe(2);
  });

  it('rejects a text missing id and corpusId', () => {
    const result = validateImport({
      text: text({ id: '', corpusId: '' }),
      sections: [section()],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing text ID.');
    expect(result.errors).toContain('Missing corpusId.');
  });

  it('warns (but stays valid) when there are no sections', () => {
    const result = validateImport({ text: text(), sections: [] });
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('No sections found in this text.');
    expect(result.tokenCount).toBe(0);
  });

  it('flags a section missing its id', () => {
    const result = validateImport({
      text: text(),
      sections: [section({ id: '' })],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing an ID'))).toBe(true);
  });

  it('rejects tokens without a surface form', () => {
    const broken = section();
    broken.sentences[0].tokens[1] = { id: 'x', surface: '' } as any;
    const result = validateImport({ text: text(), sections: [broken] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid token'))).toBe(true);
  });

  it('warns on empty sentences and sections without tokens', () => {
    const empty = section({
      sentences: [{ id: 'T1-1-1', tokens: [] }],
    });
    const result = validateImport({ text: text(), sections: [empty] });
    expect(result.warnings.some((w) => w.includes('no tokens'))).toBe(true);
  });

  it('fails cleanly on a payload missing its text', () => {
    const result = validateImport({ text: null as any, sections: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing its text'))).toBe(true);
  });

  it('fails cleanly when sections is not an array', () => {
    const result = validateImport({ text: text(), sections: undefined as any });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('must be an array'))).toBe(true);
  });

  it('rejects duplicate section IDs', () => {
    const result = validateImport({
      text: text(),
      sections: [section(), section()], // both default to id 'T1-1'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate section ID'))).toBe(true);
  });

  it('rejects duplicate token IDs within a sentence', () => {
    const dup = section();
    dup.sentences[0].tokens[1] = { ...dup.sentences[0].tokens[0] } as any; // clone t0's id
    const result = validateImport({ text: text(), sections: [dup] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate token ID'))).toBe(true);
  });

  it('warns on an unknown text direction', () => {
    const result = validateImport({
      text: text({ direction: 'sideways' as any }),
      sections: [section()],
    });
    expect(result.isValid).toBe(true);
    expect(result.warnings.some((w) => w.includes('Unknown text direction'))).toBe(true);
  });

  it('accepts valid rtl direction without a warning', () => {
    const result = validateImport({
      text: text({ direction: 'rtl' }),
      sections: [section()],
    });
    expect(result.warnings.some((w) => w.includes('direction'))).toBe(false);
  });
});
