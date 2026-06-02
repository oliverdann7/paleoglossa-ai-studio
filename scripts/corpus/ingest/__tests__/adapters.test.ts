import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildMaculaHebrewSections } from '../sources/macula-hebrew.js';
import { parseTeiWork } from '../sources/tei.js';
import { parsePlaintextWork } from '../sources/plaintext.js';
import { segmentWork } from '../segment.js';
import { checkLicense } from '../licenseGate.js';
import { validateTextAnnotations } from '../../../../src/data/corpus/validation.js';

const HEBREW = readFileSync(join(__dirname, '../fixtures/macula-hebrew-sample.tsv'), 'utf-8');
const TEI = readFileSync(join(__dirname, '../fixtures/tei-sample.xml'), 'utf-8');

describe('Macula Hebrew adapter', () => {
  it('builds fully-annotated sections that pass the completeness gate', () => {
    const sections = buildMaculaHebrewSections(HEBREW, { book: 'GEN', textId: 'hbo-genesis-full' });
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe('hbo-genesis-full-1');
    expect(sections[0].sentences).toHaveLength(1);

    const tokens = sections[0].sentences[0].tokens;
    expect(tokens).toHaveLength(4);
    for (const tok of tokens) {
      expect(tok.lemma.trim()).not.toBe('');
      expect(tok.gloss.trim()).not.toBe('');
      expect(tok.morphology.partOfSpeech).not.toBe('unknown');
    }
    expect(validateTextAnnotations({ id: 'hbo-genesis-full' }, sections)).toEqual([]);
  });

  it('preserves Hebrew morphology features and trailing punctuation', () => {
    const sections = buildMaculaHebrewSections(HEBREW, { book: 'GEN', textId: 'hbo-genesis-full' });
    const verb = sections[0].sentences[0].tokens[2];
    expect(verb.surface).toBe('בָּרָא');
    expect(verb.morphology.partOfSpeech).toBe('verb');
    expect((verb.morphology as unknown as Record<string, string>).stem).toBe('qal');
    const last = sections[0].sentences[0].tokens[3];
    expect(last.punctAfter).toBe('.');
  });
});

describe('TEI adapter', () => {
  it('extracts div sections and line sentences, dropping notes/header', () => {
    const work = parseTeiWork(TEI, { textId: 'syr-john', language: 'syr', title: 'John' });
    expect(work.sections).toHaveLength(2);
    expect(work.sections[0].sentences).toHaveLength(2);
    expect(work.sections[1].sentences).toHaveLength(1);
    // <note>gloss</note> content must not leak into the source string
    expect(work.sections[0].sentences[0].src).not.toContain('gloss');
    expect(work.sections[0].label).toBe('1');
    // segments cleanly (every line tokenises into >=1 token)
    const sections = segmentWork(work);
    expect(sections[0].sentences[0].tokens.length).toBeGreaterThan(0);
  });
});

describe('plaintext adapter', () => {
  it('splits on ## section markers and one-sentence-per-line', () => {
    const raw = '## Chapter 1\ndharmakṣetre kurukṣetre\nsamavetā yuyutsavaḥ\n\n## Chapter 2\nmāmakāḥ pāṇḍavāś caiva';
    const work = parsePlaintextWork(raw, { textId: 'san-gita', language: 'san', title: 'Gītā' });
    expect(work.sections).toHaveLength(2);
    expect(work.sections[0].label).toBe('Chapter 1');
    expect(work.sections[0].sentences).toHaveLength(2);
    expect(work.sections[1].sentences).toHaveLength(1);
  });

  it('falls back to a single section when there are no markers', () => {
    const work = parsePlaintextWork('line one\nline two', { textId: 't', language: 'san', title: 'T' });
    expect(work.sections).toHaveLength(1);
    expect(work.sections[0].sentences).toHaveLength(2);
  });
});

describe('license gate', () => {
  it('passes a commercial-safe CC BY source', () => {
    expect(checkLicense('macula-greek').ok).toBe(true);
    expect(checkLicense('macula-hebrew').ok).toBe(true);
  });

  it('blocks a non-commercial source unless overridden', () => {
    expect(checkLicense('proiel').ok).toBe(false);
    expect(checkLicense('proiel', { allowNonCommercial: true }).ok).toBe(true);
  });

  it('warns (but does not block) on share-alike sources', () => {
    const res = checkLicense('oracc');
    expect(res.ok).toBe(true);
    expect(res.warnings.some((w) => /share-alike/i.test(w))).toBe(true);
  });

  it('rejects an unknown attribution id', () => {
    expect(checkLicense('does-not-exist').ok).toBe(false);
  });
});
