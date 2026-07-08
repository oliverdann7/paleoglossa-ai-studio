import { CorpusDB } from '../corpus.js';
import type { Text, TextSection } from '../../types/corpus.js';

/**
 * Texts that are genuinely COMPLETE works yet legitimately fall under the
 * short-text threshold below — a single psalm is a whole poem, the *Mini
 * stories are original whole pieces. Any other `complete` text under the
 * threshold is treated as a mislabeled excerpt and fails validation, forcing
 * an explicit human decision (reclassify as 'excerpt' or add it here).
 */
export const COMPLETE_SHORT_WORKS = new Set<string>([
  'Ps-23',
  'Heb-Ps23',
  'LXX-Ps-1',
  'LXX-Ps-33',
  'LXX-Ps-50',
  'Heb-Ps91',
  'CopMini',
  'SyrMini',
  'ArcMini',
  'SanMini',
  'HebMini',
]);

/** A `complete` text below this many sentences must be in COMPLETE_SHORT_WORKS. */
export const SHORT_COMPLETE_THRESHOLD = 15;

const errors: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) errors.push(message);
}

/**
 * Per-text completeness check, decoupled from CorpusDB so it can be run against
 * a single not-yet-shipped text (e.g. inside the ingestion pipeline before
 * writing to Firestore). Returns a list of human-readable problems; an empty
 * array means the text satisfies the "complete" contract: every token in every
 * section has a real partOfSpeech (not 'unknown'), a non-empty gloss, and a
 * non-empty lemma.
 *
 * This is the same gate {@link validateCorpus} applies to bundled texts — kept
 * as a standalone function so the pipeline and the bundle share one source of
 * truth for what "complete" means. The returned message text matches what
 * validateCorpus emits, so callers/tests see identical strings.
 */
export function validateTextAnnotations(
  text: Pick<Text, 'id'>,
  sections: Pick<TextSection, 'id' | 'sentences'>[]
): string[] {
  let unknownPos = 0;
  let missingGloss = 0;
  let missingLemma = 0;
  let totalTokens = 0;

  for (const section of sections) {
    for (const sentence of section.sentences) {
      for (const token of sentence.tokens) {
        totalTokens++;
        if (!token.morphology || token.morphology.partOfSpeech === 'unknown') {
          unknownPos++;
        }
        if (!token.gloss || token.gloss.trim() === '') {
          missingGloss++;
        }
        if (!token.lemma || token.lemma.trim() === '') {
          missingLemma++;
        }
      }
    }
  }

  if (totalTokens > 0 && (unknownPos > 0 || missingGloss > 0 || missingLemma > 0)) {
    return [
      `Text "${text.id}" is marked complete but has annotation gaps: ` +
        `${unknownPos} unknown POS, ${missingGloss} missing gloss, ${missingLemma} missing lemma ` +
        `(of ${totalTokens} tokens). Either complete the annotations or change sourceStatus to 'partial'.`,
    ];
  }
  return [];
}

export function validateCorpus(): string[] {
  const texts = CorpusDB.getTexts();

  for (const text of texts) {
    // Every text has at least one section
    check(
      !!(text.sectionsPreview && text.sectionsPreview.length > 0),
      `Text "${text.id}" has no sectionsPreview`
    );

    // Every text with isSample=false should have sourceStatus set
    if (!text.isSample) {
      check(
        !!(text.sourceStatus === 'partial' || text.sourceStatus === 'complete'),
        `Text "${text.id}" has isSample=false but sourceStatus is "${text.sourceStatus}"`
      );
    }

    // Sample texts should have isSample=true
    if (text.sourceStatus === 'excerpt') {
      check(
        text.isSample === true,
        `Text "${text.id}" has sourceStatus=excerpt but isSample is not true`
      );
    }

    // Complete texts should have isComplete=true
    if (text.sourceStatus === 'complete') {
      check(
        text.isComplete === true,
        `Text "${text.id}" has sourceStatus=complete but isComplete is not true`
      );
    }

    // Texts with remoteSections ship only metadata in the bundle — their
    // sections live in the served corpus (static /corpus-data JSON or
    // Firestore), where the ingestion pipeline enforces this same completeness
    // gate (validateTextAnnotations) at emit time. The bundled-section checks
    // below would all read "missing" for them, so skip; the served JSON is
    // covered by validation.test.ts instead.
    if (text.remoteSections) continue;

    // Every section referenced in sectionsPreview exists
    for (const preview of text.sectionsPreview || []) {
      const section = CorpusDB.getSection(preview.id);
      check(!!section, `Text "${text.id}" references section "${preview.id}" but it was not found`);
      if (section) {
        check(
          section.sentences.length > 0,
          `Section "${section.id}" (text "${text.id}") has zero sentences`
        );
        // Check nextSectionId/previousSectionId exist if they reference other sections
        if (section.nextSectionId) {
          const nextSection = CorpusDB.getSection(section.nextSectionId);
          check(
            !!nextSection,
            `Section "${section.id}" references nextSectionId "${section.nextSectionId}" which was not found`
          );
        }
        if (section.previousSectionId) {
          const prevSection = CorpusDB.getSection(section.previousSectionId);
          check(
            !!prevSection,
            `Section "${section.id}" references previousSectionId "${section.previousSectionId}" which was not found`
          );
        }
      }
    }

    // A text claiming completeness must either clear the short-text threshold or
    // be an explicitly vetted short complete work. Otherwise it is almost
    // certainly a mislabeled excerpt — fail so a human reclassifies it.
    if (text.isComplete || text.sourceStatus === 'complete') {
      const totalSentences = (text.sectionsPreview || []).reduce((sum, p) => {
        const s = CorpusDB.getSection(p.id);
        return sum + (s ? s.sentences.length : 0);
      }, 0);
      check(
        totalSentences >= SHORT_COMPLETE_THRESHOLD || COMPLETE_SHORT_WORKS.has(text.id),
        `Text "${text.id}" is marked complete but only has ${totalSentences} sentences and is not in COMPLETE_SHORT_WORKS — reclassify it as 'excerpt' (isSample:true) or add it to the allowlist.`
      );
    }

    // Truthful-count gate: a text marked complete must not claim materially
    // more sentences than it actually ships. A famous large work represented
    // by a handful of opening sentences (but advertising sentenceCount in the
    // hundreds) reads as "complete" in the library when it is really a sparse
    // excerpt — mark it `partial` and set sentenceCount to the real total.
    if ((text.sourceStatus === 'complete' || text.isComplete) && text.sentenceCount) {
      const actualSentences = (text.sectionsPreview || []).reduce((sum, p) => {
        const s = CorpusDB.getSection(p.id);
        return sum + (s ? s.sentences.length : 0);
      }, 0);
      check(
        actualSentences >= text.sentenceCount * 0.7,
        `Text "${text.id}" is marked complete with sentenceCount=${text.sentenceCount} but only ` +
          `${actualSentences} sentences are actually present. Either add the missing content, ` +
          `correct sentenceCount, or change sourceStatus to 'partial'.`
      );
    }

    // Completeness gate: a text marked complete must have every token in every
    // section annotated with a real partOfSpeech (not 'unknown') and a non-empty
    // gloss. Lemma must also be set. Texts that fail this should be marked
    // `partial` until the gaps are filled.
    if (text.sourceStatus === 'complete' || text.isComplete) {
      const sections = (text.sectionsPreview || [])
        .map((preview) => CorpusDB.getSection(preview.id))
        .filter((s): s is NonNullable<typeof s> => !!s);
      for (const message of validateTextAnnotations(text, sections)) {
        errors.push(message);
      }
    }
  }

  // Corpus definitions are consistent
  for (const text of texts) {
    if (text.id.startsWith('mock-')) continue; // Mock texts use synthetic corpus IDs
    const corpus = CorpusDB.getCorpusOverview(text.corpusId);
    check(!!corpus, `Corpus "${text.corpusId}" referenced by text "${text.id}" does not exist`);
  }

  return errors;
}

export function runCorpusValidation(): { valid: boolean; messages: string[] } {
  const msgs = validateCorpus();
  if (msgs.length === 0) {
    return { valid: true, messages: ['All checks passed'] };
  }
  console.warn(`✗ Corpus validation found ${msgs.length} issue(s):`);
  msgs.forEach((m) => console.warn(`  - ${m}`));
  return { valid: false, messages: msgs };
}
