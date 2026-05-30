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
    'Text "Jn-1" is marked complete but has annotation gaps: 191 unknown POS, 191 missing gloss, 0 missing lemma (of 252 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Jn-full" is marked complete but has annotation gaps: 15620 unknown POS, 15620 missing gloss, 5 missing lemma (of 15620 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Gen" is marked complete but has annotation gaps: 354 unknown POS, 354 missing gloss, 0 missing lemma (of 400 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Aeneid-1" is marked complete but has annotation gaps: 398 unknown POS, 398 missing gloss, 0 missing lemma (of 433 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Ps-23" is marked complete but has annotation gaps: 33 unknown POS, 33 missing gloss, 0 missing lemma (of 44 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Anab-1" is marked complete but has annotation gaps: 261 unknown POS, 261 missing gloss, 0 missing lemma (of 314 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Iliad-1" is marked complete but has annotation gaps: 432 unknown POS, 432 missing gloss, 0 missing lemma (of 465 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Gen-1" is marked complete but has annotation gaps: 721 unknown POS, 721 missing gloss, 0 missing lemma (of 721 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Ps-1" is marked complete but has annotation gaps: 110 unknown POS, 110 missing gloss, 0 missing lemma (of 110 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Ps-33" is marked complete but has annotation gaps: 131 unknown POS, 131 missing gloss, 0 missing lemma (of 131 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Exod-12" is marked complete but has annotation gaps: 424 unknown POS, 424 missing gloss, 0 missing lemma (of 424 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Isa-6" is marked complete but has annotation gaps: 208 unknown POS, 208 missing gloss, 0 missing lemma (of 208 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Prov-1" is marked complete but has annotation gaps: 109 unknown POS, 109 missing gloss, 0 missing lemma (of 109 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Ps-50" is marked complete but has annotation gaps: 165 unknown POS, 165 missing gloss, 0 missing lemma (of 165 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LXX-Jonah-1" is marked complete but has annotation gaps: 308 unknown POS, 308 missing gloss, 0 missing lemma (of 308 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "GrcMini" is marked complete but has annotation gaps: 409 unknown POS, 409 missing gloss, 0 missing lemma (of 409 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "GrcMk" is marked complete but has annotation gaps: 431 unknown POS, 431 missing gloss, 0 missing lemma (of 431 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "LatMini" is marked complete but has annotation gaps: 319 unknown POS, 319 missing gloss, 0 missing lemma (of 319 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Heb-Ps23" is marked complete but has annotation gaps: 37 unknown POS, 37 missing gloss, 0 missing lemma (of 48 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Heb-Jonah" is marked complete but has annotation gaps: 315 unknown POS, 315 missing gloss, 0 missing lemma (of 315 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
    'Text "Heb-Ps91" is marked complete but has annotation gaps: 61 unknown POS, 61 missing gloss, 0 missing lemma (of 61 tokens). Either complete the annotations or change sourceStatus to \'partial\'.',
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
