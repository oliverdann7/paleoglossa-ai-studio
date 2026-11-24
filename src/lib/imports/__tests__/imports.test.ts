import { describe, expect, it } from 'vitest';
import {
  LOW_CONFIDENCE,
  applyLemmaCorrection,
  countUncertain,
  isUncertain,
} from '../corrections.js';
import { STALLED_AFTER_MS, describeImport, isImportId } from '../status.js';

const NOW = Date.parse('2026-11-24T12:00:00Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const word = (text: string, extra: Record<string, unknown> = {}) => ({
  text,
  lemma: text.toLowerCase(),
  type: 'word',
  ...extra,
});
const some = [{ tokens: [word('Gallia')] }];

describe('isImportId', () => {
  it('recognizes every ID an import has ever had', () => {
    expect(isImportId('imp_1795507557696')).toBe(true);
    expect(isImportId('imp-123')).toBe(true);
    expect(isImportId('import-abc')).toBe(true);
  });

  it('does not claim corpus texts', () => {
    expect(isImportId('grc-koine-mark-full')).toBe(false);
    expect(isImportId('imperial-edict')).toBe(false);
    expect(isImportId(undefined)).toBe(false);
  });
});

describe('describeImport', () => {
  it('reports an analyzed import as readable, with nothing to retry', () => {
    expect(
      describeImport({ status: 'complete', analysisStatus: 'analyzed', sentences: some }, NOW)
    ).toEqual({ phase: 'analyzed', canRetry: false, canOpen: true, lastError: undefined });
  });

  it('keeps a text that was only split into words readable, and offers analysis again', () => {
    const view = describeImport(
      {
        status: 'partial',
        analysisStatus: 'raw',
        sentences: some,
        errorLog: ['Attempt 1: timeout', 'Attempt 3: quota exceeded'],
      },
      NOW
    );
    expect(view).toMatchObject({ phase: 'unanalyzed', canRetry: true, canOpen: true });
    expect(view.lastError).toBe('Attempt 3: quota exceeded');
  });

  it('treats a recent "processing" record as running', () => {
    const view = describeImport(
      { status: 'processing', sentences: [], updatedAt: ago(20_000) },
      NOW
    );
    expect(view).toMatchObject({ phase: 'analyzing', canRetry: false, canOpen: false });
  });

  it('calls an analysis that never reported back stalled, and lets it be retried', () => {
    const old = ago(STALLED_AFTER_MS + 1000);
    expect(
      describeImport({ status: 'processing', sentences: [], updatedAt: old }, NOW)
    ).toMatchObject({ phase: 'stalled', canRetry: true, canOpen: false });
    // Firestore timestamps, live or serialized, and records with no time at all.
    const seconds = { seconds: Math.floor(Date.parse(old) / 1000) };
    expect(describeImport({ status: 'processing', updatedAt: seconds }, NOW).phase).toBe('stalled');
    expect(
      describeImport({ status: 'processing', updatedAt: { toMillis: () => NOW - 1000 } }, NOW).phase
    ).toBe('analyzing');
    expect(describeImport({ status: 'processing' }, NOW).phase).toBe('stalled');
  });

  it('reports failure when there is nothing to read', () => {
    expect(describeImport({ status: 'failed', sentences: [] }, NOW)).toMatchObject({
      phase: 'failed',
      canRetry: true,
      canOpen: false,
    });
    expect(
      describeImport({ status: 'complete', analysisStatus: 'analyzed', sentences: [] }, NOW).phase
    ).toBe('failed');
  });
});

describe('confidence', () => {
  it('flags only words the analysis was unsure of and nobody has checked', () => {
    expect(isUncertain(word('est', { confidence: 0.4 }))).toBe(true);
    expect(isUncertain(word('est', { confidence: LOW_CONFIDENCE }))).toBe(false);
    expect(isUncertain(word('est', { confidence: null }))).toBe(false);
    expect(isUncertain(word('est'))).toBe(false);
    expect(isUncertain(word('est', { confidence: 0.2, corrected: true }))).toBe(false);
    expect(isUncertain({ text: ',', type: 'punctuation', confidence: 0.1 })).toBe(false);
  });

  it('counts them across a text', () => {
    const sentences = [
      { tokens: [word('a', { confidence: 0.3 }), word('b', { confidence: 0.9 })] },
      {
        tokens: [word('c', { confidence: 0.5 }), { text: ' ', type: 'whitespace', confidence: 0 }],
      },
    ];
    expect(countUncertain(sentences)).toBe(2);
  });
});

describe('applyLemmaCorrection', () => {
  const sentences = [
    { tokens: [word('partes', { lemma: 'partes', confidence: 0.4 }), word('tres')] },
    { tokens: [word('unam')] },
    { tokens: [word('partes', { lemma: 'partes' }), word('partes', { lemma: 'partio' })] },
  ];

  it('corrects every occurrence of the form that has the same lemma', () => {
    const result = applyLemmaCorrection(
      sentences,
      { surface: 'partes', lemma: 'partes' },
      ' pars '
    );
    expect(result.changed).toBe(2);
    expect(result.sentences[0].tokens[0]).toMatchObject({ lemma: 'pars', corrected: true });
    expect(result.sentences[2].tokens[0]).toMatchObject({ lemma: 'pars', corrected: true });
    // The same form analysed as another word is not this word.
    expect(result.sentences[2].tokens[1]).toMatchObject({ lemma: 'partio' });
    expect(result.sentences[2].tokens[1]).not.toHaveProperty('corrected');
    // A corrected word is no longer uncertain.
    expect(countUncertain(result.sentences)).toBe(0);
  });

  it('leaves untouched sentences, and the input, as they were', () => {
    const result = applyLemmaCorrection(sentences, { surface: 'partes', lemma: 'partes' }, 'pars');
    expect(result.sentences[1]).toBe(sentences[1]);
    expect(sentences[0].tokens[0].lemma).toBe('partes');
  });

  it('does nothing for an empty lemma or a form that is not there', () => {
    expect(applyLemmaCorrection(sentences, { surface: 'partes', lemma: 'partes' }, '  ')).toEqual({
      sentences,
      changed: 0,
    });
    const absent = applyLemmaCorrection(
      sentences,
      { surface: 'gallia', lemma: 'gallia' },
      'Gallia'
    );
    expect(absent.changed).toBe(0);
    expect(absent.sentences).toBe(sentences);
  });

  it('can be corrected again', () => {
    const once = applyLemmaCorrection(sentences, { surface: 'partes', lemma: 'partes' }, 'pars');
    const twice = applyLemmaCorrection(
      once.sentences,
      { surface: 'partes', lemma: 'pars' },
      'pars, partis'
    );
    expect(twice.changed).toBe(2);
    expect(twice.sentences[0].tokens[0].lemma).toBe('pars, partis');
  });
});
