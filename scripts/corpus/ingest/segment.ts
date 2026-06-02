/**
 * Stage 1 — segment.
 *
 * Turns a {@link WorkInput} (raw source strings) into canonical
 * {@link TextSection}[] with tokenised sentences. At this stage tokens have
 * NO lemma/gloss/morphology yet — every token carries `partOfSpeech: 'unknown'`
 * and an empty gloss/lemma. The annotate + glossFill stages fill those in.
 *
 * Word-splitting is delegated to the project's standard
 * {@link tokenizeSentence} helper so segmented output is byte-identical in
 * shape to hand-authored bundled sections.
 */

import { tokenizeSentence } from '../../../src/data/corpus/helpers/textHelpers.js';
import type { Sentence, TextSection, WorkInput } from './types.js';

/** Tokenise one raw sentence into a canonical, not-yet-annotated `Sentence`. */
export function segmentSentence(id: string, src: string, translation?: string): Sentence {
  const raw = tokenizeSentence(id, src);
  return {
    id,
    translation,
    tokens: raw.map((t) => ({
      id: t.id,
      surface: t.surface,
      normalized: t.normalized,
      lemma: t.lemma === t.normalized ? '' : t.lemma, // helper defaults lemma→normalized; treat as "not yet set"
      gloss: t.gloss,
      morphology: { partOfSpeech: 'unknown' },
      transliteration: t.transliteration,
      punctBefore: t.punctBefore,
      punctAfter: t.punctAfter,
    })),
  };
}

/** Segment an entire work into canonical (un-annotated) sections. */
export function segmentWork(work: WorkInput): TextSection[] {
  return work.sections.map((section) => ({
    id: section.id,
    textId: work.textId,
    sequence: section.sequence,
    label: section.label,
    nextSectionId: section.nextSectionId,
    previousSectionId: section.previousSectionId,
    sentences: section.sentences.map((s) => segmentSentence(s.id, s.src, s.translation)),
  }));
}
