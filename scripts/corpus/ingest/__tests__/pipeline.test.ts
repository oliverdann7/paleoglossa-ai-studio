import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { buildMaculaSections } from '../sources/macula.js';
import { segmentWork } from '../segment.js';
import { applyAnnotations } from '../annotate.js';
import { fillGlosses } from '../glossFill.js';
import { assembleText } from '../assemble.js';
import { pushToFirestore } from '../pushFirestore.js';
import { validateTextAnnotations } from '../../../../src/data/corpus/validation.js';
import type { TokenAnnotation, WorkInput } from '../types.js';

const FIXTURE = readFileSync(join(__dirname, '../fixtures/macula-sample.tsv'), 'utf-8');
const tmpCache = () => join(tmpdir(), `paleoglossa-gloss-cache-${process.pid}.json`);

describe('Macula adapter', () => {
  it('builds fully-annotated sections that pass the completeness gate', () => {
    const sections = buildMaculaSections(FIXTURE, { book: 'MRK', textId: 'grc-mark-full' });
    // One chapter (1) → one section, two verses → two sentences
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe('grc-mark-full-1');
    expect(sections[0].sentences).toHaveLength(2);

    const allTokens = sections.flatMap((s) => s.sentences.flatMap((sn) => sn.tokens));
    expect(allTokens).toHaveLength(5);
    for (const tok of allTokens) {
      expect(tok.lemma.trim()).not.toBe('');
      expect(tok.gloss.trim()).not.toBe('');
      expect(tok.morphology.partOfSpeech).not.toBe('unknown');
      expect(tok.morphology.partOfSpeech.trim()).not.toBe('');
    }
    // No annotation-gap problems
    expect(validateTextAnnotations({ id: 'grc-mark-full' }, sections)).toEqual([]);
  });

  it('preserves morphology features and surface punctuation', () => {
    const sections = buildMaculaSections(FIXTURE, { book: 'MRK', textId: 'grc-mark-full' });
    const verb = sections[0].sentences[1].tokens[1];
    expect(verb.surface).toBe('γέγραπται');
    expect(verb.morphology.tense).toBe('perfect');
    expect(verb.morphology.voice).toBe('passive');
    expect(verb.punctAfter).toBe('.');
  });
});

describe('assembleText', () => {
  it('marks a fully-annotated text complete', () => {
    const sections = buildMaculaSections(FIXTURE, { book: 'MRK', textId: 'grc-mark-full' });
    const res = assembleText('grc-mark-full', 'grc', { title: 'Gospel of Mark' }, sections);
    expect(res.complete).toBe(true);
    expect(res.text.sourceStatus).toBe('complete');
    expect(res.text.isComplete).toBe(true);
    expect(res.text.sentenceCount).toBe(2);
    expect(res.text.sectionsPreview).toHaveLength(1);
    expect(res.problems).toEqual([]);
  });

  it('downgrades a text with annotation gaps to partial', () => {
    const work: WorkInput = {
      textId: 'lat-demo',
      language: 'lat',
      meta: { title: 'Demo' },
      sections: [
        { id: 'lat-demo-1', sequence: 1, label: 'I', sentences: [{ id: 'lat-demo-1-1', src: 'Gallia est omnis' }] },
      ],
    };
    const sections = segmentWork(work);
    const res = assembleText('lat-demo', 'lat', { title: 'Demo' }, sections);
    expect(res.complete).toBe(false);
    expect(res.text.sourceStatus).toBe('partial');
    expect(res.problems.length).toBeGreaterThan(0);
  });
});

describe('segment + annotate', () => {
  it('merges positional annotations onto segmented tokens', () => {
    const work: WorkInput = {
      textId: 'lat-demo',
      language: 'lat',
      meta: { title: 'Demo' },
      sections: [
        { id: 'lat-demo-1', sequence: 1, label: 'I', sentences: [{ id: 's1', src: 'Gallia est omnis' }] },
      ],
    };
    const annotations: TokenAnnotation[] = [
      { sentenceId: 's1', index: 0, surface: 'Gallia', lemma: 'Gallia', gloss: 'Gaul', morphology: { partOfSpeech: 'noun', case: 'nominative' } },
      { sentenceId: 's1', index: 1, surface: 'est', lemma: 'sum', gloss: 'is', morphology: { partOfSpeech: 'verb' } },
      { sentenceId: 's1', index: 2, surface: 'omnis', lemma: 'omnis', gloss: 'all', morphology: { partOfSpeech: 'adjective' } },
    ];
    const { sections, matched, unmatched } = applyAnnotations(segmentWork(work), annotations);
    expect(matched).toBe(3);
    expect(unmatched).toHaveLength(0);
    const toks = sections[0].sentences[0].tokens;
    expect(toks[0].lemma).toBe('Gallia');
    expect(toks[1].morphology.partOfSpeech).toBe('verb');
    expect(validateTextAnnotations({ id: 'lat-demo' }, sections)).toEqual([]);
  });
});

describe('fillGlosses', () => {
  it('uses a stub AI resolver to fill gaps and caches the result', async () => {
    const work: WorkInput = {
      textId: 'xx-demo',
      language: 'zz', // unknown language → bundled dict returns nothing → AI path
      meta: { title: 'Demo' },
      sections: [
        { id: 'd1', sequence: 1, label: 'I', sentences: [{ id: 's1', src: 'foo bar' }] },
      ],
    };
    // Give the tokens lemmas so glossFill has something to resolve
    const annotations: TokenAnnotation[] = [
      { sentenceId: 's1', index: 0, surface: 'foo', lemma: 'foo', morphology: { partOfSpeech: 'noun' } },
      { sentenceId: 's1', index: 1, surface: 'bar', lemma: 'bar', morphology: { partOfSpeech: 'noun' } },
    ];
    const { sections } = applyAnnotations(segmentWork(work), annotations);
    const calls: string[] = [];
    const res = await fillGlosses(sections, {
      languageId: 'zz',
      cachePath: tmpCache(),
      aiResolver: async (_lang, lemma) => {
        calls.push(lemma);
        return `meaning of ${lemma}`;
      },
    });
    expect(res.filledFromAi).toBe(2);
    expect(res.stillMissing).toBe(0);
    expect(calls.sort()).toEqual(['bar', 'foo']);
    const toks = res.sections[0].sentences[0].tokens;
    expect(toks[0].gloss).toBe('meaning of foo');
  });
});

describe('pushToFirestore (dry run)', () => {
  it('reports what would be written without credentials', async () => {
    const sections = buildMaculaSections(FIXTURE, { book: 'MRK', textId: 'grc-mark-full' });
    const assembled = assembleText('grc-mark-full', 'grc', { title: 'Gospel of Mark' }, sections);
    const result = await pushToFirestore(assembled, { dryRun: true });
    expect(result.textId).toBe('grc-mark-full');
    expect(result.sectionsWritten).toBe(1);
  });
});
