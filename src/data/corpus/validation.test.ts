import { describe, it, expect } from 'vitest';
import {
  validateCorpus,
  COMPLETE_SHORT_WORKS,
  SHORT_COMPLETE_THRESHOLD,
} from './validation';
import { CorpusDB } from '../corpus';
import { validateSection } from '../../lib/corpus-schema/validateSection';

function actualSentenceCount(textId: string): number {
  const text = CorpusDB.getText(textId);
  return (text?.sectionsPreview ?? []).reduce(
    (sum, p) => sum + (CorpusDB.getSection(p.id)?.sentences.length ?? 0),
    0
  );
}

/**
 * Locks in the production corpus's structural invariants. A "huge import"
 * is coming — without this gate, a malformed entry can land silently and
 * only blow up in the reader at runtime.
 *
 * If a legitimate schema change breaks one of these assertions, fix the
 * underlying data (or update the validator); do NOT loosen the test.
 */
describe('corpus production data', () => {
  /**
   * Known-issue baseline. These predate this test and are out of scope for
   * the schema-lock PR; fixing them belongs to a separate corpus-cleanup
   * change. The point of the baseline is to ensure no NEW errors land —
   * the test fails the moment the set grows.
   *
   * When you fix one of these, REMOVE it from this list. Do not add new
   * entries to silence regressions.
   */
  const KNOWN_VALIDATE_CORPUS_ERRORS = new Set<string>([
    'Text "grc-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "grc-koine-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "lat-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "heb-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "syr-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "cop-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "arc-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "akk-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "hit-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "uga-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "san-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "egy-vocab" has isSample=false but sourceStatus is "undefined"',
    'Corpus "" referenced by text "uga-vocab" does not exist',
    // Completeness-gate baseline: texts currently marked complete but whose
    // tokens are not fully POS-tagged + glossed. Tracked for systematic
    // backfill — when a text's annotation gap closes, update or remove its
    // entry here. The gate prevents NEW under-annotated texts from landing
    // under sourceStatus: 'complete'.
    'Text "Jn-full" is marked complete but has annotation gaps: 2349 unknown POS, 2349 missing gloss, 5 missing lemma (of 15620 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
  ]);

  it('introduces no new validateCorpus regressions over the known baseline', () => {
    const errors = validateCorpus();
    const newErrors = errors.filter((e) => !KNOWN_VALIDATE_CORPUS_ERRORS.has(e));
    if (newErrors.length > 0) {
      console.error(
        'New corpus validation errors:\n' + newErrors.map((e) => '  - ' + e).join('\n')
      );
    }
    expect(newErrors).toEqual([]);
  });

  it('keeps the baseline tight: every known error is still reported', () => {
    // If you fix one of the known errors, remove it from the set above;
    // this guards against the baseline silently going stale.
    const errors = new Set(validateCorpus());
    const stale = [...KNOWN_VALIDATE_CORPUS_ERRORS].filter((e) => !errors.has(e));
    expect(stale).toEqual([]);
  });

  it('every section reachable via sectionsPreview conforms to the TextSection schema', () => {
    const texts = CorpusDB.getTexts();
    const allIssues: string[] = [];
    for (const text of texts) {
      for (const preview of text.sectionsPreview ?? []) {
        const section = CorpusDB.getSection(preview.id);
        if (!section) continue; // surfaced separately by validateCorpus
        const issues = validateSection(section, `${text.id}/${preview.id}`);
        for (const i of issues) {
          allIssues.push(`${i.path}: ${i.message}`);
        }
      }
    }
    if (allIssues.length > 0) {
      console.error('Section schema issues:\n' + allIssues.map((m) => '  - ' + m).join('\n'));
    }
    expect(allIssues).toEqual([]);
  });
});

describe('complete vs excerpt labeling', () => {
  it('reports no "marked complete but too short" errors over the real corpus', () => {
    const offenders = validateCorpus().filter((e) => /marked complete but only has/.test(e));
    if (offenders.length > 0) {
      console.error('Short-complete offenders:\n' + offenders.map((e) => '  - ' + e).join('\n'));
    }
    expect(offenders).toEqual([]);
  });

  it('every short "complete" text is an explicitly vetted whole work', () => {
    // Lock the invariant directly: any complete text under the threshold MUST be
    // in the allowlist. A new short "complete" text fails here until vetted.
    const violations = CorpusDB.getTexts()
      .filter((t) => t.isComplete || t.sourceStatus === 'complete')
      .filter((t) => actualSentenceCount(t.id) < SHORT_COMPLETE_THRESHOLD)
      .filter((t) => !COMPLETE_SHORT_WORKS.has(t.id))
      .map((t) => t.id);
    expect(violations).toEqual([]);
  });

  it('keeps an allowlisted short work (Psalm 23) as complete', () => {
    const ps23 = CorpusDB.getText('Ps-23');
    expect(ps23?.sourceStatus).toBe('complete');
    expect(ps23?.isComplete).toBe(true);
    expect(actualSentenceCount('Ps-23')).toBeLessThan(SHORT_COMPLETE_THRESHOLD);
  });

  it('reclassifies opening-selection excerpts of larger works as excerpt + sample', () => {
    const reclassified = [
      // Biblical chapter/book excerpts
      'Jn-1', 'Gen', 'Anab-1', 'Iliad-1', 'Aeneid-1', 'GrcMk',
      'LXX-Gen-1', 'LXX-Exod-12', 'LXX-Isa-6', 'LXX-Prov-1', 'LXX-Jonah-1',
      // Classics — opening selections of huge works
      'Livy-AUC', 'Sall-Cat', 'Tac-Ann', 'Hdt-Hist', 'Thuc-Hist',
      'Soph-Ant', 'Plut-Alex', 'Lucian-Char', 'Aesop-1',
      // Patristics / beginner — opening sections of larger works
      '1Clem-1', 'Did-1', 'Athan-Inc-1', 'Chrys-Jn-1', 'Hermas-Vis-1',
      'Basil-Hex-1', 'Ign-Eph', 'Justin-Apol', 'Polyc-Phil',
      'Lat-Vg-Jn', 'Lat-Cato',
    ];
    for (const id of reclassified) {
      const t = CorpusDB.getText(id);
      expect(t, `missing text ${id}`).toBeTruthy();
      expect(t?.sourceStatus, `${id} sourceStatus`).toBe('excerpt');
      expect(t?.isComplete, `${id} isComplete`).not.toBe(true);
      expect(t?.isSample, `${id} isSample`).toBe(true);
    }
  });

  it('derives sentenceCount from real sections (no declared/actual drift)', () => {
    for (const t of CorpusDB.getTexts()) {
      const actual = actualSentenceCount(t.id);
      if (actual > 0) {
        expect(t.sentenceCount, `${t.id} sentenceCount`).toBe(actual);
      }
    }
  });
});
