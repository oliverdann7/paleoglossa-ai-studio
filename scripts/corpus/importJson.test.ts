import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  buildSection,
  buildSentence,
  renderModule,
  validateManifest,
  CorpusImportError,
} from './importJson';

const FIXTURE = JSON.parse(
  readFileSync(join(__dirname, 'fixtures/sample-import.json'), 'utf-8')
);

describe('validateManifest', () => {
  it('accepts the canonical sample manifest', () => {
    const m = validateManifest(FIXTURE);
    expect(m.textId).toBe('TEXT_SAMPLE_IMPORT');
    expect(m.sections).toHaveLength(1);
  });

  it('rejects manifests with wrong schemaVersion', () => {
    expect(() => validateManifest({ ...FIXTURE, schemaVersion: 2 })).toThrow(CorpusImportError);
  });

  it('rejects manifests with no sections', () => {
    expect(() => validateManifest({ ...FIXTURE, sections: [] })).toThrow(/non-empty/);
  });

  it('rejects manifests with duplicate section ids', () => {
    const dup = { ...FIXTURE, sections: [FIXTURE.sections[0], FIXTURE.sections[0]] };
    expect(() => validateManifest(dup)).toThrow(/duplicate/);
  });

  it('rejects sentences with empty src', () => {
    const bad = {
      ...FIXTURE,
      sections: [
        {
          ...FIXTURE.sections[0],
          sentences: [{ id: 'x', src: '   ' }],
        },
      ],
    };
    expect(() => validateManifest(bad)).toThrow(/non-empty/);
  });

  it('rejects manifests with duplicate sentence ids inside one section', () => {
    const bad = {
      ...FIXTURE,
      sections: [
        {
          ...FIXTURE.sections[0],
          sentences: [
            { id: 'same', src: 'a' },
            { id: 'same', src: 'b' },
          ],
        },
      ],
    };
    expect(() => validateManifest(bad)).toThrow(/duplicate sentence/);
  });
});

describe('buildSentence', () => {
  it('tokenizes src and applies lemma/gloss overrides', () => {
    const s = buildSentence(FIXTURE.sections[0].sentences[0]);
    expect(s.tokens).toHaveLength(5);
    const logos = s.tokens.find((t) => t.surface === 'λόγος');
    expect(logos?.lemma).toBe('λόγος');
    expect(logos?.gloss).toBe('word');
  });

  it('falls back to normalized surface for lemma when no override is given', () => {
    const s = buildSentence(FIXTURE.sections[0].sentences[1]);
    const kai = s.tokens.find((t) => t.surface === 'καὶ');
    expect(kai?.lemma).toBe(kai?.normalized);
  });

  it('preserves the translation field verbatim', () => {
    const s = buildSentence(FIXTURE.sections[0].sentences[0]);
    expect(s.translation).toBe('In the beginning was the Word');
  });
});

describe('buildSection', () => {
  it('sets textId on the section and on every token id via the sentence id', () => {
    const sec = buildSection(FIXTURE.sections[0], 'TEXT_SAMPLE_IMPORT');
    expect(sec.textId).toBe('TEXT_SAMPLE_IMPORT');
    expect(sec.sentences[0].tokens[0].id.startsWith('Sample-1-1-')).toBe(true);
  });
});

describe('renderModule', () => {
  it('emits a valid TS module that mentions every section', () => {
    const ts = renderModule(validateManifest(FIXTURE));
    expect(ts).toContain('AUTO-GENERATED');
    expect(ts).toContain('SECTION_SAMPLE_1');
    expect(ts).toContain('TEXT_SAMPLE_IMPORT_SECTIONS');
    expect(ts).toContain("import type { TextSection }");
  });
});
