import { describe, it, expect } from 'vitest';
import { validateCorpus } from './validation';
import { CorpusDB } from '../corpus';
import { validateSection } from '../../lib/corpus-schema/validateSection';

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
    'Text "GrcMk" has sourceStatus=complete but isComplete is not true',
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
    'Text "Jn-full" is marked complete but has annotation gaps: 15620 unknown POS, 15620 missing gloss, 5 missing lemma (of 15620 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
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
