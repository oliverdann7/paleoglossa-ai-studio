/**
 * Phrase vocabulary — a run of consecutive words in one sentence, saved as a
 * single vocabulary item (a Homeric formula, a construct chain, an idiom).
 *
 * A phrase is identified like any vocabulary item: by language and its text
 * (`vocabKey(phraseText, languageId)`). It additionally carries `kind:
 * 'phrase'` and the lemmas of its member words. Pure functions only.
 */
import { normalizeLemma } from '../vocabulary/identity.js';

/** Longest phrase that can be saved; beyond this it is a sentence, not a phrase. */
export const MAX_PHRASE_WORDS = 12;

interface TokenLike {
  id: string;
  text: string;
  lemma?: string;
  type?: string;
}

const isWord = (t: TokenLike) => t.type !== 'whitespace' && t.type !== 'punctuation' && !!t.text;

export interface PhraseSelection {
  /** Token indices within the sentence, inclusive, start ≤ end; both are words. */
  start: number;
  end: number;
  /** The words in order, joined by single spaces. */
  text: string;
  /** Lemma of each member word (surface form where a token has none). */
  memberLemmas: string[];
  wordCount: number;
}

/**
 * The phrase between two tokens of one sentence, in either order.
 * Returns null for a single word, an unknown token, or a run that is too long.
 */
export function selectPhrase(
  tokens: TokenLike[],
  anchorId: string,
  targetId: string
): PhraseSelection | null {
  const a = tokens.findIndex((t) => t.id === anchorId);
  const b = tokens.findIndex((t) => t.id === targetId);
  if (a < 0 || b < 0 || a === b) return null;
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const words = tokens.slice(start, end + 1).filter(isWord);
  if (words.length < 2 || words.length > MAX_PHRASE_WORDS) return null;
  if (!isWord(tokens[start]) || !isWord(tokens[end])) return null;
  return {
    start,
    end,
    text: words.map((w) => w.text.trim()).join(' '),
    memberLemmas: words.map((w) => w.lemma || w.text),
    wordCount: words.length,
  };
}

/** A saved phrase prepared for matching: one normalized form per word. */
export type PhrasePattern = string[];

export function phrasePattern(text: string, languageId: string): PhrasePattern {
  return text
    .split(/\s+/)
    .map((w) => normalizeLemma(w, languageId))
    .filter(Boolean);
}

/**
 * Token indices of a sentence that fall inside any saved phrase. Matching is
 * on normalized surface forms, word by word, so a phrase saved in one text is
 * recognised wherever the same words recur.
 */
export function phraseTokenIndices(
  tokens: TokenLike[],
  patterns: PhrasePattern[],
  languageId: string
): Set<number> {
  const hit = new Set<number>();
  if (patterns.length === 0) return hit;
  const words: Array<{ at: number; form: string }> = [];
  tokens.forEach((t, at) => {
    if (isWord(t)) words.push({ at, form: normalizeLemma(t.text, languageId) });
  });
  for (const pattern of patterns) {
    if (pattern.length < 2 || pattern.length > words.length) continue;
    for (let i = 0; i + pattern.length <= words.length; i++) {
      let match = true;
      for (let j = 0; j < pattern.length; j++) {
        if (words[i + j].form !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (!match) continue;
      // Mark everything between the first and last word, punctuation included.
      for (let at = words[i].at; at <= words[i + pattern.length - 1].at; at++) hit.add(at);
    }
  }
  return hit;
}
