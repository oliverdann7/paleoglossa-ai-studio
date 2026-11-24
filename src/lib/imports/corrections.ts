/**
 * Confidence and corrections for the tokens of a user import.
 *
 * The analysis of an imported text is automatic, and says how sure it is of
 * each word. A learner who knows better can correct a word's lemma; the
 * correction is stored on the import, applies to every occurrence of the same
 * form, and from then on that form is tracked under the corrected lemma.
 *
 * Pure module.
 */

/** Below this the analysis itself calls the word a guess (0.5 = "unsure"). */
export const LOW_CONFIDENCE = 0.6;

interface TokenLike {
  text: string;
  lemma?: string;
  type?: string;
  confidence?: number | null;
  corrected?: boolean;
}

interface SentenceLike<T extends TokenLike> {
  tokens: T[];
}

const isWord = (token: TokenLike) => token.type === undefined || token.type === 'word';

/** A word the analysis was unsure of and nobody has checked. */
export function isUncertain(token: TokenLike): boolean {
  return (
    isWord(token) &&
    !token.corrected &&
    typeof token.confidence === 'number' &&
    token.confidence < LOW_CONFIDENCE
  );
}

export function countUncertain(sentences: SentenceLike<TokenLike>[]): number {
  let count = 0;
  for (const sentence of sentences) {
    for (const token of sentence.tokens) if (isUncertain(token)) count++;
  }
  return count;
}

export interface LemmaCorrectionTarget {
  /** The form as it stands in the text. */
  surface: string;
  /** The lemma it has now. */
  lemma: string;
}

/**
 * Give every occurrence of one form a new lemma. Only tokens with the same
 * surface form *and* the same current lemma change, so a homograph analysed
 * differently elsewhere is left alone. Untouched sentences keep their identity.
 */
export function applyLemmaCorrection<T extends TokenLike, S extends SentenceLike<T>>(
  sentences: S[],
  target: LemmaCorrectionTarget,
  newLemma: string
): { sentences: S[]; changed: number } {
  const lemma = newLemma.trim();
  if (!lemma) return { sentences, changed: 0 };
  let changed = 0;
  const next = sentences.map((sentence) => {
    let touched = false;
    const tokens = sentence.tokens.map((token) => {
      if (!isWord(token) || token.text !== target.surface) return token;
      if ((token.lemma || token.text) !== target.lemma) return token;
      if (token.lemma === lemma && token.corrected) return token;
      touched = true;
      changed++;
      return { ...token, lemma, corrected: true };
    });
    return touched ? { ...sentence, tokens } : sentence;
  });
  return { sentences: changed > 0 ? next : sentences, changed };
}
