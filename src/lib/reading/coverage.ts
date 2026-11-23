/**
 * How much of a text a learner already knows, measured on lemmas.
 *
 * Served texts bundle no tokens, so each language ships one small "lemma
 * profile" (`public/corpus-data/lemma-profiles/<language>.json`, written by
 * `scripts/corpus/build-lemma-profiles.ts`): the distinct vocabulary keys of
 * every served text with their token counts. Bundled samples are measured from
 * their own tokens with the same functions.
 *
 * A token is identified exactly as the reader identifies it: its lemma, or its
 * surface form when it has none, normalized for the language.
 *
 * Pure module: no Firebase, no React, no fetch.
 */
import { normalizeLemma } from '../vocabulary/identity.js';

export const LEMMA_PROFILE_VERSION = 1;

export interface LemmaProfileFile {
  version: number;
  language: string;
  /** Normalized lemmas of the language, shared by every text below. */
  lemmas: string[];
  texts: Record<
    string,
    {
      /** Word tokens in the text. */
      tokens: number;
      /** Flat pairs: index into `lemmas`, occurrences in this text. */
      counts: number[];
    }
  >;
}

export interface TextCoverage {
  /** Share of running words whose lemma is known or familiar, 0–100. */
  percentKnown: number;
  /** Distinct lemmas the learner has never met. */
  newLemmas: number;
  totalLemmas: number;
}

/** The knowledge state of a normalized lemma; unknown lemmas are 'NEW'. */
export type LemmaStateLookup = (normalizedLemma: string) => string;

interface TokenLike {
  lemma?: string;
  surface?: string;
  text?: string;
  type?: string;
}

const HAS_LETTER = /\p{L}/u;

/** Distinct vocabulary keys of a run of tokens, with how often each occurs. */
export function countLemmas(tokens: Iterable<TokenLike>, languageId: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    if (token.type === 'punctuation' || token.type === 'whitespace') continue;
    const form = token.lemma || token.surface || token.text || '';
    if (!HAS_LETTER.test(form)) continue;
    const key = normalizeLemma(form, languageId);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

const isKnown = (state: string) => state === 'KNOWN' || state === 'FAMILIAR';

export function coverageOf(
  counts: Iterable<[lemma: string, count: number]>,
  stateOf: LemmaStateLookup
): TextCoverage | null {
  let tokens = 0;
  let knownTokens = 0;
  let totalLemmas = 0;
  let newLemmas = 0;
  for (const [lemma, count] of counts) {
    const state = stateOf(lemma);
    tokens += count;
    totalLemmas++;
    if (isKnown(state)) knownTokens += count;
    else if (state === 'NEW') newLemmas++;
  }
  if (tokens === 0) return null;
  return { percentKnown: Math.round((knownTokens / tokens) * 100), newLemmas, totalLemmas };
}

/** Pack per-text lemma counts into one profile file for a language. */
export function buildLemmaProfile(
  language: string,
  texts: Iterable<[textId: string, counts: Map<string, number>]>
): LemmaProfileFile {
  const index = new Map<string, number>();
  const lemmas: string[] = [];
  const out: LemmaProfileFile['texts'] = {};
  for (const [textId, counts] of texts) {
    const flat: number[] = [];
    let tokens = 0;
    for (const [lemma, count] of [...counts].sort((a, b) => a[0].localeCompare(b[0]))) {
      let at = index.get(lemma);
      if (at === undefined) {
        at = lemmas.length;
        lemmas.push(lemma);
        index.set(lemma, at);
      }
      flat.push(at, count);
      tokens += count;
    }
    out[textId] = { tokens, counts: flat };
  }
  return { version: LEMMA_PROFILE_VERSION, language, lemmas, texts: out };
}

/** Coverage of every text in a profile. Each lemma's state is looked up once. */
export function coverageFromProfile(
  profile: LemmaProfileFile,
  stateOf: LemmaStateLookup
): Map<string, TextCoverage> {
  const states: (string | undefined)[] = new Array(profile.lemmas.length);
  const stateAt = (at: number) => (states[at] ??= stateOf(profile.lemmas[at] ?? ''));
  const result = new Map<string, TextCoverage>();
  for (const [textId, entry] of Object.entries(profile.texts)) {
    const pairs: [string, number][] = [];
    for (let i = 0; i + 1 < entry.counts.length; i += 2) {
      pairs.push([profile.lemmas[entry.counts[i]] ?? '', entry.counts[i + 1]]);
    }
    const coverage = coverageOf(pairs, (lemma) => stateAt(index(profile, lemma)));
    if (coverage) result.set(textId, coverage);
  }
  return result;
}

const indexCache = new WeakMap<LemmaProfileFile, Map<string, number>>();
function index(profile: LemmaProfileFile, lemma: string): number {
  let map = indexCache.get(profile);
  if (!map) {
    map = new Map(profile.lemmas.map((l, i) => [l, i]));
    indexCache.set(profile, map);
  }
  return map.get(lemma) ?? -1;
}
