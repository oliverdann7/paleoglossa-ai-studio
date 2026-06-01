import { CorpusDB } from '../corpus.js';

const errors: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) errors.push(message);
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

    // Complete texts should not be suspiciously tiny (skip very short works like Psalm 23)
    if (text.isComplete) {
      const totalSentences = (text.sectionsPreview || []).reduce((sum, p) => {
        const s = CorpusDB.getSection(p.id);
        return sum + (s ? s.sentences.length : 0);
      }, 0);
      check(
        totalSentences >= 3,
        `Text "${text.id}" is marked as complete but only has ${totalSentences} sentences (too small to be complete)`
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
      let unknownPos = 0;
      let missingGloss = 0;
      let missingLemma = 0;
      let totalTokens = 0;
      for (const preview of text.sectionsPreview || []) {
        const section = CorpusDB.getSection(preview.id);
        if (!section) continue;
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
        errors.push(
          `Text "${text.id}" is marked complete but has annotation gaps: ` +
            `${unknownPos} unknown POS, ${missingGloss} missing gloss, ${missingLemma} missing lemma ` +
            `(of ${totalTokens} tokens). Either complete the annotations or change sourceStatus to 'partial'.`
        );
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
    console.log(`✓ Corpus validation passed: ${CorpusDB.getTexts().length} texts checked`);
    return { valid: true, messages: ['All checks passed'] };
  }
  console.warn(`✗ Corpus validation found ${msgs.length} issue(s):`);
  msgs.forEach((m) => console.warn(`  - ${m}`));
  return { valid: false, messages: msgs };
}
