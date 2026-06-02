/**
 * Stage 2 — annotate.
 *
 * Merges token-level annotations from an external scholarly source
 * (treebank / morphology table) into the canonical sections produced by
 * segment(). Annotations are keyed POSITIONALLY (sentenceId + token index) so a
 * surface form that repeats inside a sentence is never mis-matched.
 *
 * Source-specific adapters (e.g. MorphGNT/Macula, PROIEL) live under
 * ./sources/ and emit {@link TokenAnnotation}[]; this stage applies them
 * uniformly. Tokens with no matching annotation keep partOfSpeech 'unknown'
 * and an empty gloss/lemma, leaving them for the glossFill stage / the
 * completeness gate to flag.
 */

import type { TextSection, TokenAnnotation } from './types.js';

function key(sentenceId: string, index: number): string {
  return `${sentenceId}#${index}`;
}

/**
 * Returns a new section list with annotations merged in. Original input is not
 * mutated. Counts how many tokens were annotated for reporting.
 */
export function applyAnnotations(
  sections: TextSection[],
  annotations: TokenAnnotation[]
): { sections: TextSection[]; matched: number; unmatched: TokenAnnotation[] } {
  const byKey = new Map<string, TokenAnnotation>();
  for (const a of annotations) byKey.set(key(a.sentenceId, a.index), a);

  const usedKeys = new Set<string>();
  let matched = 0;

  const out = sections.map((section) => ({
    ...section,
    sentences: section.sentences.map((sentence) => ({
      ...sentence,
      tokens: sentence.tokens.map((tok, idx) => {
        const a = byKey.get(key(sentence.id, idx));
        if (!a) return tok;
        usedKeys.add(key(sentence.id, idx));
        matched++;
        const morphology =
          a.morphology && Object.keys(a.morphology).length > 0
            ? { partOfSpeech: 'unknown', ...a.morphology }
            : tok.morphology;
        return {
          ...tok,
          lemma: a.lemma ?? tok.lemma,
          gloss: a.gloss ?? tok.gloss,
          transliteration: a.transliteration ?? tok.transliteration,
          punctAfter: a.after ?? tok.punctAfter,
          morphology,
        };
      }),
    })),
  }));

  const unmatched = annotations.filter((a) => !usedKeys.has(key(a.sentenceId, a.index)));
  return { sections: out, matched, unmatched };
}
