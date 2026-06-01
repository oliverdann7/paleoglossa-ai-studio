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
    hasMorphology: true,
    hasTranslation: sections.some((s) => s.sentences.some((sn) => !!sn.translation)),
    ...meta,
    sourceStatus: complete ? 'complete' : 'partial',
    isComplete: complete,
    isSample: false,
    sentenceCount,
    sectionsPreview,
  };

  return { text, sections, problems, complete };
}
