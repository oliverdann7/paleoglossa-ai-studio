/**
 * Junk-token rules shared by the ingest pipeline (segment stage) and the
 * served-corpus maintenance script (`scripts/corpus/clean-served-corpus.ts`).
 *
 * "Junk" is editorial noise that leaked into token streams from raw sources:
 * critical-apparatus sigla (`|`, `+`, `om`, `Qᵐᵍ`), un-decoded escapes
 * (`u+05d0`), section markers (`§`, `¶`), and bare chapter/verse numbers.
 * The 2026-08 served-corpus audit found ~20k such tokens concentrated in the
 * CATSS-derived LXX texts and the Latin Library scrapes.
 *
 * Rules are deliberately conservative: a token is junk only when it can never
 * be a real word of the text's language.
 */

/** Whole token is punctuation/symbols/whitespace. */
const PUNCT_ONLY = /^[\p{P}\p{S}\s]+$/u;

/** Bare chapter/verse/line numbers (`3`, `1:12`, `24.7`). */
const DIGIT_ONLY = /^\d+([.,:;·–—-]\d+)*$/;

/** Un-decoded Unicode escape leaked from a source conversion (`u+05d0`). */
const UNDECODED_ESCAPE = /^u\+[0-9a-f]{3,6}$/i;

/**
 * Primary-script requirement per language. For languages written in a
 * non-Latin script, a token with NO character of that script is apparatus
 * noise (English marginalia, sigla, transliteration fragments) by definition.
 * Latin-script and transliteration-based languages (lat, akk, hit, egy, uga)
 * get no script rule — Latin letters are their real content.
 */
const PRIMARY_SCRIPT: Record<string, RegExp> = {
  grc: /[Ͱ-Ͽἀ-῿]/,
  'grc-koine': /[Ͱ-Ͽἀ-῿]/,
  'grc-class': /[Ͱ-Ͽἀ-῿]/,
  hbo: /[֐-׿]/,
  arc: /[֐-׿]/,
  syr: /[܀-ݏ]/,
  // Coptic uses its own block plus letters from the Greek-and-Coptic block.
  cop: /[Ⲁ-⳿Ͱ-Ͽ]/,
  san: /[ऀ-ॿ]/,
};

export function isJunkToken(surface: string, languageId: string): boolean {
  const s = surface.trim();
  if (!s) return true;
  if (PUNCT_ONLY.test(s)) return true;
  if (DIGIT_ONLY.test(s)) return true;
  if (UNDECODED_ESCAPE.test(s)) return true;
  const script = PRIMARY_SCRIPT[languageId];
  if (script && !script.test(s)) return true;
  return false;
}

interface CleanableToken {
  surface: string;
}
interface CleanableSentence {
  tokens: CleanableToken[];
}
interface CleanableSection {
  sentences: CleanableSentence[];
}

export interface CleanStats {
  tokensRemoved: number;
  sentencesRemoved: number;
}

/**
 * Remove junk tokens (and sentences left empty by the removal) in place.
 * Returns what was dropped so callers can log/resync counts.
 */
export function cleanSections(sections: CleanableSection[], languageId: string): CleanStats {
  const stats: CleanStats = { tokensRemoved: 0, sentencesRemoved: 0 };
  for (const section of sections) {
    for (const sentence of section.sentences) {
      const kept = sentence.tokens.filter((t) => !isJunkToken(t.surface, languageId));
      stats.tokensRemoved += sentence.tokens.length - kept.length;
      sentence.tokens = kept;
    }
    const keptSentences = section.sentences.filter((s) => s.tokens.length > 0);
    stats.sentencesRemoved += section.sentences.length - keptSentences.length;
    section.sentences = keptSentences;
  }
  return stats;
}
