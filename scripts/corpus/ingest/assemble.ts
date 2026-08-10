/**
 * Stage 4 — assemble + validate.
 *
 * Combines annotated, gloss-filled sections with metadata into a canonical
 * {@link Text} + {@link TextSection}[] pair, then runs the SHARED completeness
 * gate ({@link validateTextAnnotations}) — the exact check the bundled corpus
 * uses. A text only earns `sourceStatus: 'complete'` / `isComplete: true` when
 * every token has a real POS, a non-empty gloss, and a non-empty lemma;
 * otherwise it is downgraded to `'partial'` and the gaps are reported. Nothing
 * is ever silently shipped as complete.
 */

import { validateTextAnnotations } from '../../../src/data/corpus/validation.js';
import type { IngestedText, Text, TextSection } from './types.js';

export interface AssembleResult extends IngestedText {
  /** Empty when the text passed the completeness gate. */
  problems: string[];
  complete: boolean;
}

/**
 * A capability flag is earned, not declared: `hasMorphology` requires ≥90% of
 * tokens to carry a real POS, `hasTranslation` requires ≥90% of sentences to
 * carry a translation. (The 2026-08 audit found `hasMorphology: true` on 38
 * served texts with 0% POS — flags must always be derived from the data.)
 */
const CAPABILITY_COVERAGE_THRESHOLD = 0.9;

export function computeCapabilityFlags(sections: TextSection[]): {
  hasMorphology: boolean;
  hasTranslation: boolean;
} {
  let tokens = 0;
  let tagged = 0;
  let sentences = 0;
  let translated = 0;
  for (const section of sections) {
    for (const sentence of section.sentences) {
      sentences++;
      if (sentence.translation && sentence.translation.trim() !== '') translated++;
      for (const token of sentence.tokens) {
        tokens++;
        const pos = token.morphology?.partOfSpeech;
        if (pos && pos !== 'unknown') tagged++;
      }
    }
  }
  return {
    hasMorphology: tokens > 0 && tagged / tokens >= CAPABILITY_COVERAGE_THRESHOLD,
    hasTranslation: sentences > 0 && translated / sentences >= CAPABILITY_COVERAGE_THRESHOLD,
  };
}

export function assembleText(
  textId: string,
  language: string,
  meta: Partial<Text> & { title: string },
  sections: TextSection[]
): AssembleResult {
  const sentenceCount = sections.reduce((n, s) => n + s.sentences.length, 0);
  const sectionsPreview = sections.map((s) => ({ id: s.id, label: s.label }));

  const problems = validateTextAnnotations({ id: textId }, sections);
  const complete = problems.length === 0;

  const text: Text = {
    id: textId,
    corpusId: meta.corpusId ?? `${language.toUpperCase()}_FIRESTORE`,
    language,
    ...computeCapabilityFlags(sections),
    ...meta,
    sourceStatus: complete ? 'complete' : 'partial',
    isComplete: complete,
    isSample: false,
    sentenceCount,
    sectionsPreview,
  };

  return { text, sections, problems, complete };
}
